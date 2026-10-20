from typing import List, Optional
from research_agent.schemas import PaperSearchResult
from research_agent.retrievers.arxiv_client import ArxivClient
from research_agent.retrievers.s2_client import SemanticScholarClient


class UnifiedRetriever:
    """Combines arXiv and Semantic Scholar to discover and retrieve papers for free."""

    @classmethod
    def search(cls, query: str, limit: int = 5) -> List[PaperSearchResult]:
        # First query Semantic Scholar (has citation counts & broad coverage)
        s2_results = SemanticScholarClient.search(query, limit=limit)
        if s2_results:
            return s2_results

        # Fallback to direct arXiv search
        return ArxivClient.search(query, max_results=limit)

    @classmethod
    def resolve_paper(cls, identifier: str) -> Optional[PaperSearchResult]:
        """Resolves an arXiv ID, URL, or Title to a PaperSearchResult."""
        clean = identifier.strip()
        if "arxiv.org/abs/" in clean:
            arxiv_id = clean.split("arxiv.org/abs/")[-1].split(".pdf")[0].split("/")[0]
            return ArxivClient.get_by_id(arxiv_id)
        elif "arxiv.org/pdf/" in clean:
            arxiv_id = clean.split("arxiv.org/pdf/")[-1].replace(".pdf", "").split("/")[0]
            return ArxivClient.get_by_id(arxiv_id)
        elif clean.startswith("ARXIV:") or clean.startswith("arXiv:"):
            return ArxivClient.get_by_id(clean)
        
        # Search by query / title
        results = cls.search(clean, limit=1)
        return results[0] if results else None
