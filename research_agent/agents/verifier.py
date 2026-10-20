from typing import Dict, Any, List
from research_agent.schemas import GroundedClaim
from research_agent.agents.llm_client import LocalLLMClient


class GroundingVerifier:
    """Verifies that extracted claims and criticisms are strictly backed by paper excerpts."""

    SYSTEM_PROMPT = """You are a strict academic verifier.
Your job is to prevent hallucinations.
Evaluate whether the CLAIM is truthfully supported by the provided EVIDENCE QUOTE from the research paper.

Return JSON:
{
  "supported": true or false,
  "confidence": float between 0.0 and 1.0,
  "reason": "short explanation"
}
"""

    def __init__(self, llm_client: LocalLLMClient = None):
        self.llm = llm_client or LocalLLMClient()

    def verify_claim(self, claim: GroundedClaim) -> GroundedClaim:
        """Verifies a single GroundedClaim against its evidence quote."""
        if not claim.evidence_quote or len(claim.evidence_quote.strip()) < 10:
            claim.verified = False
            return claim

        prompt = (
            f"CLAIM: {claim.statement}\n\n"
            f"EVIDENCE QUOTE FROM PAPER: \"{claim.evidence_quote}\"\n\n"
            f"Is this claim directly backed by the evidence quote?"
        )

        try:
            res = self.llm.generate_json(prompt, system_prompt=self.SYSTEM_PROMPT)
            claim.verified = bool(res.get("supported", True))
        except Exception:
            # Fallback heuristic: check word overlap
            claim_words = set(claim.statement.lower().split())
            quote_words = set(claim.evidence_quote.lower().split())
            overlap = len(claim_words.intersection(quote_words)) / max(len(claim_words), 1)
            claim.verified = overlap >= 0.2
        return claim

    def verify_claims_batch(self, claims: List[GroundedClaim]) -> List[GroundedClaim]:
        return [self.verify_claim(c) for c in claims]
