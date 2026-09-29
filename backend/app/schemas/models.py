from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ColumnSchema(BaseModel):
    name: str
    data_type: str
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    references_column: Optional[str] = None
    faker_provider: str = "word"
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class TableSchema(BaseModel):
    name: str
    columns: List[ColumnSchema]
    row_count: int = 100

class ScenarioConfig(BaseModel):
    missing_value_rate: float = 0.0
    outlier_rate: float = 0.0
    duplicate_rate: float = 0.0

class Constraint(BaseModel):
    table: str
    rule: str
    description: str

class GenerationPlan(BaseModel):
    project_name: str = "Synthetic Data Studio"
    locale: str = "en_US"
    currency: str = "USD"
    tables: List[TableSchema]
    scenarios: ScenarioConfig = ScenarioConfig()
    constraints: List[Constraint] = []

class InferenceRequest(BaseModel):
    description: str = Field(..., description="Natural language description")

class ValidationIssue(BaseModel):
    table: str
    issue_type: str
    description: str

class QualityReport(BaseModel):
    total_rows: int
    referential_integrity_passed: bool
    missing_value_rate: float
    issues: List[ValidationIssue]

class PrivacyReport(BaseModel):
    exact_duplicates: int
    identifier_leakage_risk: str

class GenerateRequest(BaseModel):
    plan: GenerationPlan

class GenerateResponse(BaseModel):
    data: Dict[str, List[Dict[str, Any]]]
    quality_report: QualityReport
    privacy_report: PrivacyReport
    message: str = "Generated successfully"
