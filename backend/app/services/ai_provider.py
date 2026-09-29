import os
import google.generativeai as genai
import json
from app.schemas.models import DatabaseSchema
from app.core.config import get_settings

settings = get_settings()

class AIManager:
    def __init__(self):
        # We MUST read from our settings object, not os.environ directly, 
        # because Pydantic loads the .env file securely into the settings object!
        self.api_key = settings.GEMINI_API_KEY_1
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY_1 is missing in your .env file.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    def infer_schema(self, description: str) -> DatabaseSchema:
        prompt = f"""
        You are a Senior Database Architect. I need a database schema for the following description:
        "{description}"
        
        Design the tables, columns, primary keys, and foreign keys.
        Assign a valid Python 'faker' provider name for EVERY column.
        
        Respond ONLY with a valid JSON object matching this exact structure:
        {{
            "tables": [
                {{
                    "name": "table_name",
                    "columns": [
                        {{
                            "name": "col_name",
                            "data_type": "string",
                            "is_primary_key": true,
                            "is_foreign_key": false,
                            "references_table": null,
                            "references_column": null,
                            "faker_provider": "uuid4"
                        }}
                    ],
                    "row_count": 100
                }}
            ]
        }}
        """
        
        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        schema_dict = json.loads(response.text)
        return DatabaseSchema(**schema_dict)
