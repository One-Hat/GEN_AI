import time
import requests
from typing import List, Optional, Dict, Any
from research_agent.schemas import PaperSearchResult, CitationEdge
from research_agent.config import S2_API_KEY, USER_AGENT


class SemanticScholarClient:
    """Client for Semantic Scholar Academic Graph API. Free tier, no mandatory key."""

    BASE_URL = "https://api.semanticscholar.org/graph/v1"

    @classmethod
    def _headers(cls) -> Dict[str, str]:
        headers = {"User-Agent": USER_AGENT}
        if S2_API_KEY:
            headers["x-api-key"] = S2_API_KEY
        return headers

    @classmethod
    def search(cls, query: str, limit: int = 5) -> List[PaperSearchResult]:
        endpoint = f"{cls.BASE_URL}/paper/search"
        fields = "paperId,title,abstract,year,authors,externalIds,citationCount,influentialCitationCount,openAccessPdf"
        params = {"query": query, "limit": limit, "fields": fields}
        
        try:
            resp = requests.get(endpoint, params=params, headers=cls._headers(), timeout=15)
            if resp.status_code == 429:
                time.sleep(2.0)
                resp = requests.get(endpoint, params=params, headers=cls._headers(), timeout=15)
            
            resp.raise_for_status()
            data = resp.json()
            
            results = []
            for item in data.get("data", []):
                external_ids = item.get("externalIds") or {}
                arxiv_id = external_ids.get("ArXiv")
                doi = external_ids.get("DOI")
                
                pdf_info = item.get("openAccessPdf") or {}
                pdf_url = pdf_info.get("url")
                if not pdf_url and arxiv_id:
                    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                
                authors = [a.get("name", "") for a in item.get("authors", []) if a.get("name")]
                
                paper_id = f"S2:{item.get('paperId')}"
                if arxiv_id:
                    paper_id = f"ARXIV:{arxiv_id}"

                results.append(
                    PaperSearchResult(
                        paper_id=paper_id,
                        title=item.get("title") or "Untitled",
                        authors=authors,
                        year=item.get("year"),
                        abstract=item.get("abstract") or "",
                        doi=doi,
                        arxiv_id=arxiv_id,
                        s2_id=item.get("paperId"),
                        pdf_url=pdf_url,
                        citation_count=item.get("citationCount") or 0,
                        influential_citation_count=item.get("influentialCitationCount") or 0,
                    )
                )
            return results
        except Exception as e:
            print(f"[SemanticScholarClient] Search failed: {e}")
            return []

    @classmethod
    def get_paper_details(cls, paper_id: str) -> Optional[Dict[str, Any]]:
        clean_id = paper_id.replace("S2:", "").replace("ARXIV:", "ARXIV:")
        endpoint = f"{cls.BASE_URL}/paper/{clean_id}"
        fields = (
            "paperId,title,abstract,year,authors,externalIds,citationCount,"
            "citations.paperId,citations.title,citations.year,citations.contexts,citations.intents,"
            "references.paperId,references.title,references.year,references.contexts,references.intents"
        )
        params = {"fields": fields}
        try:
            resp = requests.get(endpoint, params=params, headers=cls._headers(), timeout=15)
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            print(f"[SemanticScholarClient] Get paper details error: {e}")
        return None

    @classmethod
    def extract_interconnection_edges(cls, paper_id: str, paper_title: str) -> List[CitationEdge]:
        """Extracts hard citation graph connections with S2 context and intent."""
        details = cls.get_paper_details(paper_id)
        if not details:
            return []

        edges: List[CitationEdge] = []
        source_id = details.get("paperId") or paper_id
        
        # 1. References (Papers cited by this paper)
        for ref in details.get("references", []):
            if not ref or not ref.get("paperId"):
                continue
            intents = ref.get("intents") or []
            contexts = ref.get("contexts") or []
            
            primary_intent = intents[0] if intents else "background"
            context_snippet = contexts[0] if contexts else ""
            
            # Semantic mapping from S2 intent
            rel_type = "uses_method" if "methodology" in intents else (
                "benchmarks_against" if "result" in intents else "precursor_foundation"
            )
            
            edges.append(
                CitationEdge(
                    source_id=source_id,
                    target_id=ref.get("paperId"),
                    source_title=paper_title,
                    target_title=ref.get("title") or "Unknown Paper",
                    is_direct_citation=True,
                    citation_intent=primary_intent,
                    citation_context=context_snippet,
                    relationship_type=rel_type,
                    explanation=f"Cited by this paper with intent '{primary_intent}'. Context: {context_snippet[:150]}"
                )
            )
            
        # 2. Citations (Papers that cite this paper)
        for cite in details.get("citations", []):
            if not cite or not cite.get("paperId"):
                continue
            intents = cite.get("intents") or []
            contexts = cite.get("contexts") or []
            primary_intent = intents[0] if intents else "background"
            context_snippet = contexts[0] if contexts else ""
            
            rel_type = "extends" if "methodology" in intents else "benchmarks_against"
            
            edges.append(
                CitationEdge(
                    source_id=cite.get("paperId"),
                    target_id=source_id,
                    source_title=cite.get("title") or "Unknown Citing Paper",
                    target_title=paper_title,
                    is_direct_citation=True,
                    citation_intent=primary_intent,
                    citation_context=context_snippet,
                    relationship_type=rel_type,
                    explanation=f"Cites this paper with intent '{primary_intent}'. Context: {context_snippet[:150]}"
                )
            )

        return edges
