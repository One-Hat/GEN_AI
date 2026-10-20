export interface GroundedClaim {
  statement: string;
  evidence_quote: string;
  section_pointer: string;
  verified: boolean;
}

export interface PaperCard {
  paper_id: string;
  title: string;
  authors: string[];
  year: number;
  pdf_url?: string;
  arxiv_id?: string;
  citation_count?: number;
  core_claim: GroundedClaim;
  method_summary: string[];
  novelty_vs_prior_work: GroundedClaim;
  assumptions_and_weaknesses: Array<{
    id: string;
    category: 'assumption' | 'compute' | 'empirical_scope' | 'theoretical';
    severity: 'critical' | 'moderate' | 'minor';
    statement: string;
    evidence_quote: string;
    section_pointer: string;
    verified: boolean;
  }>;
  datasets_and_metrics: {
    datasets: string[];
    metrics: string[];
  };
  reproducibility: {
    code_available: boolean;
    code_url?: string;
    weights_available?: boolean;
    estimated_compute?: string;
  };
  applications: Array<{
    title: string;
    description: string;
    domain: string;
  }>;
}

export interface CitationConnection {
  id: string;
  target_id: string;
  target_title: string;
  year: number;
  authors: string;
  relationship_type: 'extends' | 'contradicts' | 'alternative_to' | 'uses_method' | 'benchmarks_against' | 'precursor_foundation';
  citation_intent: 'methodology' | 'result' | 'background';
  citation_context: string;
  similarity_score: number;
  explanation: string;
}

export type ViewMode = 'dissect' | 'search' | 'compare' | 'map';
