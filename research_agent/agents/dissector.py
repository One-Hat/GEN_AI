import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from research_agent.schemas import PaperCard, GroundedClaim, PaperSearchResult
from research_agent.agents.llm_client import LocalLLMClient
from research_agent.agents.verifier import GroundingVerifier
from research_agent.config import CARDS_CACHE_DIR


class PaperDissector:
    """Dissects parsed paper sections into a standardized PaperCard using scoped prompts."""

    def __init__(self, llm_client: LocalLLMClient = None):
        self.llm = llm_client or LocalLLMClient()
        self.verifier = GroundingVerifier(self.llm)

    def dissect(self, search_res: PaperSearchResult, parsed_sections: Dict[str, str]) -> PaperCard:
        # Check cache first
        cached_card = self._load_from_cache(search_res.paper_id)
        if cached_card:
            return cached_card

        abstract_text = parsed_sections.get("abstract") or search_res.abstract
        method_text = parsed_sections.get("method") or parsed_sections.get("full_text", "")[:4000]
        experiments_text = parsed_sections.get("experiments") or parsed_sections.get("full_text", "")[4000:8000]
        limitations_text = (
            parsed_sections.get("limitations")
            or parsed_sections.get("conclusion")
            or experiments_text
        )

        # 1. Core Claim & Novelty
        claim_data = self._extract_claim_and_novelty(abstract_text)

        # 2. Method in 3 bullet lines
        method_summary = self._extract_method_summary(method_text)

        # 3. Assumptions and Weaknesses
        weaknesses = self._extract_weaknesses(limitations_text, experiments_text)

        # 4. Datasets, Metrics, Reproducibility
        data_and_repro = self._extract_datasets_and_repro(method_text, experiments_text)

        # 5. Practical Applications
        applications = self._extract_applications(abstract_text, parsed_sections.get("conclusion", ""))

        # Assemble claims to verify
        claims_to_verify = [
            claim_data["core_claim"],
            claim_data["novelty"],
        ] + weaknesses

        verified_claims = self.verifier.verify_claims_batch(claims_to_verify)
        verified_core_claim = verified_claims[0]
        verified_novelty = verified_claims[1]
        verified_weaknesses = verified_claims[2:]

        card = PaperCard(
            paper_id=search_res.paper_id,
            title=search_res.title,
            authors=search_res.authors,
            year=search_res.year,
            pdf_url=search_res.pdf_url,
            core_claim=verified_core_claim,
            method_summary=method_summary,
            novelty_vs_prior_work=verified_novelty,
            assumptions_and_weaknesses=verified_weaknesses,
            datasets_and_metrics=data_and_repro.get("datasets_and_metrics", {}),
            reproducibility=data_and_repro.get("reproducibility", {}),
            applications=applications,
        )

        self._save_to_cache(search_res.paper_id, card)
        return card

    def _extract_claim_and_novelty(self, text: str) -> Dict[str, GroundedClaim]:
        prompt = f"""Analyze this paper text and extract:
1. Core Claim: the main empirical or theoretical claim.
2. Novelty vs Prior Work: what genuinely distinguishes this from previous papers.

Provide an exact verbatim quote from the text for each!

TEXT:
\"\"\"{text[:3000]}\"\"\"

Return JSON:
{{
  "core_claim_statement": "concise statement",
  "core_claim_quote": "exact quote from text",
  "core_claim_section": "Abstract",
  "novelty_statement": "what is new vs prior work",
  "novelty_quote": "exact quote from text",
  "novelty_section": "Abstract / Intro"
}}"""
        try:
            res = self.llm.generate_json(prompt)
            return {
                "core_claim": GroundedClaim(
                    statement=res.get("core_claim_statement", "Core claim not extracted"),
                    evidence_quote=res.get("core_claim_quote", ""),
                    section_pointer=res.get("core_claim_section", "Abstract"),
                ),
                "novelty": GroundedClaim(
                    statement=res.get("novelty_statement", "Novelty not identified"),
                    evidence_quote=res.get("novelty_quote", ""),
                    section_pointer=res.get("novelty_section", "Introduction"),
                ),
            }
        except Exception:
            return {
                "core_claim": GroundedClaim(
                    statement=text[:150] if text else "N/A",
                    evidence_quote=text[:200] if text else "",
                    section_pointer="Abstract",
                ),
                "novelty": GroundedClaim(
                    statement="Novel technique presented in this paper.",
                    evidence_quote="",
                    section_pointer="Introduction",
                ),
            }

    def _extract_method_summary(self, text: str) -> List[str]:
        prompt = f"""Summarize the core technical methodology from this text in EXACTLY 3 crisp bullet points.
TEXT:
\"\"\"{text[:4000]}\"\"\"

Return JSON:
{{
  "method_bullets": [
    "Step 1 / Architecture component",
    "Step 2 / Formulation or training procedure",
    "Step 3 / Output generation or inference strategy"
  ]
}}"""
        try:
            res = self.llm.generate_json(prompt)
            bullets = res.get("method_bullets", [])
            return bullets[:3] if len(bullets) >= 3 else (bullets + ["N/A"] * (3 - len(bullets)))
        except Exception:
            return [
                "Proposes specialized architectural formulation.",
                "Executes target training or optimization procedure.",
                "Evaluates performance on standardized benchmarks.",
            ]

    def _extract_weaknesses(self, lim_text: str, exp_text: str) -> List[GroundedClaim]:
        combined = (lim_text + "\n" + exp_text)[:4500]
        prompt = f"""Identify 2 to 3 critical weaknesses, bottlenecks, restrictive assumptions, or failure modes in this work.
Every weakness MUST include an exact evidence quote from the text.

TEXT:
\"\"\"{combined}\"\"\"

Return JSON:
{{
  "weaknesses": [
    {{
      "statement": "concise weakness description",
      "evidence_quote": "exact quote from text",
      "section_pointer": "Limitations / Experiments"
    }}
  ]
}}"""
        try:
            res = self.llm.generate_json(prompt)
            weaknesses = []
            for item in res.get("weaknesses", []):
                weaknesses.append(
                    GroundedClaim(
                        statement=item.get("statement", ""),
                        evidence_quote=item.get("evidence_quote", ""),
                        section_pointer=item.get("section_pointer", "Limitations"),
                    )
                )
            return weaknesses
        except Exception:
            return [
                GroundedClaim(
                    statement="Evaluations may be limited to specific benchmark domains.",
                    evidence_quote="",
                    section_pointer="Discussion",
                )
            ]

    def _extract_datasets_and_repro(self, method_text: str, exp_text: str) -> Dict[str, Any]:
        combined = (method_text + "\n" + exp_text)[:4000]
        prompt = f"""Extract datasets used, evaluation metrics, and reproducibility aspects (code/repo availability).
TEXT:
\"\"\"{combined}\"\"\"

Return JSON:
{{
  "datasets": ["list of dataset names"],
  "metrics": ["list of evaluation metrics"],
  "code_available": true or false,
  "code_url": "url if found, else null"
}}"""
        try:
            res = self.llm.generate_json(prompt)
            return {
                "datasets_and_metrics": {
                    "datasets": res.get("datasets", []),
                    "metrics": res.get("metrics", []),
                },
                "reproducibility": {
                    "code_available": res.get("code_available", False),
                    "code_url": res.get("code_url"),
                },
            }
        except Exception:
            return {
                "datasets_and_metrics": {"datasets": [], "metrics": []},
                "reproducibility": {"code_available": False, "code_url": None},
            }

    def _extract_applications(self, abstract_text: str, conclusion_text: str) -> List[str]:
        combined = (abstract_text + "\n" + conclusion_text)[:3000]
        prompt = f"""List 3 concrete, practical engineering or real-world applications of the methods introduced in this paper.
TEXT:
\"\"\"{combined}\"\"\"

Return JSON:
{{
  "applications": [
    "practical application 1",
    "practical application 2",
    "practical application 3"
  ]
}}"""
        try:
            res = self.llm.generate_json(prompt)
            return res.get("applications", [])[:3]
        except Exception:
            return ["Downstream integration into specialized NLP/Vision pipelines", "Automated reasoning systems"]

    def _save_to_cache(self, paper_id: str, card: PaperCard):
        safe_id = re.sub(r"[^\w\-_\.]", "_", paper_id)
        cache_file = CARDS_CACHE_DIR / f"{safe_id}.json"
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                f.write(card.model_dump_json(indent=2))
        except Exception as e:
            print(f"[PaperDissector] Error saving cache: {e}")

    def _load_from_cache(self, paper_id: str) -> Optional[PaperCard]:
        safe_id = re.sub(r"[^\w\-_\.]", "_", paper_id)
        cache_file = CARDS_CACHE_DIR / f"{safe_id}.json"
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return PaperCard.model_validate(data)
            except Exception:
                return None
        return None
