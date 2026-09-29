import pandas as pd
from faker import Faker
from app.schemas.models import GenerationPlan, TableSchema, QualityReport, ValidationIssue, PrivacyReport
from typing import Dict, List, Any
import random
import numpy as np

class DataGenerator:
    def __init__(self):
        self.fakers = {} 
        
    def _get_faker(self, locale: str):
        if locale == 'ur_PK':
            locale = 'fa_IR'
        if locale not in self.fakers:
            try:
                self.fakers[locale] = Faker(locale)
            except:
                self.fakers[locale] = Faker()
        return self.fakers[locale]

    def generate_world(self, plan: GenerationPlan):
        fake = self._get_faker(plan.locale)
        database_data = {}
        issues = []
        
        for table in plan.tables:
            rows = []
            for _ in range(table.row_count):
                row = {}
                for col in table.columns:
                    if col.is_foreign_key and col.references_table:
                        if col.references_table in database_data and database_data[col.references_table]:
                            parent_rows = database_data[col.references_table]
                            random_parent = random.choice(parent_rows)
                            row[col.name] = random_parent.get(col.references_column)
                        else:
                            row[col.name] = None
                    else:
                        try:
                            faker_func = getattr(fake, col.faker_provider)
                            val = faker_func()
                            if isinstance(val, (int, float)):
                                if col.min_value is not None: val = max(val, col.min_value)
                                if col.max_value is not None: val = min(val, col.max_value)
                            row[col.name] = val
                        except:
                            row[col.name] = fake.word()
                rows.append(row)
                
            df = pd.DataFrame(rows)
            
            # Scenario Engine
            if plan.scenarios.missing_value_rate > 0 and len(df) > 0:
                mask = np.random.rand(*df.shape) < plan.scenarios.missing_value_rate
                df = df.mask(mask, None)
                
            if plan.scenarios.outlier_rate > 0 and len(df) > 0:
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for c in numeric_cols:
                    outlier_mask = np.random.rand(len(df)) < plan.scenarios.outlier_rate
                    df.loc[outlier_mask, c] = df[c] * 10
            if plan.scenarios.duplicate_rate > 0 and len(df) > 0:
                num_duplicates = int(len(df) * plan.scenarios.duplicate_rate)
                if num_duplicates > 0:
                    duplicates = df.sample(n=num_duplicates, replace=True)
                    df = pd.concat([df, duplicates], ignore_index=True)
                    
            database_data[table.name] = df.replace({np.nan: None}).to_dict(orient="records")

        # Validation Engine
        total_rows = sum(len(rows) for rows in database_data.values())
        missing_count = 0
        total_cells = 0
        orphan_fks = 0
        
        # Build sets of all valid PKs for quick lookup
        valid_pks = {}
        for t_name, t_schema in zip([t.name for t in plan.tables], plan.tables):
            for col in t_schema.columns:
                if col.is_primary_key:
                    valid_pks[f"{t_name}.{col.name}"] = set(r.get(col.name) for r in database_data.get(t_name, []))

        # Check FK integrity and missing values
        for t_schema in plan.tables:
            rows = database_data.get(t_schema.name, [])
            for r in rows:
                for col in t_schema.columns:
                    val = r.get(col.name)
                    total_cells += 1
                    if val is None: 
                        missing_count += 1
                    
                    if col.is_foreign_key and col.references_table and col.references_column:
                        ref_key = f"{col.references_table}.{col.references_column}"
                        if ref_key in valid_pks and val not in valid_pks[ref_key] and val is not None:
                            orphan_fks += 1
                            issues.append(ValidationIssue(
                                table=t_schema.name,
                                issue_type="Orphan Foreign Key",
                                description=f"Value {val} in {col.name} does not exist in {ref_key}"
                            ))

        # Constraint Engine Validation
        if hasattr(plan, 'constraints') and plan.constraints:
            for constraint in plan.constraints:
                table_data = database_data.get(constraint.table, [])
                if not table_data:
                    continue
                    
                df_eval = pd.DataFrame(table_data)
                try:
                    # Find rows that DO NOT match the rule (failures)
                    failed_df = df_eval.query(f"not ({constraint.rule})")
                    if len(failed_df) > 0:
                        issues.append(ValidationIssue(
                            table=constraint.table,
                            issue_type="Constraint Violation",
                            description=f"{len(failed_df)} rows violated rule: {constraint.rule} ({constraint.description})"
                        ))
                except Exception as e:
                    issues.append(ValidationIssue(
                        table=constraint.table,
                        issue_type="Constraint Error",
                        description=f"Could not evaluate rule '{constraint.rule}': {str(e)}"
                    ))

        missing_rate = missing_count / total_cells if total_cells > 0 else 0
        referential_integrity_passed = (orphan_fks == 0)
        
        quality = QualityReport(
            total_rows=total_rows,
            referential_integrity_passed=referential_integrity_passed,
            missing_value_rate=missing_rate,
            issues=issues
        )
        
        # Calculate exact duplicates
        exact_dups = 0
        for t_name, rows in database_data.items():
            if rows:
                df_dedup = pd.DataFrame(rows).drop_duplicates()
                exact_dups += len(rows) - len(df_dedup)
        
        privacy = PrivacyReport(exact_duplicates=exact_dups, identifier_leakage_risk="Low")
        
        return database_data, quality, privacy
