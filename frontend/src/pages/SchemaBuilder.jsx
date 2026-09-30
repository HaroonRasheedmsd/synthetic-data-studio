import { useState, useEffect } from 'react';
import { Bot, Loader2, ArrowRight, Upload, Globe, Sliders, X, CheckCircle2, ChevronRight, Settings, AlertTriangle, Database, Table as TableIcon, FileText, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PRESETS } from '../utils/presets';
import { API_BASE_URL } from '../utils/api';

const LOCALES = [
  { code: 'en_US', label: '🇺🇸 English (US)', currency: 'USD' },
  { code: 'en_GB', label: '🇬🇧 English (UK)', currency: 'GBP' },
  { code: 'ur_PK', label: '🇵🇰 Urdu (Pakistan)', currency: 'PKR' },
  { code: 'ar_SA', label: '🇸🇦 Arabic (Saudi Arabia)', currency: 'SAR' },
  { code: 'es_ES', label: '🇪🇸 Spanish (Spain)', currency: 'EUR' },
  { code: 'zh_CN', label: '🇨🇳 Chinese (China)', currency: 'CNY' },
];

function WorkflowStepper({ currentStep, onStepClick }) {
  const steps = ['Describe', 'Plan', 'Configure', 'Generate', 'Validate'];
  
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-8 overflow-x-auto">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isPast = idx < currentStep;
        const clickable = onStepClick && idx <= currentStep;

        return (
          <div 
            key={step} 
            onClick={() => {
                if (onStepClick && clickable) onStepClick(idx);
            }}
            className={`flex items-center shrink-0 mr-4 last:mr-0 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black border-2 transition-all ${
              isActive ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-200' :
              isPast ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
              'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              {isPast ? <CheckCircle2 size={16} /> : (idx + 1)}
            </div>
            <span className={`ml-2.5 text-xs font-bold ${isActive ? 'text-slate-900' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
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
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const selectedLocale = LOCALES.find(l => l.code === locale) || LOCALES[0];

  const handleInfer = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setSchema(null);
    setCurrentStep(0);
    try {
      const response = await fetch(`${API_BASE_URL}/api/schema/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: prompt }),
      });
      if (!response.ok) throw new Error(await response.text());
      const plan = await response.json();
      plan.locale = locale;
      plan.currency = selectedLocale.currency;
      setSchema(plan);
      setCurrentStep(1);
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
      const response = await fetch(`${API_BASE_URL}/api/schema/infer-csv`, {
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
    setCurrentStep(2);
    setSchema(prev => {
      const updated = { ...prev, tables: [...prev.tables] };
      updated.tables[tableIdx] = { ...prev.tables[tableIdx], row_count: parseInt(value) || 10 };
      return updated;
    });
  };

  const [validationError, setValidationError] = useState("");

  const handleGenerate = () => {
    if (!schema) return;
    
    if (!engineTabular && !engineRelational && !engineDocument) {
        setValidationError("You must enable at least one Generation Engine.");
        document.getElementById("engine-config-panel")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    if (nullRate < 0 || nullRate > 100 || outlierRate < 0 || outlierRate > 100 || duplicateRate < 0 || duplicateRate > 100) {
        setValidationError("Scenario rates must be strictly between 0% and 100%.");
        return;
    }
    
    setValidationError("");
    setCurrentStep(3);
    
    let finalPlan = JSON.parse(JSON.stringify(schema));
    
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-500/20 rounded-2xl border border-blue-400/30">
            <Sparkles className="text-blue-400" size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">AI Generator Studio</h1>
        </div>
        <p className="text-slate-300 text-sm font-medium max-w-2xl leading-relaxed">
          Describe your target domain or upload CSV schema. AI infer tables, foreign-key graphs (1:1, 1:N, N:M), and locale-aware documents.
        </p>
      </div>

      <WorkflowStepper currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* AI Intent Box */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm space-y-5 hover:shadow-md transition-all">
        <div className="flex items-center gap-2.5 mb-1">
          <Bot size={20} className="text-blue-600" />
          <h2 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">1. Describe Intent</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A Pakistani e-commerce with customers, orders, products and invoices..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
            onKeyDown={(e) => e.key === 'Enter' && handleInfer()}
          />
          <button
            onClick={handleInfer}
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-7 py-3.5 rounded-2xl font-extrabold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 whitespace-nowrap text-sm hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
            <span>Understand &amp; Plan</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">— OR —</span>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-bold">
            {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>Upload CSV to infer schema</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
        </div>
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-3.5 text-sm flex items-start gap-2.5 mt-4 font-semibold">
            <X size={18} className="shrink-0 mt-0.5" />
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
                className={`bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full ${
                    validationError ? 'border-rose-500 ring-2 ring-rose-200' : ''
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Settings size={18} className={validationError ? "text-rose-500" : "text-slate-800"} />
                <h2 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">Modular Architecture</h2>
              </div>
              <p className="text-xs text-slate-500 pb-3 border-b border-slate-100 mb-3 font-medium">Engage target generation engines.</p>
              
              <div className="space-y-2 flex-1">
                {[
                  {
                    id: 'tabular',
                    title: 'Tabular Engine',
                    desc: 'Generates localized rows & clean short IDs.',
                    active: engineTabular,
                    setter: setEngineTabular,
                    icon: Database
                  },
                  {
                    id: 'relational',
                    title: 'Relational Engine',
                    desc: 'Maintains 1:1, 1:N, N:M parent PKs.',
                    active: engineRelational,
                    setter: setEngineRelational,
                    icon: TableIcon
                  },
                  {
                    id: 'document',
                    title: 'Document Engine',
                    desc: 'Compiles Invoices, Statements & History docs.',
                    active: engineDocument,
                    setter: setEngineDocument,
                    icon: FileText
                  }
                ].map((mod) => (
                  <div 
                    key={mod.id}
                    onClick={() => { mod.setter(!mod.active); setCurrentStep(2); }}
                    className={`relative flex items-center gap-3 p-3 cursor-pointer transition-all rounded-2xl border ${
                      mod.active 
                        ? 'bg-blue-50/60 border-blue-200 shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-slate-50'
                    }`}
                  >
                    {mod.active && (
                      <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full shadow-sm" />
                    )}
                    <div className={`p-2 rounded-xl transition-colors ${mod.active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                       <mod.icon size={16} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold transition-colors ${mod.active ? 'text-blue-950' : 'text-slate-700'}`}>{mod.title}</div>
                      <div className={`text-[10px] transition-colors ${mod.active ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>{mod.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {validationError && (
                  <div className="mt-4 text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" /> {validationError}
                  </div>
              )}
            </div>

            {/* Locale Picker */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={18} className="text-indigo-600" />
                <h2 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">2. Locale Configuration</h2>
              </div>
              <p className="text-xs text-slate-500 pb-2 border-b border-slate-100 font-medium">Influences names, addresses, currency &amp; narrative languages.</p>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {LOCALES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLocale(l.code); setCurrentStep(2); }}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex justify-between items-center ${
                      locale === l.code
                        ? 'border-indigo-500 bg-indigo-50/80 text-indigo-900 shadow-sm ring-1 ring-indigo-200'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">{l.label}</div>
                    <div className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded">{l.currency}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Config */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Sliders size={18} className="text-purple-600" />
                <h2 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">3. Edge Case Lab</h2>
              </div>
              <p className="text-xs text-slate-500 pb-2 border-b border-slate-100 font-medium">Inject realistic data imperfections for stress-testing.</p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <label className="text-slate-700">Missing Value (Null) Rate</label>
                    <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{nullRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={30} step={1} value={nullRate}
                    onChange={(e) => { setNullRate(Number(e.target.value)); setCurrentStep(2); }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <label className="text-slate-700">Anomaly / Outlier Rate</label>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{outlierRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={0.5} value={outlierRate}
                    onChange={(e) => { setOutlierRate(Number(e.target.value)); setCurrentStep(2); }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <label className="text-slate-700">Exact Duplicate Injection</label>
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">{duplicateRate}%</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={0.5} value={duplicateRate}
                    onChange={(e) => { setDuplicateRate(Number(e.target.value)); setCurrentStep(2); }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schema Preview with editable row counts */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={20} className="text-blue-600" />
                  <h2 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">4. Data Architecture &amp; ER Diagram</h2>
                </div>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  {schema.tables.length} tables · {schema.tables.reduce((s, t) => s + t.row_count, 0).toLocaleString()} records planned
                </p>
              </div>
              <div className="flex items-center gap-4">
                {validationError && (
                    <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertTriangle size={16} /> {validationError}
                    </div>
                )}
                <button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-2xl font-extrabold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Generate &amp; Validate</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* ER Visualization for 1:1, 1:N, N:M Junction Tables */}
            <div className="mb-8 p-5 bg-slate-50/80 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">Multi-Relational Graph (1:1, 1:N, N:M Junctions)</h3>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">100% Integrity Engine Active</span>
              </div>
              <div className="flex flex-col gap-3">
                {schema.tables.map(table => {
                  const fkCols = table.columns.filter(c => c.is_foreign_key);
                  const isJunctionTable = fkCols.length >= 2;

                  if (isJunctionTable) {
                    return (
                      <div key={`nm-${table.name}`} className="flex flex-wrap items-center gap-2 text-xs font-bold p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl shadow-xs">
                        <span className="px-3 py-1 bg-white text-slate-800 rounded-lg border border-slate-200 shadow-sm">{fkCols[0].references_table}</span>
                        <span className="text-indigo-600 font-mono text-[11px]">◀━━(N:M via {table.name})━━▶</span>
                        <span className="px-3 py-1 bg-white text-slate-800 rounded-lg border border-slate-200 shadow-sm">{fkCols[1].references_table}</span>
                        <span className="text-[10px] font-black text-indigo-700 uppercase bg-indigo-100 px-2 py-0.5 rounded-md ml-auto">N:M Junction</span>
                      </div>
                    );
                  }

                  return fkCols.map((fk, idx) => {
                    const isOneToOne = fk.is_unique || fk.is_primary_key;
                    const relType = isOneToOne ? "1:1" : "1:N";
                    return (
                      <div key={`${table.name}-${idx}`} className="flex items-center gap-3 text-xs font-semibold">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg border border-blue-200 shadow-sm">{fk.references_table}</span>
                        <span className="text-slate-400 font-mono text-[11px]">━━({relType})━━▶</span>
                        <span className="px-3 py-1 bg-white text-slate-800 rounded-lg border border-slate-200 shadow-sm">{table.name} <span className="text-slate-400 font-normal">({fk.name})</span></span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ml-auto uppercase ${isOneToOne ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{relType} Rel</span>
                      </div>
                    );
                  });
                })}
                {schema.tables.every(t => !t.columns.some(c => c.is_foreign_key)) && (
                   <span className="text-xs text-slate-500 font-medium italic">No relational foreign keys detected in schema.</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {schema.tables.map((table, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors">
                  <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-900 text-xs">{table.name}</h3>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Rows</label>
                      <input
                        type="number" min={1} max={10000} value={table.row_count}
                        onChange={(e) => updateRowCount(idx, e.target.value)}
                        className="w-20 text-xs font-extrabold text-blue-700 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="p-3.5 space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
                    {table.columns.map((col, cIdx) => (
                      <div key={cIdx} className="flex justify-between items-center border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate max-w-[150px]">
                          {col.name}
                          {col.is_primary_key && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">PK</span>}
                          {col.is_foreign_key && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">FK</span>}
                        </span>
                        <span className="text-slate-400 text-[10px] truncate max-w-[80px] text-right" title={col.data_type}>{col.data_type}</span>
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
