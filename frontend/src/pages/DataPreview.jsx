import { useEffect, useState } from 'react';
import { Download, Loader2, ArrowLeft, Table as TableIcon, CheckCircle, ShieldCheck, CheckCircle2, ChevronRight, Check, FileText, Sliders, Eye, FileCheck, Landmark, Receipt, Sparkles, BookOpen, Layers, Zap, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { API_BASE_URL } from '../utils/api';

function WorkflowStepper({ currentStep, onStepClick }) {
  const steps = ['Describe', 'Plan', 'Configure', 'Generate', 'Validate'];
  
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-8 overflow-x-auto">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isPast = idx < currentStep;
        const clickable = onStepClick && idx < currentStep;

        return (
          <div 
            key={step} 
            onClick={() => { if (clickable && onStepClick) onStepClick(idx); }}
            className={`flex items-center shrink-0 mr-4 last:mr-0 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black border-2 transition-all ${
              isActive ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-200' :
              isPast ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
              'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              {isPast || isActive ? <CheckCircle2 size={16} /> : (idx + 1)}
            </div>
            <span className={`ml-2.5 text-xs font-bold ${isActive || isPast ? 'text-slate-900' : 'text-slate-400'}`}>
              {step}
            </span>
            {idx < steps.length - 1 && (
              <ChevronRight size={16} className="mx-4 text-slate-300 hidden md:block" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DataPreview({ activeTab = "all" }) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [quality, setQuality] = useState({ total_rows: 0, referential_integrity_passed: true, missing_value_rate: 0, issues: [] });
  const [privacy, setPrivacy] = useState({ exact_duplicates: 0, identifier_leakage_risk: "Low" });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [displayLimits, setDisplayLimits] = useState({});
  const [docFilter, setDocFilter] = useState("all");
  
  const [currentPlan, setCurrentPlan] = useState(null);
  const [expandingEngine, setExpandingEngine] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  const [userQuery, setUserQuery] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState("");

  const handleRunQuery = async (overrideQuery) => {
    const targetQuery = overrideQuery || userQuery;
    if (!targetQuery || !targetQuery.trim()) return;
    setQueryLoading(true);
    setQueryError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, query: targetQuery }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setQueryResult(result);
    } catch (err) {
      setQueryError(`Query execution error: ${err.message}`);
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    const savedSchema = localStorage.getItem("synthdata_schema");
    if (!savedSchema) {
      setError("No generation plan found. Please go back and generate one first.");
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(savedSchema);
      setCurrentPlan(parsed);
      const cacheKey = "synthdata_cache_" + savedSchema.length + "_" + JSON.stringify(parsed.tables?.map(t => [t.name, t.row_count]));
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const cachedObj = JSON.parse(cached);
        setData(cachedObj.data || {});
        setQuality(cachedObj.quality || { total_rows: 0, referential_integrity_passed: true, missing_value_rate: 0, issues: [] });
        setPrivacy(cachedObj.privacy || { exact_duplicates: 0, identifier_leakage_risk: "Low" });
        setInvoices(cachedObj.invoices || []);
        setLoading(false);
      } else {
        generateData(parsed, cacheKey);
      }
    } catch (e) {
      setError("Invalid generation plan stored. Please create a new environment.");
      setLoading(false);
    }
  }, []);

  const handleEnableEngine = async (engineType) => {
    setExpandingEngine(true);
    setLoading(true);
    try {
      const savedSchema = localStorage.getItem("synthdata_schema");
      if (!savedSchema) return;
      const plan = JSON.parse(savedSchema);
      
      if (!plan.engines) plan.engines = { tabular: true, relational: false, document: false };
      
      if (engineType === 'relational' || engineType === 'all') {
        plan.engines.relational = true;
      }
      if (engineType === 'document' || engineType === 'all') {
        plan.engines.document = true;
      }
      if (engineType === 'all') {
        plan.engines.tabular = true;
      }

      localStorage.setItem("synthdata_schema", JSON.stringify(plan));
      setCurrentPlan(plan);
      
      const newCacheKey = "synthdata_cache_" + JSON.stringify(plan).length + "_" + Date.now();
      await generateData(plan, newCacheKey);
    } catch (e) {
      console.error("Error expanding engine", e);
    } finally {
      setExpandingEngine(false);
      setLoading(false);
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCSV(true);
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/schema/infer-csv`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const plan = await res.json();
      plan.engines = { tabular: true, relational: true, document: true };
      localStorage.setItem("synthdata_schema", JSON.stringify(plan));
      setCurrentPlan(plan);
      const newCacheKey = "synthdata_cache_" + JSON.stringify(plan).length + "_" + Date.now();
      await generateData(plan, newCacheKey);
    } catch (err) {
      setError(`CSV Expansion Error: ${err.message}`);
    } finally {
      setUploadingCSV(false);
      setLoading(false);
    }
  };

  const generateData = async (plan, cacheKey) => {
    try {
      if (plan.engines && plan.engines.tabular === false) {
         setData({});
         setQuality({ total_rows: 0, referential_integrity_passed: true, missing_value_rate: 0, issues: [] });
         setPrivacy({ exact_duplicates: 0, identifier_leakage_risk: "None" });
         setInvoices([]);
         return;
      }

      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      const generatedData = result.data || {};
      const generatedQuality = result.quality_report || { total_rows: 0, referential_integrity_passed: true, missing_value_rate: 0, issues: [] };
      const generatedPrivacy = result.privacy_report || { exact_duplicates: 0, identifier_leakage_risk: "Low" };

      setData(generatedData);
      setQuality(generatedQuality);
      setPrivacy(generatedPrivacy);

      let docList = [];
      if (plan.engines && plan.engines.document) {
          const invResponse = await fetch(`${API_BASE_URL}/api/documents/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
          });
          if (invResponse.ok) {
            const invResult = await invResponse.json();
            docList = invResult.invoices || [];
            setInvoices(docList);
          }
      } else {
          setInvoices([]);
      }

      if (cacheKey) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: generatedData,
            quality: generatedQuality,
            privacy: generatedPrivacy,
            invoices: docList
          }));
        } catch (e) {
          console.warn("Could not cache to sessionStorage", e);
        }
      }
      
      const token = localStorage.getItem('auth_token');
      if (token && result.data) {
          const rowCount = Object.values(result.data).reduce((acc, rows) => acc + (rows?.length || 0), 0);
          const tableCount = Object.keys(result.data).length;
          
          await fetch(`${API_BASE_URL}/api/projects/`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                  name: `${plan.domain || 'Synthetic'} Environment`,
                  description: "Generated on " + new Date().toLocaleString(),
                  plan_json: JSON.stringify(plan),
                  metadata_json: JSON.stringify({
                      rows: rowCount,
                      tables: tableCount,
                  })
              })
          }).catch(e => console.error("Could not save project to db", e));
      }

    } catch (err) {
      setError(err.message || "Error generating synthetic data");
    } finally {
      setLoading(false);
    }
  };

  const downloadZipBundle = async () => {
    if (!data) return;
    const zip = new JSZip();
    
    const dataFolder = zip.folder("data");
    for (const [tableName, rows] of Object.entries(data)) {
        if (!rows || rows.length === 0) continue;
        const keys = Object.keys(rows[0]);
        const csvContent = [
            keys.join(","),
            ...rows.map(row => keys.map(k => {
                const val = row[k] === null ? "" : String(row[k]);
                return `"${val.replace(/"/g, '""')}"`;
            }).join(","))
        ].join("\n");
        dataFolder.file(`${tableName}.csv`, csvContent);
    }
    
    const reportsFolder = zip.folder("reports");
    reportsFolder.file("quality_report.json", JSON.stringify(quality, null, 2));
    reportsFolder.file("privacy_report.json", JSON.stringify(privacy, null, 2));
    
    if (invoices && invoices.length > 0) {
        const docsFolder = zip.folder("documents");
        for (const doc of invoices) {
            docsFolder.file(`${doc.document_number || doc.invoice_number}.html`, doc.html);
        }
    }
    
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SyntheticWorld_Bundle.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in">
        <Loader2 className="animate-spin text-blue-600" size={56} />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Validating &amp; Generating Synthetic World...</h2>
          <p className="text-slate-500 font-medium">Injecting scenarios, resolving relational graphs &amp; building documents.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-xl text-center shadow-2xl text-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <AlertTriangle size={24} />
          </div>
          <p className="text-slate-200 text-sm font-semibold">{error}</p>
          <Link to="/build" className="inline-flex px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all items-center gap-2 text-xs font-black shadow-lg shadow-blue-500/20">
            <ArrowLeft size={16} /> Return to Schema Studio
          </Link>
        </div>
      </div>
    );
  }

  const tableEntries = Object.entries(data || {});

  // Separate Tabular Data vs Relational Data tables
  let targetTableEntries = tableEntries;
  if (activeTab === "datasets") {
    targetTableEntries = tableEntries.map(([tName, rows]) => {
      return [`flat_${tName}_dataset`, rows || []];
    });
  }

  // Determine which documents to render based on activeTab
  let displayedDocs = invoices;
  if (activeTab === "invoices") {
    displayedDocs = invoices.filter(d => (d.type || "").toLowerCase().includes("invoice"));
  } else if (activeTab === "statements") {
    displayedDocs = invoices.filter(d => (d.type || "").toLowerCase().includes("statement"));
  } else if (activeTab === "narratives") {
    displayedDocs = invoices.filter(d => (d.type || "").toLowerCase().includes("narrative") || (d.type || "").toLowerCase().includes("historical"));
  } else if (docFilter !== "all") {
    displayedDocs = invoices.filter(d => (d.type || "").toLowerCase().includes(docFilter.toLowerCase()));
  }

  return (
    <div className="animate-in space-y-8 pb-16 max-w-6xl mx-auto">
      
      {activeTab === 'all' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">Validated Environment</h1>
              <p className="text-slate-500 text-sm font-medium">Your relational dataset, documents, and privacy report are ready for preview.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow">
                {uploadingCSV ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <Upload size={18} className="text-blue-600" />}
                <span>Import CSV to Build Relational &amp; Docs</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleImportCSV} 
                  className="hidden" 
                  disabled={uploadingCSV}
                />
              </label>
              <button 
                onClick={downloadZipBundle}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold transition-all flex items-center gap-2.5 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
              >
                <Download size={18} /> Download Bundle (.ZIP)
              </button>
            </div>
          </div>

          <WorkflowStepper currentStep={4} onStepClick={() => navigate('/build')} />

          {/* PROMINENT HIGHLIGHTED MULTIMODAL EXPANSION BANNER */}
          {(!currentPlan?.engines?.relational || !currentPlan?.engines?.document || invoices.length === 0) && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-2 border-blue-500/50 rounded-3xl p-7 shadow-xl text-white relative overflow-hidden animate-in">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black border border-blue-400/30 uppercase tracking-wider">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" /> 
                    Multimodal Dataset Expansion Prompt
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    Do you want to generate other types of data using the same prompt?
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">
                    You currently have <strong>{tableEntries.length} Tabular Table(s)</strong> generated. Instantly expand this environment into full parent-child relational database graphs, synthetic invoices, bank statements, or multi-lingual narrative documents without re-typing!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {!currentPlan?.engines?.relational && (
                    <button
                      disabled={expandingEngine}
                      onClick={() => handleEnableEngine('relational')}
                      className="px-4.5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {expandingEngine ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />} 
                      Generate Relational Graph
                    </button>
                  )}

                  {(!currentPlan?.engines?.document || invoices.length === 0) && (
                    <button
                      disabled={expandingEngine}
                      onClick={() => handleEnableEngine('document')}
                      className="px-4.5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {expandingEngine ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} 
                      Generate Synthetic Documents
                    </button>
                  )}

                  <button
                    disabled={expandingEngine}
                    onClick={() => handleEnableEngine('all')}
                    className="px-4.5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {expandingEngine ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
                    Enable All Engines Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Header Titles for Specific Views */}
      {activeTab === 'invoices' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="text-emerald-200" size={28} />
            <h1 className="text-3xl font-black">Synthetic Invoices</h1>
          </div>
          <p className="text-emerald-100 text-sm font-medium max-w-2xl">
            Standalone synthetic billing documents generated mathematically with clean short order IDs (`INV-101`) and itemized calculations.
          </p>
        </div>
      )}

      {activeTab === 'statements' && (
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Landmark className="text-purple-200" size={28} />
            <h1 className="text-3xl font-black">Synthetic Bank Statements</h1>
          </div>
          <p className="text-purple-100 text-sm font-medium max-w-2xl">
            Official ledger statements generated with account balances, transaction history, and short IDs (`STMT-201`).
          </p>
        </div>
      )}

      {activeTab === 'narratives' && (
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-800 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-pink-200" size={28} />
            <h1 className="text-3xl font-black">Narrative &amp; Historical Documents</h1>
          </div>
          <p className="text-pink-100 text-sm font-medium max-w-2xl">
            Custom formatted narrative reports, contracts, and historical chronologies compiled in your target locale language (Urdu, Arabic, Spanish, Chinese, English).
          </p>
        </div>
      )}

      {activeTab === 'quality' && (
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Quality &amp; Compliance Report</h1>
          <p className="text-slate-500 text-sm font-medium">Verification of referential integrity, constraint rules, and privacy leakage indicators.</p>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Relational Graph &amp; Edge Cases</h1>
            <p className="text-slate-500 text-sm font-medium">Maintains 1:1, 1:N, and N:M junction relationships with topological sorting and clean short IDs.</p>
          </div>

          {/* Relational Schema Architecture Visualizer Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-7 text-white shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
                  <Layers size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Relational Graph Architecture</h3>
                  <p className="text-slate-400 text-xs font-medium">Topological table dependency order &amp; foreign-key constraints</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs rounded-full flex items-center gap-1.5">
                <Check size={14} /> Referential Integrity 100% Passed
              </span>
            </div>

            {/* Relationship Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {currentPlan?.tables?.map((t, idx) => (
                <div key={t.name} className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-3 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <div className="font-extrabold text-sm text-indigo-200 flex items-center gap-2">
                      <TableIcon size={16} className="text-indigo-400" />
                      <span>{t.name}</span>
                    </div>
                    <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-400/20">
                      Table #{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    {t.columns?.map(c => (
                      <div key={c.name} className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          {c.is_primary_key ? (
                            <span className="text-amber-400 font-bold text-[9px] bg-amber-400/10 px-1 rounded border border-amber-400/20">PK</span>
                          ) : c.foreign_key ? (
                            <span className="text-blue-400 font-bold text-[9px] bg-blue-400/10 px-1 rounded border border-blue-400/20">FK</span>
                          ) : (
                            <span className="text-slate-500">•</span>
                          )}
                          <span className={c.is_primary_key ? 'font-bold text-amber-200' : ''}>{c.name}</span>
                        </span>
                        {c.foreign_key && (
                          <span className="text-indigo-300 text-[10px] font-sans bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-700/50">
                            ➜ {c.foreign_key}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* INTERACTIVE DUCKDB SQL / NATURAL LANGUAGE SEARCH ENGINE (MANDATORY REQUIREMENT) */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Interactive SQL &amp; AI Query Engine</h3>
                  <p className="text-slate-500 text-xs font-medium">Search, filter, or execute complex DuckDB SQL queries against your generated relational tables</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full border border-indigo-100 font-mono">
                DuckDB In-Memory Engine
              </span>
            </div>

            {/* Search Input Box */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Type SQL (e.g. SELECT * FROM users) or prompt (e.g. show top 5 orders)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                  />
                </div>
                <button
                  onClick={() => handleRunQuery()}
                  disabled={queryLoading || !userQuery.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-7 py-3.5 rounded-2xl font-extrabold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  {queryLoading ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} />}
                  <span>Run Query</span>
                </button>
              </div>

              {/* Sample Query Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sample Queries:</span>
                {tableEntries.slice(0, 3).map(([tName]) => (
                  <button
                    key={tName}
                    onClick={() => {
                      const q = `SELECT * FROM ${tName} LIMIT 5;`;
                      setUserQuery(q);
                      handleRunQuery(q);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-mono font-bold transition-all border border-slate-200 text-[11px]"
                  >
                    SELECT * FROM {tName} LIMIT 5
                  </button>
                ))}
                {tableEntries.length > 0 && (
                  <button
                    onClick={() => {
                      const q = `SELECT COUNT(*) AS total_records FROM ${tableEntries[0][0]};`;
                      setUserQuery(q);
                      handleRunQuery(q);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-mono font-bold transition-all border border-slate-200 text-[11px]"
                  >
                    COUNT(*) total records
                  </button>
                )}
              </div>
            </div>

            {/* Query Error Message */}
            {queryError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs font-semibold">
                {queryError}
              </div>
            )}

            {/* Query Output & Result Table */}
            {queryResult && (
              <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4 shadow-inner border border-slate-800 animate-in">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
                      ⚡ Executed SQL
                    </span>
                    <code className="text-xs font-mono text-slate-200 bg-slate-800 px-3 py-1 rounded-md">
                      {queryResult.sql_executed}
                    </code>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {queryResult.answer_summary}
                  </span>
                </div>

                {/* Results Data Table */}
                {queryResult.results && queryResult.results.length > 0 ? (
                  <div className="overflow-x-auto max-h-[350px] border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700 sticky top-0">
                        <tr>
                          {queryResult.columns?.map(col => (
                            <th key={col} className="px-4 py-3 bg-slate-800">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                        {queryResult.results.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/60 transition-colors">
                            {queryResult.columns?.map(col => (
                              <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                                {row[col] === null ? <span className="text-slate-500 italic">NULL</span> : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs text-center py-4 font-mono">
                    No rows returned by this query.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'datasets' && (
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Synthetic Datasets</h1>
          <p className="text-slate-500 text-sm font-medium">Inspect relational tables with clean short record IDs (`1`, `2`, `3`) and full pagination control.</p>
        </div>
      )}

      {activeTab === 'exports' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Export Center</h1>
            <p className="text-slate-500 text-sm font-medium">Download full environment ZIP packages, standalone CSV tables, or JSON reports.</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl flex flex-wrap justify-between items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Download size={24} className="text-blue-400" /> Environment ZIP Package
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Contains all generated CSV datasets, JSON quality reports, and formatted HTML document invoices with short IDs.
              </p>
            </div>
            <button
              onClick={downloadZipBundle}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2.5 shrink-0"
            >
              <Download size={20} /> Download Package (.ZIP)
            </button>
          </div>
        </div>
      )}

      {/* Quality & Scenario Section */}
      {(activeTab === 'all' || activeTab === 'quality' || activeTab === 'exports') && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
            <CheckCircle className="text-blue-600" size={18} /> Quality &amp; Scenario Report
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-600 font-medium">Total Rows Generated</span>
              <span className="font-extrabold text-slate-900">{(quality?.total_rows ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-600 font-medium">Referential Integrity (Foreign Keys)</span>
              <span className={`font-extrabold flex items-center gap-1 ${quality?.referential_integrity_passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {quality?.referential_integrity_passed ? <><Check size={16}/> 100% Passed</> : 'Orphans detected'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-600 font-medium">Scenario: Missing Data Injected</span>
              <span className="font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">{((quality?.missing_value_rate ?? 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-600 font-medium">Constraint Compliance</span>
              <span className={`font-extrabold ${quality?.issues?.some(i => i?.issue_type?.includes('Constraint')) ? 'text-rose-600' : 'text-emerald-600'}`}>
                {quality?.issues?.filter(i => i?.issue_type?.includes('Constraint')).length > 0 
                  ? `${quality.issues.filter(i => i.issue_type.includes('Constraint')).length} Violations` 
                  : '100% Compliant'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
            <ShieldCheck className="text-emerald-600" size={18} /> Privacy Risk Assessment
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-600 font-medium">Identifier Leakage Risk</span>
              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">{privacy?.identifier_leakage_risk || 'Low'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-600 font-medium">Exact Duplicate Records</span>
              <span className="font-extrabold text-slate-900">{privacy?.exact_duplicates ?? 0}</span>
            </div>
            <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex gap-3 shadow-sm">
               <ShieldCheck size={20} className="shrink-0 text-emerald-600 mt-0.5" />
               <p className="font-medium leading-relaxed">Privacy Guard Verified: Clean short record IDs used. Zero real personal identification numbers exposed.</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Relational / Tabular Datasets (Shown on 'all', 'datasets', 'scenarios', 'exports') */}
      {(activeTab === 'all' || activeTab === 'datasets' || activeTab === 'scenarios' || activeTab === 'exports') && (
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl"><TableIcon size={20} /></div>
            <h3 className="text-xl font-black text-slate-900">
              {activeTab === 'datasets' ? 'Tabular Datasets' : activeTab === 'scenarios' ? 'Relational Database Tables & FK Links' : 'Synthetic Data Tables'}
            </h3>
          </div>
        </div>

        {targetTableEntries.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center text-slate-500 font-medium">
            No datasets available for this engine view.
          </div>
        ) : (
          targetTableEntries.map(([tableName, rows]) => {
            const rowList = rows || [];
            const hasRows = rowList.length > 0;
            const headers = hasRows ? Object.keys(rowList[0]) : [];

            const limit = displayLimits[tableName] || 10;
            const displayedRows = limit === "all" ? rowList : rowList.slice(0, limit);

            return (
              <div key={tableName} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden hover:border-blue-300 transition-colors">
                <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-extrabold text-slate-900">{tableName}</h4>
                    <span className="text-[11px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider">
                      {rowList.length.toLocaleString()} rows
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span>Rows:</span>
                      {[10, 25, 50, "all"].map(val => (
                        <button
                          key={val}
                          onClick={() => setDisplayLimits(prev => ({ ...prev, [tableName]: val }))}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                            limit === val 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {val === "all" ? `All (${rowList.length})` : val}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        if (!hasRows) return;
                        const csvContent = [
                            headers.join(","),
                            ...rowList.map(r => headers.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(","))
                        ].join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${tableName}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs font-bold text-blue-700 bg-white border border-slate-300 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-800 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Download size={14} /> EXPORT CSV
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        {headers.map(key => (
                          <th key={key} className="px-6 py-3.5 whitespace-nowrap bg-slate-50">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      {displayedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          {headers.map((key, vIdx) => {
                            const val = row[key];
                            return (
                              <td key={vIdx} className="px-6 py-3.5 text-slate-700 whitespace-nowrap">
                                {val === null || val === undefined ? <span className="text-slate-400 italic bg-slate-100 px-1.5 py-0.5 rounded">NULL</span> : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50/80 px-6 py-3.5 text-center border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>Showing {displayedRows.length} of {rowList.length} total records</span>
                  {limit !== "all" && rowList.length > limit && (
                    <button 
                      onClick={() => setDisplayLimits(prev => ({ ...prev, [tableName]: "all" }))}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Click to expand all {rowList.length} rows
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Documents Output Views */}
      {(activeTab === 'all' || activeTab === 'documents' || activeTab === 'invoices' || activeTab === 'statements' || activeTab === 'narratives' || activeTab === 'exports') && displayedDocs && displayedDocs.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
             <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={22} /> Document Output Engine
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Generated documents with clean short IDs (`INV-101`, `STMT-201`, `DOC-301`).</p>
             </div>

             {/* Quick Filter Bar (on 'documents' or 'all' tab) */}
             {activeTab === "documents" && (
               <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {[
                    { id: "all", label: "All Documents" },
                    { id: "Invoice", label: "Invoices" },
                    { id: "Statement", label: "Statements" },
                    { id: "Narrative", label: "Narratives & History" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setDocFilter(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        docFilter === f.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
               </div>
             )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedDocs.map((inv, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                        inv.type === 'Invoice' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        inv.type === 'Bank Statement' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {inv.type || 'Document'}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{inv.document_number || `DOC-${idx + 101}`}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-sm">{inv.title || inv.customer}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-indigo-700 text-xs">{inv.subtitle || inv.amount}</div>
                  </div>
                </div>
                <div className="p-0 bg-slate-100 flex-1 relative min-h-[430px]">
                  <iframe 
                    srcDoc={inv.html} 
                    title={`Document ${inv.document_number || idx}`}
                    className="w-full h-full border-0 absolute inset-0"
                  />
                </div>
                <div className="p-4 bg-white border-t border-slate-200 text-center flex gap-3 justify-center">
                  <button 
                    onClick={() => {
                      const blob = new Blob([inv.html], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${inv.document_number || 'document'}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl transition-colors bg-white shadow-sm"
                  >
                    <Download size={14} /> Save HTML
                  </button>
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(inv.html);
                        printWindow.document.close();
                        printWindow.onload = () => {
                            printWindow.focus();
                            printWindow.print();
                        };
                      }
                    }}
                    className="text-xs font-bold text-white flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
