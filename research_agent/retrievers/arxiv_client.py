import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from typing import List, Optional
from research_agent.schemas import PaperSearchResult


class ArxivClient:
    """Client for arXiv API (Free, no API key required)."""

    BASE_URL = "http://export.arxiv.org/api/query"

    @classmethod
    def search(cls, query: str, max_results: int = 5) -> List[PaperSearchResult]:
        params = {
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": max_results,
            "sortBy": "relevance",
            "sortOrder": "descending",
        }
        url = f"{cls.BASE_URL}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"User-Agent": "DeepResearchAgent/1.0"})
        
        results = []
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                content = response.read()
                root = ET.fromstring(content)
                ns = {"atom": "http://www.w3.org/2005/Atom"}
                
                for entry in root.findall("atom:entry", ns):
                    raw_id = entry.find("atom:id", ns).text or ""
                    arxiv_id = raw_id.split("/abs/")[-1].split("v")[0] if "/abs/" in raw_id else raw_id
                    title = entry.find("atom:title", ns).text or ""
                    title = " ".join(title.split())
                    
                    summary = entry.find("atom:summary", ns).text or ""
                    summary = " ".join(summary.split())
                    
                    published = entry.find("atom:published", ns).text or ""
                    year = int(published[:4]) if len(published) >= 4 else None
                    
                    authors = [
                        author.find("atom:name", ns).text
                        for author in entry.findall("atom:author", ns)
                        if author.find("atom:name", ns) is not None
                    ]
                    
                    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                    
                    results.append(
                        PaperSearchResult(
                            paper_id=f"ARXIV:{arxiv_id}",
                            title=title,
                            authors=authors,
                            year=year,
                            abstract=summary,
                            arxiv_id=arxiv_id,
                            pdf_url=pdf_url,
                        )
                    )
        except Exception as e:
            print(f"[ArxivClient] Error querying arXiv: {e}")
        return results

    @classmethod
    def get_by_id(cls, arxiv_id: str) -> Optional[PaperSearchResult]:
        clean_id = arxiv_id.replace("ARXIV:", "").replace("arXiv:", "").strip()
        params = {"id_list": clean_id}
        url = f"{cls.BASE_URL}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"User-Agent": "DeepResearchAgent/1.0"})
        
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                content = response.read()
                root = ET.fromstring(content)
                ns = {"atom": "http://www.w3.org/2005/Atom"}
                entry = root.find("atom:entry", ns)
                if entry is None:
                    return None
                
                title = entry.find("atom:title", ns).text or ""
                title = " ".join(title.split())
                summary = entry.find("atom:summary", ns).text or ""
                summary = " ".join(summary.split())
                published = entry.find("atom:published", ns).text or ""
                year = int(published[:4]) if len(published) >= 4 else None
                authors = [
                    author.find("atom:name", ns).text
                    for author in entry.findall("atom:author", ns)
                    if author.find("atom:name", ns) is not None
                ]
                
                return PaperSearchResult(
                    paper_id=f"ARXIV:{clean_id}",
                    title=title,
                    authors=authors,
                    year=year,
                    abstract=summary,
                    arxiv_id=clean_id,
                    pdf_url=f"https://arxiv.org/pdf/{clean_id}.pdf",
                )
        except Exception as e:
            print(f"[ArxivClient] Error fetching arXiv paper {arxiv_id}: {e}")
            return None
