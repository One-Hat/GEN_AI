import re
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional
from research_agent.config import PDF_CACHE_DIR


class ParsedSection:
    def __init__(self, title: str, text: str, page_number: int = 1):
        self.title = title.strip()
        self.text = text.strip()
        self.page_number = page_number

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "text": self.text,
            "page_number": self.page_number,
        }


class PaperPDFParser:
    """Extracts clean, structured sections from research paper PDFs."""

    # Key section boundary patterns
    SECTION_PATTERNS = [
        ("abstract", r"(?i)^(?:abstract|summary)\b"),
        ("introduction", r"(?i)^(?:1\.?|I\.?)?\s*introduction\b"),
        ("related_work", r"(?i)^(?:2\.?|II\.?)?\s*(?:related work|background|prior work)\b"),
        ("method", r"(?i)^(?:[2-4]\.?|[I|V]+\.?)?\s*(?:methodology|method|model|approach|architecture|system overview|formulation)\b"),
        ("experiments", r"(?i)^(?:[3-6]\.?|[I|V]+\.?)?\s*(?:experiments|experimental setup|evaluation|results|benchmarks)\b"),
        ("limitations", r"(?i)^(?:[4-7]\.?|[I|V]+\.?)?\s*(?:limitations|broader impacts|failure modes|threats to validity)\b"),
        ("conclusion", r"(?i)^(?:[5-8]\.?|[I|V]+\.?)?\s*(?:conclusion|concluding remarks|future work)\b"),
        ("references", r"(?i)^(?:references|bibliography)\b"),
    ]

    @classmethod
    def download_pdf(cls, pdf_url: str, paper_id: str) -> Optional[Path]:
        safe_id = re.sub(r"[^\w\-_\.]", "_", paper_id)
        local_path = PDF_CACHE_DIR / f"{safe_id}.pdf"
        
        if local_path.exists() and local_path.stat().st_size > 1024:
            return local_path

        try:
            req = urllib.request.Request(
                pdf_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DeepResearchAgent"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp, open(local_path, "wb") as out_file:
                out_file.write(resp.read())
            return local_path
        except Exception as e:
            print(f"[PaperPDFParser] Failed downloading PDF from {pdf_url}: {e}")
            return None

    @classmethod
    def parse_pdf_file(cls, pdf_path: Path) -> Dict[str, str]:
        """Parses a local PDF into structured section text chunks."""
        try:
            import fitz  # PyMuPDF
        except ImportError:
            raise ImportError("PyMuPDF (fitz) is required for PDF parsing. Install with `pip install pymupdf`.")

        doc = fitz.open(pdf_path)
        pages_text: List[str] = []
        for page in doc:
            pages_text.append(page.get_text("text"))

        full_text = "\n\n".join(pages_text)
        
        # Segment into sections
        sections: Dict[str, str] = {
            "abstract": "",
            "method": "",
            "experiments": "",
            "limitations": "",
            "conclusion": "",
            "full_text": full_text[:40000]  # Cap for safety
        }

        # Try to slice out Abstract
        abstract_match = re.search(r"(?i)\babstract\b[\s:\.\-—\n]+(.*?)(?=\n\s*(?:1\.?\s*Introduction|Categories|General Terms|Keywords|I\.\s*INTRODUCTION))", full_text, re.DOTALL)
        if abstract_match:
            sections["abstract"] = abstract_match.group(1).strip()

        # Method slice
        method_match = re.search(r"(?i)\n(?:\d+\.?|[IVX]+\.?)\s+(?:Methodology|Method|Approach|Model|Architecture)\b.*?\n(.*?)(?=\n(?:\d+\.?|[IVX]+\.?)\s+(?:Experiments|Results|Evaluation|Implementation))", full_text, re.DOTALL)
        if method_match:
            sections["method"] = method_match.group(1).strip()[:10000]

        # Experiments / Results slice
        exp_match = re.search(r"(?i)\n(?:\d+\.?|[IVX]+\.?)\s+(?:Experiments|Results|Evaluation)\b.*?\n(.*?)(?=\n(?:\d+\.?|[IVX]+\.?)\s+(?:Discussion|Limitations|Related Work|Conclusion))", full_text, re.DOTALL)
        if exp_match:
            sections["experiments"] = exp_match.group(1).strip()[:10000]

        # Limitations / Failure modes slice
        lim_match = re.search(r"(?i)\n(?:\d+\.?|[IVX]+\.?|\b)\s*(?:Limitations|Broader Impacts|Failure Modes)\b.*?\n(.*?)(?=\n(?:\d+\.?|[IVX]+\.?)\s+(?:Conclusion|References|Acknowledgements|\Z))", full_text, re.DOTALL)
        if lim_match:
            sections["limitations"] = lim_match.group(1).strip()[:6000]

        # Conclusion slice
        concl_match = re.search(r"(?i)\n(?:\d+\.?|[IVX]+\.?)\s+(?:Conclusion|Concluding Remarks)\b.*?\n(.*?)(?=\n(?:\d+\.?|[IVX]+\.?)\s+(?:References|Acknowledgements|\Z))", full_text, re.DOTALL)
        if concl_match:
            sections["conclusion"] = concl_match.group(1).strip()[:6000]

        return sections
