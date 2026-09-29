import pandas as pd
from faker import Faker
from app.schemas.models import DatabaseSchema, TableSchema
from typing import Dict, List, Any
import random

# We use Faker to generate realistic fake data (names, emails, dates)
fake = Faker()

class DataGenerator:
    """
    The engine that turns an AI schema into actual rows of data using Pandas and Faker.
    """
    
    def generate_database(self, schema: DatabaseSchema) -> Dict[str, List[Dict[str, Any]]]:
        """
        Generates data for all tables in the schema, respecting foreign key relationships.
        Returns a dictionary where keys are table names, and values are lists of rows (dicts).
        """
        database_data = {}
        
        # In a real app, we would dynamically sort tables so parent tables (like Customers) 
        # generate before child tables (like Orders). 
        # For this hackathon, we assume the AI is smart enough to list parents first.
        for table in schema.tables:
            # Generate the table data
            df = self._generate_table(table, database_data)
            
            # Convert the Pandas DataFrame into a list of dictionaries (JSON format)
            # This makes it easy to send over the internet to our React frontend.
            database_data[table.name] = df.to_dict(orient="records")
            
        return database_data

    def _generate_table(self, table: TableSchema, existing_data: Dict[str, List[Dict[str, Any]]]) -> pd.DataFrame:
        """
        Generates rows for a single table.
        """
        rows = []
        
        for _ in range(table.row_count):
            row = {}
            for col in table.columns:
                
                # 1. Foreign Key Handling
                # If this column links to another table, we must pick a valid ID from that parent table
                # instead of generating a random string.
                if col.is_foreign_key and col.references_table:
                    if col.references_table in existing_data and existing_data[col.references_table]:
                        parent_rows = existing_data[col.references_table]
                        random_parent = random.choice(parent_rows)
                        row[col.name] = random_parent.get(col.references_column)
                    else:
                        row[col.name] = None
                
                # 2. Standard Data Generation
                else:
                    try:
                        # We ask Faker to run the specific provider the AI suggested 
                        # (e.g., if AI said 'email', we run fake.email())
                        faker_function = getattr(fake, col.faker_provider)
                        row[col.name] = faker_function()
                    except AttributeError:
                        # Fallback: if the AI halluncinates a fake provider name, just generate a random word
                        row[col.name] = fake.word()
                        
            rows.append(row)
            
        # Pandas DataFrames are incredible for data manipulation and speed.
        return pd.DataFrame(rows)
