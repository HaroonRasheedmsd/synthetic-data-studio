from fastapi import APIRouter, HTTPException
from app.schemas.models import InferenceRequest, DatabaseSchema, GenerateRequest, GenerateResponse
from app.services.ai_provider import AIManager
from app.services.generator import DataGenerator

router = APIRouter()
ai_manager = AIManager()
data_generator = DataGenerator()

@router.post("/schema/infer", response_model=DatabaseSchema)
def infer_schema(request: InferenceRequest):
    """
    Endpoint to ask Gemini to generate a Database Schema from natural language.
    """
    try:
        schema = ai_manager.infer_schema(request.description)
        return schema
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=GenerateResponse)
def generate_data(request: GenerateRequest):
    """
    Endpoint to generate rows of realistic data based on a JSON Schema.
    """
    try:
        data = data_generator.generate_database(request.schema_def)
        return GenerateResponse(data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
