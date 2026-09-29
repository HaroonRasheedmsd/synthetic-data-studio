import { useState, useEffect } from 'react';
import { Bot, Loader2, ArrowRight, Upload, Globe, Sliders, X, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PRESETS } from '../utils/presets';

const LOCALES = [
  { code: 'en_US', label: '🇺🇸 English (US)', currency: 'USD' },
  { code: 'en_GB', label: '🇬🇧 English (UK)', currency: 'GBP' },
  { code: 'ur_PK', label: '🇵🇰 Urdu (Pakistan)', currency: 'PKR' },
  { code: 'ar_SA', label: '🇸🇦 Arabic (Saudi Arabia)', currency: 'SAR' },
  { code: 'es_ES', label: '🇪🇸 Spanish (Spain)', currency: 'EUR' },
  { code: 'zh_CN', label: '🇨🇳 Chinese (China)', currency: 'CNY' },
];

function WorkflowStepper({ currentStep }) {
  const steps = ['Describe', 'Plan', 'Configure', 'Generate', 'Validate'];
  
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-8 overflow-x-auto">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isPast = idx < currentStep;
        return (
          <div key={step} className="flex items-center shrink-0 mr-4 last:mr-0">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-colors ${
              isActive ? 'border-blue-600 bg-blue-50 text-blue-700' :
              isPast ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
              'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              {isPast ? <CheckCircle2 size={16} /> : (idx + 1)}
            </div>
            <span className={`ml-3 text-sm font-medium ${isActive ? 'text-slate-900' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
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

export default function SchemaBuilder() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState('');
  const [locale, setLocale] = useState('en_US');
  const [nullRate, setNullRate] = useState(0);
  const [outlierRate, setOutlierRate] = useState(0);
  const [duplicateRate, setDuplicateRate] = useState(0);
  
  // Modular Engine Toggles
  const [engineTabular, setEngineTabular] = useState(true);
  const [engineRelational, setEngineRelational] = useState(true);
  const [engineDocument, setEngineDocument] = useState(true);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.preset && PRESETS[location.state.preset]) {
      setSchema(PRESETS[location.state.preset]);
      setPrompt(`Quick Start Template: ${location.state.preset}`);
      setCurrentStep(1);
      // Clear state so it doesn't reload on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const selectedLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

  const handleInfer = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setSchema(null);
    setCurrentStep(0);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/schema/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      });
      if (!response.ok) throw new Error(await response.text());
      const plan = await response.json();
      plan.locale = locale;
      plan.currency = selectedLocale.currency;
      setSchema(plan);
      setCurrentStep(1); // Moving to Plan step
    } catch (err) {
      setError(`Backend Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true); setError(''); setSchema(null);
    setCurrentStep(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://127.0.0.1:8000/api/schema/infer-csv', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const plan = await response.json();
      plan.locale = locale;
      plan.currency = selectedLocale.currency;
      setSchema(plan);
      setPrompt(`Inferred from: ${file.name}`);
      setCurrentStep(1);
    } catch (err) {
      setError(`CSV Error: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const updateRowCount = (tableIdx, value) => {
    setCurrentStep(2); // If they start editing, they are in Configure
    setSchema(prev => {
      const updated = { ...prev, tables: [...prev.tables] };
      updated.tables[tableIdx] = { ...prev.tables[tableIdx], row_count: parseInt(value) || 10 };
      return updated;
    });
  };

  const [validationError, setValidationError] = useState("");

  const handleGenerate = () => {
    if (!schema) return;
    
    // Boundary & Engine Checks
    if (!engineTabular && !engineRelational && !engineDocument) {
        setValidationError("You must enable at least one Generation Engine.");
        document.getElementById("engine-config-panel")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // Low/High Boundary Checks
    if (nullRate < 0 || nullRate > 100 || outlierRate < 0 || outlierRate > 100 || duplicateRate < 0 || duplicateRate > 100) {
        setValidationError("Scenario rates must be strictly between 0% and 100%.");
        return;
    }
    
    setValidationError("");
    
    setCurrentStep(3); // Generate phase
    
    // Deep clone the schema so we can mutate it if Relational Engine is disabled
    let finalPlan = JSON.parse(JSON.stringify(schema));
    
    // If Relational Engine is off, strip all foreign keys
    if (!engineRelational) {
        finalPlan.tables.forEach(table => {
            table.columns.forEach(col => {
                delete col.foreign_key;
            });
        });
    }

    finalPlan = {
      ...finalPlan,
      locale,
      currency: selectedLocale.currency,
      scenarios: { 
        missing_value_rate: nullRate / 100, 
        outlier_rate: outlierRate / 100,
        duplicate_rate: duplicateRate / 100
      },
      engines: {
          tabular: engineTabular,
          relational: engineRelational,
          document: engineDocument
      }
    };
    localStorage.setItem('synthdata_schema', JSON.stringify(finalPlan));
    navigate('/preview');
  };

  return (
    <div className="animate-in space-y-6 max-w-5xl pb-16 mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Generation Workflow</h1>
        <p className="text-slate-500 text-sm">Design your SyntheticWorld architecture before executing generation.</p>
      </div>

      <WorkflowStepper currentStep={currentStep} />

      {/* AI Intent Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-1">
          <Bot size={18} className="text-blue-500" />
          <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">1. Describe Intent</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A Pakistani e-commerce with customers, orders, products and invoices..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm font-medium"
            onKeyDown={(e) => e.key === 'Enter' && handleInfer()}
          />
          <button
            onClick={handleInfer}
            disabled={loading || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 whitespace-nowrap text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
            <span>Understand &amp; Plan</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm text-slate-400">— or —</span>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium">
            {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>Upload CSV to infer schema</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2 mt-4">
            <X size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {schema && (
        <div className="animate-in space-y-6">
          {/* Settings / Config Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 3-Engine Architecture Config */}
            <div 
                id="engine-config-panel" 
                className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${
                    validationError ? 'border-red-500 ring-2 ring-red-200' : ''
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Settings size={18} className={validationError ? "text-red-500" : "text-slate-800"} />
                <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Modular Architecture</h2>
              </div>
              <p className="text-xs text-slate-500 pb-4 border-b border-slate-100 mb-4">Select which generation engines to engage.</p>
              
              <div className="space-y-2 flex-1">
                {[
                  {
                    id: 'tabular',
                    title: 'Tabular Engine',
                    desc: 'Generates localized rows via Faker algorithms.',
                    active: engineTabular,
                    setter: setEngineTabular,
                    icon: Database
                  },
                  {
                    id: 'relational',
                    title: 'Relational Engine',
                    desc: 'Maintains rigid 1:N Primary/Foreign Key integrity.',
                    active: engineRelational,
                    setter: setEngineRelational,
                    icon: TableIcon
                  },
                  {
                    id: 'document',
                    title: 'Document Engine',
                    desc: 'Compiles mathematical PDFs/HTMLs from relations.',
                    active: engineDocument,
                    setter: setEngineDocument,
                    icon: FileText
                  }
                ].map((mod) => (
                  <div 
                    key={mod.id}
                    onClick={() => { mod.setter(!mod.active); setCurrentStep(2); }}
                    className={`relative flex items-center gap-4 p-3 cursor-pointer transition-all rounded-xl border ${
                      mod.active 
                        ? 'bg-blue-50/50 border-blue-100' 
                        : 'bg-transparent border-transparent hover:bg-slate-50'
                    }`}
                  >
                    {mod.active && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                    )}
                    <div className={`p-2 rounded-lg transition-colors ${mod.active ? 'bg-blue-100/50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                       <mod.icon size={18} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold transition-colors ${mod.active ? 'text-blue-900' : 'text-slate-600'}`}>{mod.title}</div>
                      <div className={`text-[11px] transition-colors ${mod.active ? 'text-blue-600/80' : 'text-slate-400'}`}>{mod.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {validationError && (
                  <div className="mt-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" /> {validationError}
                  </div>
              )}
            </div>

            {/* Locale Picker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={18} className="text-indigo-500" />
                <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">2. Locale Configuration</h2>
              </div>
              <p className="text-xs text-slate-500 pb-2 border-b border-slate-100">Influences generated names, addresses, and currency.</p>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                {LOCALES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLocale(l.code); setCurrentStep(2); }}
                    className={`text-left px-3 py-2 rounded-xl border text-sm font-medium transition-all flex justify-between items-center ${
                      locale === l.code
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">{l.label}</div>
                    <div className="text-xs font-mono">{l.currency}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Config */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Sliders size={18} className="text-purple-500" />
                <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">3. Edge Case Lab</h2>
              </div>
              <p className="text-xs text-slate-500 pb-2 border-b border-slate-100">Inject realistic data imperfections for stress-testing.</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="text-slate-700 font-medium">Missing Value (Null) Rate</label>
                    <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{nullRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={30} step={1} value={nullRate}
                    onChange={(e) => { setNullRate(Number(e.target.value)); setCurrentStep(2); }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="text-slate-700 font-medium">Anomaly / Outlier Rate</label>
                    <span className="font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{outlierRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={0.5} value={outlierRate}
                    onChange={(e) => { setOutlierRate(Number(e.target.value)); setCurrentStep(2); }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="text-slate-700 font-medium">Exact Duplicate Injection</label>
                    <span className="font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">{duplicateRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={0.5} value={duplicateRate}
                    onChange={(e) => { setDuplicateRate(Number(e.target.value)); setCurrentStep(2); }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schema Preview with editable row counts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Settings size={18} className="text-blue-600" />
                  <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">4. Data Architecture &amp; ER Diagram</h2>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {schema.tables.length} tables · {schema.tables.reduce((s, t) => s + t.row_count, 0).toLocaleString()} records planned
                </p>
              </div>
              <div className="flex items-center gap-4">
                {validationError && (
                    <div className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                        <AlertTriangle size={16} /> {validationError}
                    </div>
                )}
                <button
                  onClick={handleGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <span>Generate &amp; Validate</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* ER Visualization */}
            <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detected Relationships (1:N)</h3>
              <div className="flex flex-col gap-3">
                {schema.tables.map(table => 
                  table.columns.filter(c => c.is_foreign_key).map((fk, idx) => (
                    <div key={`${table.name}-${idx}`} className="flex items-center gap-3 text-sm font-medium">
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg border border-blue-200 shadow-sm">{fk.references_table}</span>
                      <span className="text-slate-400 font-mono text-xs">━━(1:N)━━▶</span>
                      <span className="px-3 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200 shadow-sm">{table.name} <span className="text-slate-400 font-normal">({fk.name})</span></span>
                    </div>
                  ))
                )}
                {schema.tables.every(t => !t.columns.some(c => c.is_foreign_key)) && (
                   <span className="text-sm text-slate-500 italic">No relational foreign keys detected.</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {schema.tables.map((table, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors">
                  <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-sm">{table.name}</h3>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rows</label>
                      <input
                        type="number" min={1} max={10000} value={table.row_count}
                        onChange={(e) => updateRowCount(idx, e.target.value)}
                        className="w-20 text-xs font-bold text-blue-700 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                    {table.columns.map((col, cIdx) => (
                      <div key={cIdx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-medium text-slate-700 flex items-center gap-1.5">
                          {col.name}
                          {col.is_primary_key && <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider">PK</span>}
                          {col.is_foreign_key && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider">FK</span>}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px] truncate max-w-[80px] text-right" title={col.data_type}>{col.data_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
