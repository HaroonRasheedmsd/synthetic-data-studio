from pydantic import BaseModel, Field
from typing import List, Optional

class ColumnSchema(BaseModel):
    name: str = Field(..., description="Name of the column")
    data_type: str = Field(..., description="Data type (e.g., integer, string, boolean, date)")
    is_primary_key: bool = Field(default=False)
    is_foreign_key: bool = Field(default=False)
    references_table: Optional[str] = Field(default=None, description="If foreign key, the table it references")
    references_column: Optional[str] = Field(default=None, description="If foreign key, the column it references")
    faker_provider: str = Field(..., description="The Faker provider to use for generation (e.g., 'name', 'email', 'random_int')")

class TableSchema(BaseModel):
    name: str = Field(..., description="Name of the table")
    columns: List[ColumnSchema]
    row_count: int = Field(default=100, description="Default number of rows to generate")

class DatabaseSchema(BaseModel):
    tables: List[TableSchema]

class InferenceRequest(BaseModel):
    description: str = Field(..., description="Natural language description of the data to generate")

class GenerateRequest(BaseModel):
    schema_def: DatabaseSchema = Field(..., description="The schema to generate data for")

class GenerateResponse(BaseModel):
    data: dict = Field(..., description="A dictionary of table names to lists of rows")
    message: str = "Data generated successfully"
