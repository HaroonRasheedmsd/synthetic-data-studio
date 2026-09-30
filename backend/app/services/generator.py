import pandas as pd
from faker import Faker
from app.schemas.models import GenerationPlan, TableSchema, QualityReport, ValidationIssue, PrivacyReport
from typing import Dict, List, Any
import random
import numpy as np

PROVIDER_MAP = {
    "int": "random_int",
    "integer": "random_int",
    "number": "random_int",
    "float": "pyfloat",
    "decimal": "pyfloat",
    "double": "pyfloat",
    "string": "word",
    "str": "word",
    "text": "text",
    "uuid": "short_id",
    "uuid4": "short_id",
    "short_id": "short_id",
    "boolean": "boolean",
    "bool": "boolean",
    "date": "date",
    "datetime": "date_time",
    "email": "email",
    "name": "name",
    "full_name": "name",
    "first_name": "first_name",
    "last_name": "last_name",
    "phone": "phone_number",
    "phone_number": "phone_number",
    "address": "address",
    "city": "city",
    "country": "country",
    "company": "company",
    "job": "job",
    "url": "url",
    "ipv4": "ipv4",
    "iban": "iban",
}

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

    def _sort_tables_topologically(self, tables: List[TableSchema]) -> List[TableSchema]:
        """Ensure parent tables are generated before child tables that reference them."""
        table_map = {t.name: t for t in tables}
        dependencies = {t.name: set() for t in tables}
        
        for table in tables:
            for col in table.columns:
                if col.is_foreign_key and col.references_table and col.references_table in table_map:
                    if col.references_table != table.name:
                        dependencies[table.name].add(col.references_table)

        sorted_tables = []
        visited = set()

        def visit(table_name):
            if table_name in visited or table_name not in table_map:
                return
            for dep in dependencies.get(table_name, []):
                visit(dep)
            visited.add(table_name)
            sorted_tables.append(table_map[table_name])

        for t in tables:
            visit(t.name)

        return sorted_tables

    def _get_parent_pk_column_name(self, parent_table_schema: TableSchema) -> str:
        """Find the exact primary key column name in the parent table schema."""
        for c in parent_table_schema.columns:
            if c.is_primary_key:
                return c.name
        for c in parent_table_schema.columns:
            if c.name.endswith("_id") or c.name == "id":
                return c.name
        return parent_table_schema.columns[0].name if parent_table_schema.columns else "id"

    def _get_table_prefix(self, table_name: str) -> str:
        """Generate a unique uppercase prefix for table primary key short IDs."""
        words = table_name.replace("-", "_").split("_")
        if len(words) >= 2:
            return "".join(w[0] for w in words if w).upper()[:4]
        return table_name[:3].upper()

    def generate_world(self, plan: GenerationPlan):
        fake = self._get_faker(plan.locale)
        database_data = {}
        table_schema_map = {t.name: t for t in plan.tables}
        issues = []

        # Topologically sort tables so parent PKs exist before child FKs
        sorted_tables = self._sort_tables_topologically(plan.tables)

        for table in sorted_tables:
            rows = []
            prefix = self._get_table_prefix(table.name)
            
            for row_idx in range(1, table.row_count + 1):
                row = {}
                for col in table.columns:
                    # Case 1: Primary Key Column
                    if col.is_primary_key:
                        if col.data_type and "str" in col.data_type.lower() or col.faker_provider in ["uuid", "uuid4", "short_id", "iban"]:
                            row[col.name] = f"{prefix}-{row_idx + 100}"
                        else:
                            row[col.name] = row_idx + 100
                            
                    # Case 2: Foreign Key Column
                    elif col.is_foreign_key and col.references_table:
                        ref_table = col.references_table
                        if ref_table in database_data and database_data[ref_table]:
                            parent_rows = database_data[ref_table]
                            random_parent = random.choice(parent_rows)
                            
                            parent_schema = table_schema_map.get(ref_table)
                            target_ref_col = col.references_column
                            if not target_ref_col and parent_schema:
                                target_ref_col = self._get_parent_pk_column_name(parent_schema)

                            val = None
                            if target_ref_col and target_ref_col in random_parent:
                                val = random_parent[target_ref_col]
                            else:
                                val = list(random_parent.values())[0] if random_parent else 101

                            row[col.name] = val
                        else:
                            ref_prefix = self._get_table_prefix(ref_table)
                            row[col.name] = f"{ref_prefix}-101"
                            
                    # Case 3: Regular Attribute Field
                    else:
                        if col.faker_provider in ["uuid", "uuid4", "short_id"] or col.name.lower() in ["id", "uuid"]:
                            row[col.name] = f"{prefix}-{row_idx + 100}"
                            continue

                        try:
                            provider_name = col.faker_provider
                            if provider_name in PROVIDER_MAP:
                                provider_name = PROVIDER_MAP[provider_name]
                            elif hasattr(col, 'data_type') and col.data_type and col.data_type.lower() in PROVIDER_MAP:
                                provider_name = PROVIDER_MAP[col.data_type.lower()]

                            if provider_name == "short_id":
                                val = f"{prefix}-{row_idx + 100}"
                            else:
                                faker_func = getattr(fake, provider_name, fake.word)
                                val = faker_func()

                            if isinstance(val, (int, float)):
                                if col.min_value is not None: val = max(val, col.min_value)
                                if col.max_value is not None: val = min(val, col.max_value)
                                if col.data_type and "int" in col.data_type.lower() and isinstance(val, float):
                                    val = int(val)
                            row[col.name] = val
                        except Exception:
                            row[col.name] = fake.word()
                rows.append(row)
                
            df = pd.DataFrame(rows)
            
            # Scenario Engine (Missing Values, Outliers, Duplicates)
            if plan.scenarios.missing_value_rate > 0 and len(df) > 0:
                pk_cols = [c.name for c in table.columns if c.is_primary_key or c.is_foreign_key]
                non_pk_cols = [c for c in df.columns if c not in pk_cols]
                if non_pk_cols:
                    mask = np.random.rand(len(df), len(non_pk_cols)) < plan.scenarios.missing_value_rate
                    df[non_pk_cols] = df[non_pk_cols].mask(mask, None)

            if plan.scenarios.outlier_rate > 0 and len(df) > 0:
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                non_pk_numeric = [c for c in numeric_cols if c not in [col.name for col in table.columns if col.is_primary_key or col.is_foreign_key]]
                for c in non_pk_numeric:
                    outlier_mask = np.random.rand(len(df)) < plan.scenarios.outlier_rate
                    df.loc[outlier_mask, c] = df[c] * 10

            if plan.scenarios.duplicate_rate > 0 and len(df) > 0:
                num_duplicates = int(len(df) * plan.scenarios.duplicate_rate)
                if num_duplicates > 0:
                    duplicates = df.sample(n=num_duplicates, replace=True)
                    df = pd.concat([df, duplicates], ignore_index=True)
                    
            database_data[table.name] = df.replace({np.nan: None}).to_dict(orient="records")

        # Post-Processing: Cross-Table Mathematical Reconciliation
        # (e.g. order_items sums reconcile to orders.total_amount & payments.amount_paid)
        for t_name, rows in database_data.items():
            if "item" in t_name.lower() or "line" in t_name.lower():
                fk_col = next((c.name for c in table_schema_map[t_name].columns if c.is_foreign_key and "order" in c.references_table.lower()), None) if t_name in table_schema_map else None
                if fk_col:
                    parent_t = table_schema_map[t_name].columns[0].references_table
                    totals_by_parent = {}
                    for r in rows:
                        p_val = r.get(fk_col)
                        price = float(r.get("unit_price") or r.get("price") or 15.0)
                        qty = int(r.get("quantity") or r.get("qty") or 1)
                        item_sum = round(price * qty, 2)
                        r["item_total"] = item_sum
                        if p_val:
                            totals_by_parent[p_val] = totals_by_parent.get(p_val, 0.0) + item_sum
                    
                    if parent_t and parent_t in database_data:
                        for p_row in database_data[parent_t]:
                            p_pk = p_row.get("id") or list(p_row.values())[0]
                            if p_pk in totals_by_parent:
                                if "total_amount" in p_row:
                                    p_row["total_amount"] = round(totals_by_parent[p_pk], 2)
                                elif "total" in p_row:
                                    p_row["total"] = round(totals_by_parent[p_pk], 2)

            # Reconcile payments amount_paid with orders total_amount
            if "payment" in t_name.lower():
                fk_col = next((c.name for c in table_schema_map[t_name].columns if c.is_foreign_key and "order" in c.references_table.lower()), None) if t_name in table_schema_map else None
                if fk_col and "orders" in database_data:
                    order_totals = {r.get("id"): r.get("total_amount") or r.get("total") for r in database_data["orders"] if r.get("id")}
                    for r in rows:
                        ord_id = r.get(fk_col)
                        if ord_id in order_totals and order_totals[ord_id] is not None:
                            if "amount_paid" in r:
                                r["amount_paid"] = round(float(order_totals[ord_id]), 2)
                            elif "amount" in r:
                                r["amount"] = round(float(order_totals[ord_id]), 2)

        # Validation Engine
        total_rows = sum(len(rows) for rows in database_data.values())
        missing_count = 0
        total_cells = 0
        orphan_fks = 0
        
        valid_pks = {}
        for t_schema in plan.tables:
            pk_name = self._get_parent_pk_column_name(t_schema)
            valid_pks[f"{t_schema.name}.{pk_name}"] = set(r.get(pk_name) for r in database_data.get(t_schema.name, []))
            for col in t_schema.columns:
                if col.is_primary_key:
                    valid_pks[f"{t_schema.name}.{col.name}"] = set(r.get(col.name) for r in database_data.get(t_schema.name, []))

        for t_schema in plan.tables:
            rows = database_data.get(t_schema.name, [])
            for r in rows:
                for col in t_schema.columns:
                    val = r.get(col.name)
                    total_cells += 1
                    if val is None: 
                        missing_count += 1
                    
                    if col.is_foreign_key and col.references_table:
                        ref_col_name = col.references_column
                        parent_schema = table_schema_map.get(col.references_table)
                        if not ref_col_name and parent_schema:
                            ref_col_name = self._get_parent_pk_column_name(parent_schema)

                        ref_key = f"{col.references_table}.{ref_col_name}"
                        if ref_key in valid_pks and val not in valid_pks[ref_key] and val is not None:
                            orphan_fks += 1
                            issues.append(ValidationIssue(
                                table=t_schema.name,
                                issue_type="Orphan Foreign Key",
                                description=f"Value '{val}' in {col.name} does not exist in {ref_key}"
                            ))

        # Constraint Engine Validation
        if hasattr(plan, 'constraints') and plan.constraints:
            for constraint in plan.constraints:
                table_data = database_data.get(constraint.table, [])
                if not table_data:
                    continue
                    
                df_eval = pd.DataFrame(table_data)
                try:
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
        
        exact_dups = 0
        for t_name, rows in database_data.items():
            if rows:
                df_dedup = pd.DataFrame(rows).drop_duplicates()
                exact_dups += len(rows) - len(df_dedup)
        
        privacy = PrivacyReport(exact_duplicates=exact_dups, identifier_leakage_risk="Low")
        
        return database_data, quality, privacy
