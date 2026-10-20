import json
import re
import requests
from typing import Dict, Any, Optional
from research_agent.config import (
    LLM_PROVIDER,
    OLLAMA_BASE_URL,
    OPENAI_COMPATIBLE_BASE_URL,
    OPENAI_COMPATIBLE_API_KEY,
    DEFAULT_MODEL,
)


class LocalLLMClient:
    """Unified client for local open-source models (Ollama or OpenAI-compatible)."""

    def __init__(self, model_name: str = DEFAULT_MODEL):
        self.model_name = model_name

    def generate_json(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """Calls the model forcing a strict JSON dictionary response."""
        full_system = (
            (system_prompt + "\n" if system_prompt else "")
            + "You are a precise academic research assistant. Return ONLY valid JSON matching the requested schema. Do not add markdown formatting or conversational commentary."
        )

        if LLM_PROVIDER == "openai_compatible":
            return self._call_openai_compatible(prompt, full_system, json_mode=True)
        else:
            return self._call_ollama(prompt, full_system, json_mode=True)

    def generate_text(self, prompt: str, system_prompt: str = "") -> str:
        """Calls the model for freeform text generation."""
        if LLM_PROVIDER == "openai_compatible":
            res = self._call_openai_compatible(prompt, system_prompt, json_mode=False)
            return res.get("text", "")
        else:
            res = self._call_ollama(prompt, system_prompt, json_mode=False)
            return res.get("text", "")

    def _call_ollama(self, prompt: str, system: str, json_mode: bool) -> Any:
        url = f"{OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {"temperature": 0.1, "num_ctx": 8192},
        }
        if json_mode:
            payload["format"] = "json"

        try:
            resp = requests.post(url, json=payload, timeout=90)
            resp.raise_for_status()
            raw_text = resp.json().get("response", "").strip()

            if not json_mode:
                return {"text": raw_text}

            return self._parse_json_safely(raw_text)
        except requests.exceptions.ConnectionError:
            raise ConnectionError(
                f"Could not connect to Ollama at {OLLAMA_BASE_URL}. Ensure Ollama is running (`ollama serve`) "
                f"with model '{self.model_name}' installed (`ollama pull {self.model_name}`)."
            )
        except Exception as e:
            raise RuntimeError(f"Error calling Ollama: {e}")

    def _call_openai_compatible(self, prompt: str, system: str, json_mode: bool) -> Any:
        url = f"{OPENAI_COMPATIBLE_BASE_URL}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_COMPATIBLE_API_KEY}",
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=90)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()

            if not json_mode:
                return {"text": content}

            return self._parse_json_safely(content)
        except Exception as e:
            raise RuntimeError(f"Error calling OpenAI-compatible endpoint: {e}")

    @staticmethod
    def _parse_json_safely(raw_text: str) -> Dict[str, Any]:
        """Handles fenced codeblocks and malformed JSON wrapper from smaller LLMs."""
        clean = raw_text.strip()
        # Remove ```json ... ``` blocks if present
        if clean.startswith("```"):
            clean = re.sub(r"^```(?:json)?\s*", "", clean)
            clean = re.sub(r"\s*```$", "", clean)

        try:
            return json.loads(clean)
        except json.JSONDecodeError:
            # Fallback: find first { and last }
            start = clean.find("{")
            end = clean.rfind("}")
            if start != -1 and end != -1:
                return json.loads(clean[start : end + 1])
            raise ValueError(f"Could not parse valid JSON from model response: {raw_text[:200]}")
