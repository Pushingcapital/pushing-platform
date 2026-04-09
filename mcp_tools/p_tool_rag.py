#!/usr/bin/env python3
"""
P Tool RAG — P's Assistant for Tool Discovery.

Lightweight TF-IDF search index over P_TOOLS.json.
Zero external dependencies beyond stdlib.
Called by P when she needs to find the right tool for a task.
"""
from __future__ import annotations

import json
import math
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any

# --- CONFIGURATION ---
_TOOL_REGISTRY_PATHS = [
    # Env var override (highest priority)
    Path(os.environ.get("P_TOOLS_JSON", "/dev/null")),
    # Same directory as this script (works from ~/bin/ AND from Launcher/)
    Path(__file__).resolve().parent / "P_TOOLS.json",
    # Vault relative to Launcher
    Path(__file__).resolve().parent.parent / "Tools" / "P_TOOLS.json",
    # bin fallback
    Path(os.path.expanduser("~/bin/P_TOOLS.json")),
    # absolute fallback
    Path(os.path.expanduser("~/PushingP Vault/Core/Tools/P_TOOLS.json")),
]

_STOPWORDS = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
    "and", "or", "not", "no", "but", "if", "then", "so", "do", "does",
    "did", "will", "would", "can", "could", "should", "may", "might",
    "this", "that", "it", "its", "use", "using", "used",
})


def _tokenize(text: str) -> list[str]:
    """Lowercase, split on non-alphanumeric, remove stopwords."""
    tokens = re.findall(r"[a-z0-9_]+", text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]


class ToolIndex:
    """TF-IDF index over P's tool registry. P's assistant for tool lookup."""

    def __init__(self, tools: list[dict[str, Any]] | None = None):
        self._tools: list[dict[str, Any]] = tools or []
        self._doc_tokens: list[list[str]] = []
        self._idf: dict[str, float] = {}
        self._tfidf_vectors: list[dict[str, float]] = []

        if not self._tools:
            self._tools = self._load_tools()

        if self._tools:
            self._build_index()

    @staticmethod
    def _load_tools() -> list[dict[str, Any]]:
        """Load tool definitions from the first available registry file."""
        for path in _TOOL_REGISTRY_PATHS:
            try:
                if path.exists():
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, list) and len(data) > 0:
                        print(f"  [ToolRAG] Loaded {len(data)} tools from {path}")
                        return data
                    else:
                        print(f"  [ToolRAG] Skipped {path} — not a non-empty list (type={type(data).__name__})")
            except Exception as e:
                print(f"  [ToolRAG] Failed to load {path}: {e}")
                continue
        print("  [ToolRAG] ⚠️ NO TOOL REGISTRY FOUND. P will have no extended tools.")
        return []

    def _build_index(self) -> None:
        """Build TF-IDF vectors for all tools."""
        # Build document tokens: name + description + parameter names
        for tool in self._tools:
            name = str(tool.get("name", ""))
            desc = str(tool.get("description", ""))
            params = tool.get("parameters", {})
            param_names = " ".join(params.get("properties", {}).keys()) if isinstance(params, dict) else ""
            # Also include name parts split by underscore for better matching
            name_parts = name.replace("_", " ")
            doc_text = f"{name} {name_parts} {desc} {param_names}"
            self._doc_tokens.append(_tokenize(doc_text))

        # Compute IDF
        n_docs = len(self._doc_tokens)
        df: Counter = Counter()
        for tokens in self._doc_tokens:
            for token in set(tokens):
                df[token] += 1

        self._idf = {
            token: math.log((n_docs + 1) / (count + 1)) + 1
            for token, count in df.items()
        }

        # Compute TF-IDF vectors
        for tokens in self._doc_tokens:
            tf = Counter(tokens)
            max_tf = max(tf.values()) if tf else 1
            vec: dict[str, float] = {}
            for token, count in tf.items():
                vec[token] = (count / max_tf) * self._idf.get(token, 1.0)
            self._tfidf_vectors.append(vec)

    def _cosine_similarity(self, vec_a: dict[str, float], vec_b: dict[str, float]) -> float:
        """Compute cosine similarity between two sparse vectors."""
        common = set(vec_a.keys()) & set(vec_b.keys())
        if not common:
            return 0.0
        dot = sum(vec_a[k] * vec_b[k] for k in common)
        mag_a = math.sqrt(sum(v * v for v in vec_a.values()))
        mag_b = math.sqrt(sum(v * v for v in vec_b.values()))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    def search(self, query: str, top_k: int = 5, min_score: float = 0.05) -> list[dict[str, Any]]:
        """
        Search for tools matching a natural language query.
        Returns tool definitions sorted by relevance.
        """
        if not self._tools:
            return []

        query_tokens = _tokenize(query)
        if not query_tokens:
            return []

        # Build query TF-IDF vector
        tf = Counter(query_tokens)
        max_tf = max(tf.values()) if tf else 1
        query_vec: dict[str, float] = {}
        for token, count in tf.items():
            query_vec[token] = (count / max_tf) * self._idf.get(token, 1.0)

        # Score all tools
        scored: list[tuple[float, int]] = []
        for idx, doc_vec in enumerate(self._tfidf_vectors):
            score = self._cosine_similarity(query_vec, doc_vec)

            # Boost: exact name match in query
            tool_name = self._tools[idx].get("name", "").lower()
            if tool_name in query.lower():
                score += 2.0
            # Boost: name prefix match (e.g., "pcrm" in query matches pcrm_*)
            name_prefix = tool_name.split("_")[0] if "_" in tool_name else tool_name
            if name_prefix in query.lower() and len(name_prefix) > 2:
                score += 0.5

            if score >= min_score:
                scored.append((score, idx))

        # Sort by score descending, take top_k
        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, idx in scored[:top_k]:
            tool = dict(self._tools[idx])
            tool["_rag_score"] = round(score, 4)
            results.append(tool)

        return results

    def search_formatted(self, query: str, top_k: int = 5) -> str:
        """
        Search and return formatted context string for injection into P's prompt.
        This is what P's assistant returns to help P decide which tool to use.
        """
        results = self.search(query, top_k=top_k)
        if not results:
            return "No matching tools found in registry."

        lines = [f"## P's Assistant — Tool Discovery Results ({len(results)} matches)\n"]
        for tool in results:
            name = tool.get("name", "unknown")
            desc = tool.get("description", "No description")
            params = tool.get("parameters", {})
            props = params.get("properties", {}) if isinstance(params, dict) else {}
            required = params.get("required", []) if isinstance(params, dict) else []

            param_summary = []
            for pname, pinfo in props.items():
                ptype = pinfo.get("type", "STRING") if isinstance(pinfo, dict) else "STRING"
                req_marker = " [REQUIRED]" if pname in required else ""
                pdesc = pinfo.get("description", "") if isinstance(pinfo, dict) else ""
                param_summary.append(f"    - {pname} ({ptype}){req_marker}: {pdesc}")

            lines.append(f"### `{name}` (relevance: {tool.get('_rag_score', 0):.2f})")
            lines.append(f"  {desc}")
            if param_summary:
                lines.append("  Parameters:")
                lines.extend(param_summary)
            lines.append("")

        return "\n".join(lines)

    def get_tool_by_name(self, name: str) -> dict[str, Any] | None:
        """Direct lookup by exact tool name."""
        for tool in self._tools:
            if tool.get("name") == name:
                return tool
        return None

    def list_all_names(self) -> list[str]:
        """Return all tool names in the registry."""
        return [t.get("name", "") for t in self._tools]

    @property
    def tool_count(self) -> int:
        return len(self._tools)


# --- SINGLETON ---
_INDEX: ToolIndex | None = None

def get_index() -> ToolIndex:
    """Get or create the singleton tool index."""
    global _INDEX
    if _INDEX is None:
        _INDEX = ToolIndex()
    return _INDEX

def search_tools(query: str, top_k: int = 5, min_score: float = 0.05) -> list[dict[str, Any]]:
    """Convenience function: search for tools matching a query."""
    return get_index().search(query, top_k=top_k, min_score=min_score)

def search_tools_formatted(query: str, top_k: int = 5) -> str:
    """Convenience function: search and return formatted context."""
    return get_index().search_formatted(query, top_k=top_k)

def get_tool(name: str) -> dict[str, Any] | None:
    """Convenience function: lookup a tool by exact name."""
    return get_index().get_tool_by_name(name)


if __name__ == "__main__":
    import sys
    idx = ToolIndex()
    print(f"Loaded {idx.tool_count} tools from registry.\n")

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "A relations management platform contacts"

    print(f"Query: {query!r}\n")
    print(idx.search_formatted(query))
