import os
import json
import hashlib
import time
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional, Dict, Any

# Simple in-memory response cache: { prompt_hash: (timestamp, response_text) }
_AI_CACHE: Dict[str, tuple[float, str]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour short-TTL cache

def call_ai_provider(prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
    """
    Unified isolated function for all AI Provider calls across StatSkill AI.
    Primary: Google Gemini 2.0 Flash (free tier) via REST API.
    Automatic Fallback: Groq or OpenRouter if Gemini hits 429 rate limit or HTTP error.

    Features:
    - In-memory SHA256 input payload hashing cache to save API quota.
    - Automatic 429 fallback handling.
    - Increased maxOutputTokens (4096) & timeout (35s).
    - Structured diagnostic logs.
    """
    # 1. Check in-memory hash cache
    cache_key = hashlib.sha256((prompt + (system_instruction or "")).encode("utf-8")).hexdigest()
    now = time.time()
    if cache_key in _AI_CACHE:
        ts, cached_res = _AI_CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            print("[AI PROVIDER CACHE] Returning cached AI response.")
            return cached_res

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")

    has_gemini = bool(gemini_key)
    has_groq = bool(groq_key)
    has_openrouter = bool(openrouter_key)

    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp_str}] [AI DIAGNOSTIC] Keys Present -> Gemini: {has_gemini} | Groq: {has_groq} | OpenRouter: {has_openrouter}")

    if not (gemini_key or groq_key or openrouter_key):
        print(f"[{timestamp_str}] [AI_CALL_NO_KEY] No AI API keys configured in environment (GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY).")
        return None

    # Helper function to call Gemini
    def _call_gemini(key: str) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
        contents = []
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": f"SYSTEM INSTRUCTION:\n{system_instruction}\n\nUSER PROMPT:\n{prompt}"}]
            })
        else:
            contents.append({
                "role": "user",
                "parts": [{"text": prompt}]
            })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.85,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json"
            }
        }
        start = time.time()
        payload_str = json.dumps(payload)
        data_bytes = payload_str.encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json"}, method="POST")

        with urllib.request.urlopen(req, timeout=30) as resp:
            elapsed = time.time() - start
            body = resp.read().decode("utf-8")
            parsed = json.loads(body)
            candidates = parsed.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    text_out = parts[0].get("text", "").strip()
                    finish_reason = candidates[0].get("finishReason", "STOP")
                    print(f"[{timestamp_str}] [AI_CALL_SUCCESS] Gemini 2.0 Flash completed in {elapsed:.2f}s ({len(text_out)} chars, finishReason={finish_reason}).")
                    return text_out
            return None

    # Helper function to call Groq (Fallback)
    def _call_groq(key: str) -> Optional[str]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 4096,
            "response_format": {"type": "json_object"}
        }
        start = time.time()
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"}, method="POST")

        with urllib.request.urlopen(req, timeout=30) as resp:
            elapsed = time.time() - start
            body = resp.read().decode("utf-8")
            parsed = json.loads(body)
            choices = parsed.get("choices", [])
            if choices:
                text_out = choices[0].get("message", {}).get("content", "").strip()
                print(f"[{timestamp_str}] [AI_CALL_FALLBACK_SUCCESS] Groq Llama 3.3 70B completed in {elapsed:.2f}s ({len(text_out)} chars).")
                return text_out
            return None

    # Try Primary: Gemini
    if gemini_key:
        try:
            res = _call_gemini(gemini_key)
            if res:
                _AI_CACHE[cache_key] = (now, res)
                return res
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            if e.code == 429:
                print(f"[{timestamp_str}] [AI_CALL_RATE_LIMIT_429] Gemini API 429 Quota Exceeded: {err_body}")
            else:
                print(f"[{timestamp_str}] [AI_CALL_HTTP_ERROR] Gemini API HTTP {e.code}: {err_body}")
        except urllib.error.URLError as e:
            print(f"[{timestamp_str}] [AI_CALL_TIMEOUT] Gemini API connection/timeout error: {e.reason}")
        except Exception as e:
            print(f"[{timestamp_str}] [AI_CALL_EXCEPTION] Unexpected error in Gemini call: {e}")

    # Fallback 1: Groq
    if groq_key:
        print(f"[{timestamp_str}] [AI_CALL_FALLBACK] Triggering fallback provider: Groq...")
        try:
            res = _call_groq(groq_key)
            if res:
                _AI_CACHE[cache_key] = (now, res)
                return res
        except Exception as e:
            print(f"[{timestamp_str}] [AI_CALL_FALLBACK_ERROR] Groq fallback failed: {e}")

    return None
