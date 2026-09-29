from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import List, Dict, Any, Optional

class ColumnSchema(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    name: str
    data_type: str = Field(default="string")
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    references_column: Optional[str] = None
    faker_provider: str = "word"
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    is_unique: bool = False

    @model_validator(mode="before")
    @classmethod
    def populate_data_type(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Accept both `type` and `data_type` seamlessly
            if "type" in data and ("data_type" not in data or not data["data_type"]):
                data["data_type"] = data["type"]
            elif "data_type" in data and ("type" not in data or not data["type"]):
                data["type"] = data["data_type"]
        return data

class TableSchema(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    name: str
    columns: List[ColumnSchema]
    row_count: int = 100

class ScenarioConfig(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    missing_value_rate: float = 0.0
    outlier_rate: float = 0.0
    duplicate_rate: float = 0.0

class Constraint(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    table: str
    rule: str
    description: str

class GenerationPlan(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    domain: Optional[str] = None
    project_name: str = "Synthetic Data Studio"
    locale: str = "en_US"
    currency: str = "USD"
    tables: List[TableSchema]
    scenarios: ScenarioConfig = ScenarioConfig()
    constraints: List[Constraint] = []
    engines: Optional[Dict[str, bool]] = None

class InferenceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    description: str = Field(..., description="Natural language description")

class ValidationIssue(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    table: str
    issue_type: str
    description: str

class QualityReport(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    total_rows: int
    referential_integrity_passed: bool
    missing_value_rate: float
    issues: List[ValidationIssue] = []

class PrivacyReport(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    exact_duplicates: int
    identifier_leakage_risk: str

class GenerateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    plan: GenerationPlan

class GenerateResponse(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    data: Dict[str, List[Dict[str, Any]]]
    quality_report: QualityReport
    privacy_report: PrivacyReport
    message: str = "Generated successfully"

