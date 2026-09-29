export const PRESETS = {
  "E-Commerce": {
    domain: "E-Commerce",
    project_name: "E-Commerce Environment",
    locale: "en_US",
    currency: "USD",
    tables: [
      {
        name: "customers",
        row_count: 50,
        columns: [
          { name: "id", data_type: "int", is_primary_key: true, is_foreign_key: false, faker_provider: "random_int" },
          { name: "name", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "name" },
          { name: "email", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "email" },
          { name: "address", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "address" },
        ]
      },
      {
        name: "products",
        row_count: 20,
        columns: [
          { name: "id", data_type: "int", is_primary_key: true, is_foreign_key: false, faker_provider: "random_int" },
          { name: "title", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "word" },
          { name: "price", data_type: "float", is_primary_key: false, is_foreign_key: false, faker_provider: "random_int", min_value: 5, max_value: 500 },
        ]
      },
      {
        name: "orders",
        row_count: 100,
        columns: [
          { name: "id", data_type: "int", is_primary_key: true, is_foreign_key: false, faker_provider: "random_int" },
          { name: "customer_id", data_type: "int", is_primary_key: false, is_foreign_key: true, references_table: "customers", references_column: "id", faker_provider: "random_int" },
          { name: "order_date", data_type: "date", is_primary_key: false, is_foreign_key: false, faker_provider: "date" },
          { name: "status", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "word" },
        ]
      }
    ],
    scenarios: { missing_value_rate: 0, outlier_rate: 0, duplicate_rate: 0 },
    engines: { tabular: true, relational: true, document: true }
  },
  "Banking": {
    domain: "Banking",
    project_name: "Banking Environment",
    locale: "en_US",
    currency: "USD",
    tables: [
      {
        name: "accounts",
        row_count: 30,
        columns: [
          { name: "account_number", data_type: "string", is_primary_key: true, is_foreign_key: false, faker_provider: "iban" },
          { name: "owner_name", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "name" },
          { name: "balance", data_type: "float", is_primary_key: false, is_foreign_key: false, faker_provider: "random_int", min_value: 100, max_value: 100000 },
        ]
      },
      {
        name: "transactions",
        row_count: 100,
        columns: [
          { name: "tx_id", data_type: "string", is_primary_key: true, is_foreign_key: false, faker_provider: "uuid4" },
          { name: "account_number", data_type: "string", is_primary_key: false, is_foreign_key: true, references_table: "accounts", references_column: "account_number", faker_provider: "word" },
          { name: "amount", data_type: "float", is_primary_key: false, is_foreign_key: false, faker_provider: "random_int", min_value: -5000, max_value: 5000 },
          { name: "date", data_type: "date", is_primary_key: false, is_foreign_key: false, faker_provider: "date" },
        ]
      }
    ],
    scenarios: { missing_value_rate: 0, outlier_rate: 0, duplicate_rate: 0 },
    engines: { tabular: true, relational: true, document: true }
  },
  "Healthcare": {
    domain: "Healthcare",
    project_name: "Healthcare Environment",
    locale: "en_US",
    currency: "USD",
    tables: [
      {
        name: "patients",
        row_count: 40,
        columns: [
          { name: "patient_id", data_type: "string", is_primary_key: true, is_foreign_key: false, faker_provider: "uuid4" },
          { name: "name", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "name" },
          { name: "dob", data_type: "date", is_primary_key: false, is_foreign_key: false, faker_provider: "date_of_birth" },
        ]
      },
      {
        name: "appointments",
        row_count: 100,
        columns: [
          { name: "appt_id", data_type: "string", is_primary_key: true, is_foreign_key: false, faker_provider: "uuid4" },
          { name: "patient_id", data_type: "string", is_primary_key: false, is_foreign_key: true, references_table: "patients", references_column: "patient_id", faker_provider: "word" },
          { name: "doctor_name", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "name" },
          { name: "date", data_type: "date", is_primary_key: false, is_foreign_key: false, faker_provider: "date" },
        ]
      }
    ],
    scenarios: { missing_value_rate: 0, outlier_rate: 0, duplicate_rate: 0 },
    engines: { tabular: true, relational: true, document: true }
  },
  "Education": {
    domain: "Education",
    project_name: "Education Environment",
    locale: "en_US",
    currency: "USD",
    tables: [
      {
        name: "students",
        row_count: 30,
        columns: [
          { name: "student_id", data_type: "int", is_primary_key: true, is_foreign_key: false, faker_provider: "random_int" },
          { name: "name", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "name" },
          { name: "major", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "job" },
        ]
      },
      {
        name: "enrollments",
        row_count: 80,
        columns: [
          { name: "enrollment_id", data_type: "string", is_primary_key: true, is_foreign_key: false, faker_provider: "uuid4" },
          { name: "student_id", data_type: "int", is_primary_key: false, is_foreign_key: true, references_table: "students", references_column: "student_id", faker_provider: "random_int" },
          { name: "course_name", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "word" },
          { name: "grade", data_type: "string", is_primary_key: false, is_foreign_key: false, faker_provider: "word" },
        ]
      }
    ],
    scenarios: { missing_value_rate: 0, outlier_rate: 0, duplicate_rate: 0 },
    engines: { tabular: true, relational: true, document: true }
  }
};

// Aliases for camelCase or lowercase access
PRESETS.ecommerce = PRESETS["E-Commerce"];
PRESETS.banking = PRESETS["Banking"];
PRESETS.healthcare = PRESETS["Healthcare"];
PRESETS.education = PRESETS["Education"];
