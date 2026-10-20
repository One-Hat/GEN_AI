from typing import Optional, List, Dict, Any
from research_agent.schemas import PaperCard, PaperSearchResult, CitationEdge, UserProfile
from research_agent.retrievers import UnifiedRetriever
from research_agent.retrievers.s2_client import SemanticScholarClient
from research_agent.parsers.pdf_parser import PaperPDFParser
from research_agent.agents.router import QueryRouter
from research_agent.agents.dissector import PaperDissector
from research_agent.agents.linker import PaperLinker
from research_agent.agents.synthesizer import ReportSynthesizer
from research_agent.graph.citation_graph import ResearchCitationGraph


class DeepResearchPipeline:
    """End-to-end pipeline coordinating narrow, scoped agents."""

    def __init__(self):
        self.router = QueryRouter()
        self.dissector = PaperDissector()
        self.linker = PaperLinker()
        self.graph = ResearchCitationGraph()

    def process_query(self, user_prompt: str, user_profile: Optional[UserProfile] = None) -> str:
        # Step 1: Intent Routing
        routing = self.router.route_query(user_prompt)
        route = routing.get("route", "find_papers")
        target_id = routing.get("target_identifier")
        search_query = routing.get("search_query") or user_prompt

        if route == "dissect_paper" and target_id:
            return self.dissect_single_paper(target_id, user_profile)
        elif route == "compare_papers":
            return self.compare_papers(search_query, user_profile)
        elif route == "map_field":
            return self.map_literature_field(search_query)
        else:
            return self.search_and_recommend(search_query, user_profile)

    def dissect_single_paper(self, paper_identifier: str, profile: Optional[UserProfile] = None) -> str:
        # 1. Retrieve metadata
        paper_res = UnifiedRetriever.resolve_paper(paper_identifier)
        if not paper_res:
            return f"❌ Could not resolve paper matching `{paper_identifier}` on arXiv or Semantic Scholar."

        # 2. Parse PDF sections
        parsed_sections = {"abstract": paper_res.abstract, "full_text": paper_res.abstract}
        if paper_res.pdf_url:
            pdf_path = PaperPDFParser.download_pdf(paper_res.pdf_url, paper_res.paper_id)
            if pdf_path:
                try:
                    parsed_sections = PaperPDFParser.parse_pdf_file(pdf_path)
                except Exception as e:
                    print(f"[Pipeline] PDF parsing note: {e}")

        # 3. Dissect into PaperCard
        card = self.dissector.dissect(paper_res, parsed_sections)
        self.graph.add_paper(card)

        # 4. Extract interconnection citation edges
        hard_edges = SemanticScholarClient.extract_interconnection_edges(card.paper_id, card.title)
        for edge in hard_edges:
            self.graph.add_edge(edge)

        # 5. Synthesize final report
        report_md = ReportSynthesizer.synthesize_markdown(card, hard_edges, profile)
        return report_md

    def compare_papers(self, query: str, profile: Optional[UserProfile] = None) -> str:
        results = UnifiedRetriever.search(query, limit=2)
        if len(results) < 2:
            return f"❌ Need at least 2 papers to compare for query: '{query}'."

        cards: List[PaperCard] = []
        for p in results:
            parsed = {"abstract": p.abstract, "full_text": p.abstract}
            if p.pdf_url:
                pdf_path = PaperPDFParser.download_pdf(p.pdf_url, p.paper_id)
                if pdf_path:
                    try:
                        parsed = PaperPDFParser.parse_pdf_file(pdf_path)
                    except Exception:
                        pass
            cards.append(self.dissector.dissect(p, parsed))

        edge = self.linker.link_two_papers(cards[0], cards[1])

        out = [
            f"# Comparative Dissection: {cards[0].title} vs. {cards[1].title}",
            f"\n### Core Relationship: `{edge.relationship_type.upper()}`",
            f"**Synthesis**: {edge.explanation}\n",
            "| Feature | Paper A | Paper B |",
            "| :--- | :--- | :--- |",
            f"| **Title** | {cards[0].title} | {cards[1].title} |",
            f"| **Core Claim** | {cards[0].core_claim.statement} | {cards[1].core_claim.statement} |",
            f"| **Novelty** | {cards[0].novelty_vs_prior_work.statement} | {cards[1].novelty_vs_prior_work.statement} |",
            f"| **Primary Bottleneck** | {cards[0].assumptions_and_weaknesses[0].statement if cards[0].assumptions_and_weaknesses else 'N/A'} | {cards[1].assumptions_and_weaknesses[0].statement if cards[1].assumptions_and_weaknesses else 'N/A'} |",
            f"| **Top Application** | {cards[0].applications[0] if cards[0].applications else 'N/A'} | {cards[1].applications[0] if cards[1].applications else 'N/A'} |",
        ]
        return "\n".join(out)

    def search_and_recommend(self, query: str, profile: Optional[UserProfile] = None) -> str:
        papers = UnifiedRetriever.search(query, limit=5)
        if not papers:
            return f"No papers found for '{query}'."

        out = [f"# Literature Search Results for: *{query}*\n"]
        for idx, p in enumerate(papers, 1):
            out.append(f"### {idx}. {p.title}")
            authors = ", ".join(p.authors[:3]) + ("..." if len(p.authors) > 3 else "")
            out.append(f"- **Authors**: {authors} | **Year**: {p.year or 'N/A'} | **Citations**: {p.citation_count}")
            if p.arxiv_id:
                out.append(f"- **arXiv ID**: `{p.arxiv_id}` (dissect with `dissect {p.arxiv_id}`)")
            if p.pdf_url:
                out.append(f"- **PDF**: [{p.pdf_url}]({p.pdf_url})")
            out.append(f"- **Abstract Snippet**: {p.abstract[:250]}...\n")

        return "\n".join(out)

    def map_literature_field(self, query: str) -> str:
        papers = UnifiedRetriever.search(query, limit=4)
        if not papers:
            return f"No papers found to map field: '{query}'."

        cards: List[PaperCard] = []
        for p in papers:
            parsed = {"abstract": p.abstract, "full_text": p.abstract}
            card = self.dissector.dissect(p, parsed)
            cards.append(card)
            self.graph.add_paper(card)

        # Cross-link all pairs
        for i in range(len(cards)):
            for j in range(i + 1, len(cards)):
                edge = self.linker.link_two_papers(cards[i], cards[j])
                self.graph.add_edge(edge)

        mermaid_chart = self.graph.to_mermaid()

        out = [
            f"# Field Interconnection Map: *{query}*\n",
            "```mermaid",
            mermaid_chart,
            "```\n",
            "### Indexed Field Papers:",
        ]
        for c in cards:
            out.append(f"- **{c.title}** ({c.year or 'N/A'}): *{c.core_claim.statement[:120]}*")

        return "\n".join(out)
