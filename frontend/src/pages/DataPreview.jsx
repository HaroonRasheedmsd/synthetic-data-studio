import { useEffect, useState } from 'react';
import { Download, Loader2, ArrowLeft, Table as TableIcon, CheckCircle, ShieldCheck, CheckCircle2, ChevronRight, Check, FileText, Sliders, Eye, FileCheck, Landmark, Receipt, Sparkles, BookOpen, Layers, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';

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

  useEffect(() => {
    const savedSchema = localStorage.getItem("synthdata_schema");
    if (!savedSchema) {
      setError("No generation plan found. Please go back and generate one first.");
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(savedSchema);
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

  const generateData = async (plan, cacheKey) => {
    try {
      if (plan.engines && plan.engines.tabular === false) {
         setData({});
         setQuality({ total_rows: 0, referential_integrity_passed: true, missing_value_rate: 0, issues: [] });
         setPrivacy({ exact_duplicates: 0, identifier_leakage_risk: "None" });
         setInvoices([]);
         return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/generate", {
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
          const invResponse = await fetch("http://127.0.0.1:8000/api/documents/invoices", {
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
          
          await fetch('http://127.0.0.1:8000/api/projects/', {
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
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl max-w-xl text-center shadow-sm">
          <p className="text-rose-700 text-base font-bold mb-4">{error}</p>
          <Link to="/build" className="inline-flex px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors items-center gap-2 font-bold shadow-md">
            <ArrowLeft size={16} /> Edit Generation Plan
          </Link>
        </div>
      </div>
    );
  }

  const tableEntries = Object.entries(data || {});

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
            <button 
              onClick={downloadZipBundle}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold transition-all flex items-center gap-2.5 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
            >
              <Download size={18} /> Download Bundle (.ZIP)
            </button>
          </div>

          <WorkflowStepper currentStep={4} onStepClick={() => navigate('/build')} />
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
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Relational Graph &amp; Edge Cases</h1>
          <p className="text-slate-500 text-sm font-medium">Maintains 1:1, 1:N, and N:M junction relationships with topological sorting and clean short IDs.</p>
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
      {(activeTab === 'all' || activeTab === 'quality' || activeTab === 'scenarios' || activeTab === 'exports') && (
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

      {/* Relational Datasets (Shown on 'all', 'datasets', 'exports') */}
      {(activeTab === 'all' || activeTab === 'datasets' || activeTab === 'exports') && (
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl"><TableIcon size={20} /></div>
            <h3 className="text-xl font-black text-slate-900">Relational Datasets</h3>
          </div>
        </div>

        {tableEntries.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center text-slate-500 font-medium">
            No tabular datasets available. Enable Tabular Engine in generation plan.
          </div>
        ) : (
          tableEntries.map(([tableName, rows]) => {
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
