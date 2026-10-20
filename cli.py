import sys
import argparse
from research_agent.pipeline import DeepResearchPipeline
from research_agent.schemas import UserProfile


def main():
    parser = argparse.ArgumentParser(
        description="Deep Academic Research Agent: 100% Free Open-Source Paper Dissector & Interconnection Graph"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Command 1: Dissect a single paper
    dissect_parser = subparsers.add_parser("dissect", help="Dissect a specific paper into structured card and weaknesses")
    dissect_parser.add_argument("identifier", help="arXiv ID (e.g. 1706.03762), paper URL, or paper title")

    # Command 2: Search literature
    search_parser = subparsers.add_parser("search", help="Search papers catering to user needs via arXiv & Semantic Scholar")
    search_parser.add_argument("query", help="Search topic or problem description")
    search_parser.add_argument("--limit", type=int, default=5, help="Number of results")

    # Command 3: Compare two papers
    compare_parser = subparsers.add_parser("compare", help="Compare two papers or approaches")
    compare_parser.add_argument("query", help="Comparison query (e.g. 'FlashAttention vs Standard Attention')")

    # Command 4: Map field landscape
    map_parser = subparsers.add_parser("map", help="Build citation & conceptual interconnection graph for a subfield")
    map_parser.add_argument("query", help="Subfield or topic (e.g. 'direct preference optimization')")

    # Command 5: Natural language pipeline mode
    run_parser = subparsers.add_parser("ask", help="Natural language request automatically routed by agent")
    run_parser.add_argument("prompt", help="Your research question or instruction")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    pipeline = DeepResearchPipeline()

    if args.command == "dissect":
        report = pipeline.dissect_single_paper(args.identifier)
        print(report)
    elif args.command == "search":
        report = pipeline.search_and_recommend(args.query)
        print(report)
    elif args.command == "compare":
        report = pipeline.compare_papers(args.query)
        print(report)
    elif args.command == "map":
        report = pipeline.map_literature_field(args.query)
        print(report)
    elif args.command == "ask":
        report = pipeline.process_query(args.prompt)
        print(report)


if __name__ == "__main__":
    main()
