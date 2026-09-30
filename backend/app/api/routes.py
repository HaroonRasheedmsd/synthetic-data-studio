from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from app.schemas.models import InferenceRequest, GenerationPlan, GenerateRequest, GenerateResponse
from app.services.ai_provider import AIManager
from app.services.generator import DataGenerator
from app.services.document_generator import DocumentGenerator
import pandas as pd
import io
import json

router = APIRouter()
ai_manager = AIManager()
data_generator = DataGenerator()
document_generator = DocumentGenerator()

@router.post("/schema/infer", response_model=GenerationPlan)
def infer_schema(request: InferenceRequest):
    try:
        return ai_manager.infer_schema(request.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/schema/infer-csv", response_model=GenerationPlan)
async def infer_schema_from_csv(file: UploadFile = File(...)):
    """Infer a GenerationPlan from an uploaded CSV file, creating a full relational ecosystem and enabling document generation."""
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        # Build a description for AI from the CSV structure
        col_info = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            if pd.api.types.is_numeric_dtype(df[col]):
                min_val = round(float(df[col].min()), 2)
                max_val = round(float(df[col].max()), 2)
                mean_val = round(float(df[col].mean()), 2)
                col_info.append(f"{col} ({dtype}, min:{min_val}, max:{max_val}, mean:{mean_val})")
            else:
                sample = str(df[col].dropna().iloc[0]) if len(df[col].dropna()) > 0 else "N/A"
                col_info.append(f"{col} ({dtype}, sample: {sample})")
        
        table_base_name = file.filename.replace('.csv', '').replace(' ', '_').lower()
        description = (
            f"Build a complete multi-relational database around an uploaded CSV table named '{table_base_name}' "
            f"with {len(df)} sample rows and columns: {', '.join(col_info)}. "
            f"Create the primary table '{table_base_name}' matching these columns, and ALSO generate 1 to 2 related parent/child "
            f"relational tables connected via foreign key constraints (e.g. 1:N or N:M relationships). "
            f"Also enable document generation for invoices and bank statements."
        )
        plan = ai_manager.infer_schema(description)
        
        # Ensure all engines are explicitly enabled on the generated plan
        plan.engines = {
            "tabular": True,
            "relational": True,
            "document": True
        }
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=GenerateResponse)
def generate_data(request: GenerateRequest):
    try:
        data, quality, privacy = data_generator.generate_world(request.plan)
        return GenerateResponse(data=data, quality_report=quality, privacy_report=privacy)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/csv/{table_name}")
def export_table_csv(table_name: str, data: str):
    """Download a specific table as a CSV file. Pass data as JSON string query param."""
    try:
        rows = json.loads(data)
        df = pd.DataFrame(rows)
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={table_name}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/invoices")
def generate_invoices(request: GenerateRequest):
    """Generate HTML documents from the synthetic world data."""
    try:
        data, quality, privacy = data_generator.generate_world(request.plan)
        documents = document_generator.generate_documents(data, request.plan)
        return {
            "invoices": documents,
            "count": len(documents),
            "message": f"Generated {len(documents)} documents from synthetic world data."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
