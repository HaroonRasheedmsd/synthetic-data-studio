import { useState } from 'react';
import { Database, Key, Copy, Check, Terminal, Code2, ExternalLink } from 'lucide-react';

export default function ApiDocs() {
  const [copied, setCopied] = useState(false);
  const apiKey = "syn_live_98f7a6b5c4d3e2f109876543210fedcba";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in space-y-8 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API &amp; Developer Portal</h1>
        <p className="text-slate-500 text-sm">Integrate the Synthetic Data Studio engine directly into your CI/CD pipelines and automated test suites.</p>
      </div>

      {/* API Key Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-blue-600" />
          <h2 className="font-bold text-slate-900 text-lg">Your API Secret Key</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-900 text-emerald-400 font-mono text-sm px-4 py-3 rounded-xl flex justify-between items-center overflow-x-auto">
            <span>{apiKey}</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2 text-sm shrink-0"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">Pass this key in the header: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">Authorization: Bearer YOUR_API_KEY</code></p>
      </div>

      {/* Interactive Swagger Docs Link */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Terminal size={20} className="text-blue-400" /> FastApi OpenAPI / Swagger UI
          </h3>
          <p className="text-blue-200 text-xs">Explore live endpoints, test payloads, and inspect schema responses directly on the backend server.</p>
        </div>
        <a 
          href="http://127.0.0.1:8000/docs" 
          target="_blank" 
          rel="noreferrer"
          className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          Open Swagger UI <ExternalLink size={16} />
        </a>
      </div>

      {/* Code Examples */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Code2 size={20} className="text-indigo-600" />
          <h2 className="font-bold text-slate-900 text-lg">Endpoint Example: Synthetic Schema Inference</h2>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">cURL Request</h4>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`curl -X POST "http://127.0.0.1:8000/api/schema/infer" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "description": "E-Commerce store with customers, products, and orders"
  }'`}
          </pre>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Python Client Example</h4>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`import requests

url = "http://127.0.0.1:8000/api/generate"
payload = {
    "plan": {
        "domain": "ecommerce",
        "locale": "en_US",
        "tables": [
            {
                "name": "customers",
                "row_count": 50,
                "columns": [
                    {"name": "id", "data_type": "integer", "is_primary_key": True},
                    {"name": "email", "data_type": "email"}
                ]
            }
        ]
    }
}

response = requests.post(url, json=payload)
data = response.json()
print("Generated Rows:", data["quality_report"]["total_rows"])`}
          </pre>
        </div>
      </div>
    </div>
  );
}
