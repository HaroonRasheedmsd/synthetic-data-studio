from fastapi import APIRouter, HTTPException
from app.schemas.models import InferenceRequest, DatabaseSchema
from app.services.ai_provider import AIManager

router = APIRouter()
ai_manager = AIManager()

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
