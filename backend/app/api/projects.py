from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..db.database import get_db, Project
from .auth import get_current_user, User
import json

router = APIRouter(prefix="/api/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    plan_json: str
    metadata_json: str = "{}"

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    plan_json: str
    metadata_json: str
    created_at: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        results.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "metadata_json": p.metadata_json,
            "plan_json": p.plan_json,
            "created_at": p.created_at.isoformat()
        })
    return results

@router.post("", response_model=dict)
@router.post("/", response_model=dict)
def create_project(proj: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_proj = Project(
        user_id=current_user.id,
        name=proj.name,
        description=proj.description,
        plan_json=proj.plan_json,
        metadata_json=proj.metadata_json
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return {"id": new_proj.id, "name": new_proj.name}
