import networkx as nx
from typing import List, Dict, Any
from research_agent.schemas import CitationEdge, PaperCard


class ResearchCitationGraph:
    """Manages the citation and conceptual graph using NetworkX."""

    def __init__(self):
        self.graph = nx.DiGraph()

    def add_paper(self, card: PaperCard):
        self.graph.add_node(
            card.paper_id,
            title=card.title,
            year=card.year,
            core_claim=card.core_claim.statement,
        )

    def add_edge(self, edge: CitationEdge):
        if not self.graph.has_node(edge.source_id):
            self.graph.add_node(edge.source_id, title=edge.source_title)
        if not self.graph.has_node(edge.target_id):
            self.graph.add_node(edge.target_id, title=edge.target_title)

        self.graph.add_edge(
            edge.source_id,
            edge.target_id,
            relationship_type=edge.relationship_type,
            citation_intent=edge.citation_intent,
            similarity=edge.embedding_similarity,
            explanation=edge.explanation,
        )

    def get_neighbors(self, paper_id: str) -> List[Dict[str, Any]]:
        results = []
        if not self.graph.has_node(paper_id):
            return results

        # Outgoing edges
        for target in self.graph.successors(paper_id):
            edge_data = self.graph.get_edge_data(paper_id, target)
            results.append({
                "direction": "out",
                "source": paper_id,
                "target": target,
                "target_title": self.graph.nodes[target].get("title", target),
                "data": edge_data,
            })

        # Incoming edges
        for source in self.graph.predecessors(paper_id):
            edge_data = self.graph.get_edge_data(source, paper_id)
            results.append({
                "direction": "in",
                "source": source,
                "source_title": self.graph.nodes[source].get("title", source),
                "target": paper_id,
                "data": edge_data,
            })

        return results

    def to_mermaid(self, max_nodes: int = 10) -> str:
        """Renders the graph into a Mermaid flowchart for markdown viewers."""
        lines = ["flowchart TD"]
        count = 0
        node_id_map = {}

        def clean_label(text: str) -> str:
            return text.replace('"', "'").replace("\n", " ")[:35]

        for u, v, data in self.graph.edges(data=True):
            if count >= max_nodes:
                break
            
            u_id = node_id_map.setdefault(u, f"N{len(node_id_map)}")
            v_id = node_id_map.setdefault(v, f"N{len(node_id_map)}")
            
            u_title = clean_label(self.graph.nodes[u].get("title", u))
            v_title = clean_label(self.graph.nodes[v].get("title", v))
            
            rel = data.get("relationship_type", "relates_to").replace("_", " ")
            lines.append(f'    {u_id}["{u_title}"] -->|"{rel}"| {v_id}["{v_title}"]')
            count += 1

        return "\n".join(lines)
