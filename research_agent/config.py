import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / ".cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

PDF_CACHE_DIR = CACHE_DIR / "pdfs"
PDF_CACHE_DIR.mkdir(parents=True, exist_ok=True)

CARDS_CACHE_DIR = CACHE_DIR / "cards"
CARDS_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# LLM Configuration (Defaulting to free local Ollama or OpenAI-compatible endpoint)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # "ollama" or "openai_compatible"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OPENAI_COMPATIBLE_BASE_URL = os.getenv("OPENAI_COMPATIBLE_BASE_URL", "http://localhost:11434/v1")
OPENAI_COMPATIBLE_API_KEY = os.getenv("OPENAI_COMPATIBLE_API_KEY", "ollama")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "qwen2.5:7b")

# Embedding Configuration (Local SPECTER2 or BGE)
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")

# Semantic Scholar & OpenAlex settings (Free tier)
S2_API_KEY = os.getenv("S2_API_KEY", "")  # Optional: higher rate limits
USER_AGENT = "DeepResearchAgent/1.0 (academic-research-tool; mailto:researcher@local.domain)"
