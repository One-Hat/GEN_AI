import math
from typing import List, Dict, Any, Tuple
from research_agent.schemas import PaperCard, CitationEdge
from research_agent.agents.llm_client import LocalLLMClient
from research_agent.config import EMBEDDING_MODEL_NAME


class DenseEmbedder:
    """Computes free local dense embeddings using sentence-transformers (SPECTER2 or BGE)."""

    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                cls._model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            except Exception as e:
                print(f"[DenseEmbedder] Local embedding model load note ({e}). Using lexical fallback.")
                cls._model = False
        return cls._model

    @classmethod
    def cosine_similarity(cls, text_a: str, text_b: str) -> float:
        model = cls.get_model()
        if model:
            try:
                embeddings = model.encode([text_a, text_b])
                vec_a, vec_b = embeddings[0], embeddings[1]
                dot = sum(a * b for a, b in zip(vec_a, vec_b))
                norm_a = math.sqrt(sum(a * a for a in vec_a))
                norm_b = math.sqrt(sum(b * b for b in vec_b))
                return float(dot / (norm_a * norm_b)) if norm_a and norm_b else 0.0
            except Exception:
                pass

        # Fallback lexical Jaccard/overlap similarity
        words_a = set(text_a.lower().split())
        words_b = set(text_b.lower().split())
        if not words_a or not words_b:
            return 0.0
        intersection = words_a.intersection(words_b)
        union = words_a.union(words_b)
        return float(len(intersection) / len(union))


class PaperLinker:
    """Combines hard citation graph evidence with soft embedding similarity and LLM edge labeling."""

    SYSTEM_PROMPT = """You are a rigorous academic bibliographer.
Given two papers (Paper A and Paper B), classify their relationship into EXACTLY ONE label:
- 'extends': Paper B directly builds on or improves Paper A's methodology.
- 'contradicts': Paper B challenges, refutes, or finds failures in Paper A's claims.
- 'alternative_to': Paper B proposes a competing/parallel solution to the same problem.
- 'uses_method': Paper B utilizes Paper A as an off-the-shelf component or tool.
- 'benchmarks_against': Paper B compares its performance against Paper A.
- 'precursor_foundation': Paper A provides the theoretical or architectural basis for Paper B.
- 'parallel_work': Similar topic and era, independent contributions.

Return JSON:
{
  "relationship_type": "...",
  "explanation": "2 sentence grounded explanation of why"
}
"""

    def __init__(self, llm_client: LocalLLMClient = None):
        self.llm = llm_client or LocalLLMClient()

    def link_two_papers(
        self,
        card_a: PaperCard,
        card_b: PaperCard,
        is_direct_citation: bool = False,
        citation_intent: str = None,
        citation_context: str = None,
    ) -> CitationEdge:
        """Determines the semantic edge connecting two paper cards."""

        # 1. Soft evidence: dense embedding similarity
        text_a = f"{card_a.title}. {card_a.core_claim.statement}. {' '.join(card_a.method_summary)}"
        text_b = f"{card_b.title}. {card_b.core_claim.statement}. {' '.join(card_b.method_summary)}"
        similarity = DenseEmbedder.cosine_similarity(text_a, text_b)

        # 2. Hard evidence: heuristic prior if direct citation is known
        hard_prior = "unknown"
        if is_direct_citation:
            if citation_intent == "methodology":
                hard_prior = "uses_method"
            elif citation_intent == "result":
                hard_prior = "benchmarks_against"
            else:
                hard_prior = "precursor_foundation"

        # 3. LLM edge labeling grounded solely in the two cards
        prompt = f"""PAPER A:
Title: {card_a.title}
Claim: {card_a.core_claim.statement}
Method: {' | '.join(card_a.method_summary)}

PAPER B:
Title: {card_b.title}
Claim: {card_b.core_claim.statement}
Method: {' | '.join(card_b.method_summary)}

EVIDENCE:
Direct Citation Exists: {is_direct_citation}
Citation Intent (Semantic Scholar): {citation_intent or 'None'}
Citation Context: {citation_context or 'None'}
Embedding Similarity: {similarity:.2f}

Classify the relationship from Paper A to Paper B."""

        try:
            res = self.llm.generate_json(prompt, system_prompt=self.SYSTEM_PROMPT)
            rel_type = res.get("relationship_type", hard_prior if hard_prior != "unknown" else "parallel_work")
            explanation = res.get("explanation", f"Interconnection with similarity score {similarity:.2f}")
        except Exception:
            rel_type = hard_prior if hard_prior != "unknown" else ("alternative_to" if similarity > 0.45 else "parallel_work")
            explanation = f"Connected with embedding similarity {similarity:.2f}. Direct citation: {is_direct_citation}."

        return CitationEdge(
            source_id=card_a.paper_id,
            target_id=card_b.paper_id,
            source_title=card_a.title,
            target_title=card_b.title,
            is_direct_citation=is_direct_citation,
            citation_intent=citation_intent,
            citation_context=citation_context,
            embedding_similarity=similarity,
            relationship_type=rel_type,
            explanation=explanation,
        )
