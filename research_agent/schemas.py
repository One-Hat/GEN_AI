from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class GroundedClaim(BaseModel):
    statement: str = Field(description="The factual claim or summary point.")
    evidence_quote: str = Field(description="Direct verbatim snippet or excerpt from the paper confirming this claim.")
    section_pointer: str = Field(default="", description="Section name or heading where the evidence was found (e.g. 'Methodology 3.2').")
    verified: bool = Field(default=True, description="Whether the verifier agent validated the grounding.")


class PaperCard(BaseModel):
    paper_id: str = Field(description="Canonical ID (e.g. arXiv ID, DOI, or S2 ID)")
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    pdf_url: Optional[str] = None
    
    # Critical structured sections
    core_claim: GroundedClaim = Field(description="Primary claim and thesis of the paper.")
    method_summary: List[str] = Field(
        description="Exactly 3 concise bullet points summarizing the technical method/architecture."
    )
    novelty_vs_prior_work: GroundedClaim = Field(
        description="What is genuinely new here compared to preceding literature."
    )
    assumptions_and_weaknesses: List[GroundedClaim] = Field(
        default_factory=list,
        description="Explicit limitations, unstated assumptions, bottlenecks, or failure modes."
    )
    datasets_and_metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Datasets used, baseline comparisons, and quantitative evaluation metrics."
    )
    reproducibility: Dict[str, Any] = Field(
        default_factory=dict,
        description="Code repository URLs, weights availability, data availability, compute requirements."
    )
    applications: List[str] = Field(
        default_factory=list,
        description="Direct industry or research applications, practical implementations."
    )


class CitationEdge(BaseModel):
    source_id: str
    target_id: str
    source_title: str
    target_title: str
    is_direct_citation: bool = Field(default=False, description="Whether paper A explicitly cites paper B")
    citation_intent: Optional[str] = Field(
        default=None, 
        description="Semantic Scholar intent: 'background', 'methodology', or 'result'"
    )
    citation_context: Optional[str] = Field(
        default=None, 
        description="Surrounding text where the citation occurred"
    )
    embedding_similarity: float = Field(
        default=0.0, 
        description="Cosine similarity between SPECTER2 or BGE dense embeddings"
    )
    relationship_type: Literal[
        "extends",
        "contradicts",
        "alternative_to",
        "uses_method",
        "benchmarks_against",
        "precursor_foundation",
        "parallel_work",
        "unknown"
    ] = Field(default="unknown")
    explanation: str = Field(
        default="", 
        description="Grounded explanation of how these two papers connect."
    )


class PaperSearchResult(BaseModel):
    paper_id: str
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    abstract: str = ""
    doi: Optional[str] = None
    arxiv_id: Optional[str] = None
    s2_id: Optional[str] = None
    pdf_url: Optional[str] = None
    citation_count: int = 0
    influential_citation_count: int = 0


class UserProfile(BaseModel):
    interests: List[str] = Field(default_factory=list)
    expertise_level: Literal["beginner", "intermediate", "expert"] = "intermediate"
    focus_goal: Literal["practical_applications", "theoretical_depth", "reproducibility", "general_overview"] = "practical_applications"


class DissectionReport(BaseModel):
    paper_card: PaperCard
    key_interconnections: List[CitationEdge] = Field(default_factory=list)
    critique_and_takeaway: str = Field(description="Synthesized objective evaluation for researchers.")
