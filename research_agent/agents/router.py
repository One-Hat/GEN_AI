from typing import Dict, Any, Literal
from research_agent.agents.llm_client import LocalLLMClient


class QueryRouter:
    """Classifies user intent and extracts routing parameters."""

    SYSTEM_PROMPT = """You are an intent router for a research paper intelligence system.
Categorize the user's input into one of 4 routes:
- 'find_papers': User is looking for research papers on a topic or problem.
- 'dissect_paper': User wants a deep dive/critical analysis of a specific paper (by URL, title, or arXiv ID).
- 'compare_papers': User wants to compare two or more specific approaches/papers.
- 'map_field': User wants to explore the citation graph and interconnection landscape of a research subfield.

Output JSON with keys:
- 'route': string ('find_papers', 'dissect_paper', 'compare_papers', 'map_field')
- 'target_identifier': string (arXiv ID, paper title, or paper URL if provided, else null)
- 'search_query': string (refined search terms if finding papers or mapping field, else null)
- 'focus_area': string ('theory', 'applications', 'weaknesses', 'general')
"""

    def __init__(self, llm_client: LocalLLMClient = None):
        self.llm = llm_client or LocalLLMClient()

    def route_query(self, user_query: str) -> Dict[str, Any]:
        prompt = f"User Request: \"{user_query}\"\n\nReturn JSON with route classification and parameters."
        try:
            return self.llm.generate_json(prompt, system_prompt=self.SYSTEM_PROMPT)
        except Exception:
            # Deterministic fallback heuristics
            lower = user_query.lower()
            if any(k in lower for k in ["compare", "versus", "vs", "difference between"]):
                return {"route": "compare_papers", "target_identifier": None, "search_query": user_query, "focus_area": "general"}
            elif any(k in lower for k in ["graph", "landscape", "field", "taxonomy", "evolution"]):
                return {"route": "map_field", "target_identifier": None, "search_query": user_query, "focus_area": "general"}
            elif any(k in lower for k in ["arxiv", "paper:", "http", ".pdf"]) or len(user_query.split()) > 7 and ("analyze" in lower or "dissect" in lower):
                return {"route": "dissect_paper", "target_identifier": user_query, "search_query": None, "focus_area": "weaknesses"}
            else:
                return {"route": "find_papers", "target_identifier": None, "search_query": user_query, "focus_area": "applications"}
