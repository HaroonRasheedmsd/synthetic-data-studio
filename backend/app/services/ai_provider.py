import google.generativeai as genai
from app.core.config import settings
from app.schemas.models import GenerationPlan, TableSchema, ColumnSchema
import json
import time

class AIManager:
    def __init__(self):
        self.model = None
        self.keys = self._collect_keys()
        self.current_key_idx = 0
        self._init_model()

    def _collect_keys(self) -> list[str]:
        keys = []
        # 1. Comma-separated list if provided
        if hasattr(settings, "GEMINI_API_KEYS") and settings.GEMINI_API_KEYS:
            keys.extend([k.strip() for k in settings.GEMINI_API_KEYS.split(",") if k.strip()])
        
        # 2. Key 1 through 10
        for i in range(1, 10):
            attr_name = f"GEMINI_API_KEY_{i}"
            val = getattr(settings, attr_name, "")
            if val and val.strip():
                keys.append(val.strip())
                
        # 3. Standard GEMINI_API_KEY
        if hasattr(settings, "GEMINI_API_KEY") and settings.GEMINI_API_KEY:
            keys.append(settings.GEMINI_API_KEY.strip())
            
        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for k in keys:
            if k not in seen:
                seen.add(k)
                deduped.append(k)
        return deduped

    def _init_model(self):
        self.keys = self._collect_keys()
        valid_keys = [k for k in self.keys if k and k.strip()]
        if not valid_keys:
            return

        # Start from the current key and try all
        for i in range(len(valid_keys)):
            idx = (self.current_key_idx + i) % len(valid_keys)
            try:
                genai.configure(api_key=valid_keys[idx])
                available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                if available_models:
                    flash_models = [m for m in available_models if 'flash' in m.lower()]
                    model_name = flash_models[0] if flash_models else available_models[0]
                    self.model = genai.GenerativeModel(model_name)
                    self.current_key_idx = idx
                    return
            except Exception as e:
                continue

    def _get_fallback_plan(self) -> GenerationPlan:
        # Fallback e-commerce schema to keep the hackathon demo alive if AI totally fails
        return GenerationPlan(
            domain="E-Commerce Fallback",
            tables=[
                TableSchema(
                    name="users",
                    columns=[
                        ColumnSchema(name="id", data_type="uuid", faker_provider="uuid4", is_primary_key=True),
                        ColumnSchema(name="name", data_type="str", faker_provider="name"),
                        ColumnSchema(name="email", data_type="str", faker_provider="email", is_unique=True)
                    ]
                )
            ]
        )

    def infer_schema(self, description: str) -> GenerationPlan:
        if not self.model:
            self._init_model()
            
        if not self.model:
            # If we don't even have a valid key, return the fallback immediately
            return self._get_fallback_plan()
            
        prompt = f"""
        You are an expert Database Architect. The user wants to build a synthetic database.
        Create a GenerationPlan for this requirement: "{description}"
        
        CRITICAL RULES FOR faker_provider:
        You MUST ONLY use the following exact strings for faker_provider:
        name, first_name, last_name, email, phone_number, address, city, country, company, job, 
        date, date_of_birth, word, sentence, text, uuid4, random_int, random_number, url, ipv4, 
        boolean, user_name, password.
        DO NOT invent providers like "product_name" or "status". Use "word" or "random_int" instead.

        STATISTICAL DISTRIBUTIONS:
        If the user prompt includes sample numeric boundaries (e.g., min, max, mean), you MUST explicitly set 
        `min_value` and `max_value` in the ColumnSchema so the generated data strictly follows that distribution.

        CONSTRAINTS:
        You can define business rules in the `constraints` array.
        The `rule` must be a valid Pandas query string (e.g. "age >= 18", "salary > 0", "start_date < end_date").
        These will be evaluated against the generated data to validate correctness.

        Return ONLY valid JSON that precisely matches this JSON Schema. DO NOT wrap it in markdown.
        Schema: {GenerationPlan.model_json_schema()}
        """
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(response_mime_type="application/json")
                )
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                try:
                    return GenerationPlan.model_validate_json(text)
                except Exception as e:
                    raise ValueError(f"AI returned invalid schema: {e}\nRaw: {text}")
                    
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "Quota" in error_str:
                    # Switch to the next key and wait a moment
                    self.current_key_idx = (self.current_key_idx + 1) % len(self.keys)
                    self._init_model()
                    time.sleep(2)
                    continue
                else:
                    if attempt == max_retries - 1:
                        print(f"AI schema generation failed: {error_str}")
                        return self._get_fallback_plan()
        
        print("All API retries exhausted. Returning fallback schema.")
        return self._get_fallback_plan()
