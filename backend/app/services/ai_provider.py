import google.generativeai as genai
from app.core.config import settings
from app.schemas.models import GenerationPlan
import json

class AIManager:
    def __init__(self):
        self.model = None
        self._init_model()

    def _init_model(self):
        keys = [settings.GEMINI_API_KEY_1, settings.GEMINI_API_KEY_2]
        valid_keys = [k for k in keys if k and k.strip()]
        
        last_error = None
        for key in valid_keys:
            try:
                genai.configure(api_key=key)
                available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                if available_models:
                    flash_models = [m for m in available_models if 'flash' in m.lower()]
                    model_name = flash_models[0] if flash_models else available_models[0]
                    self.model = genai.GenerativeModel(model_name)
                    return
            except Exception as e:
                last_error = e
                continue
                
        if self.model is None and last_error:
            print(f"Warning: Could not configure Gemini model on startup: {last_error}")

    def infer_schema(self, description: str) -> GenerationPlan:
        if not self.model:
            self._init_model()
            
        if not self.model:
            raise ValueError("Gemini API key is not configured or no models are accessible.")
            
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
