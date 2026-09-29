import { useEffect, useState } from 'react';
import { Download, Loader2, ArrowLeft, Table as TableIcon, CheckCircle, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';

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
              isActive ? 'border-emerald-600 bg-emerald-50 text-emerald-700' :
              isPast ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
              'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              {isPast || isActive ? <CheckCircle2 size={16} /> : (idx + 1)}
            </div>
            <span className={`ml-3 text-sm font-medium ${isActive || isPast ? 'text-slate-900' : 'text-slate-400'}`}>
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

export default function DataPreview() {
  const [data, setData] = useState(null);
  const [quality, setQuality] = useState(null);
  const [privacy, setPrivacy] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedSchema = localStorage.getItem("synthdata_schema");
    if (!savedSchema) {
      setError("No generation plan found. Please go back and generate one first.");
      setLoading(false);
      return;
    }
    generateData(JSON.parse(savedSchema));
  }, []);

  const generateData = async (plan) => {
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
      setData(result.data);
      setQuality(result.quality_report);
      setPrivacy(result.privacy_report);

      // Also generate documents if engine is enabled
      if (plan.engines && plan.engines.document) {
          const invResponse = await fetch("http://127.0.0.1:8000/api/documents/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
          });
          if (invResponse.ok) {
            const invResult = await invResponse.json();
            setInvoices(invResult.invoices);
          }
      } else {
          setInvoices([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadZipBundle = async () => {
    if (!data) return;
    const zip = new JSZip();
    
    // Add CSV data
    const dataFolder = zip.folder("data");
    for (const [tableName, rows] of Object.entries(data)) {
        if (rows.length === 0) continue;
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
    
    // Add JSON reports
    const reportsFolder = zip.folder("reports");
    reportsFolder.file("quality_report.json", JSON.stringify(quality, null, 2));
    reportsFolder.file("privacy_report.json", JSON.stringify(privacy, null, 2));
    
    // Add Documents
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
          <h2 className="text-2xl font-bold text-slate-900">Validating & Generating Synthetic World...</h2>
          <p className="text-slate-500">Injecting scenarios and resolving referential integrity.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl max-w-xl text-center shadow-sm">
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <Link to="/build" className="inline-flex px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors items-center gap-2 font-semibold">
            <ArrowLeft size={16} /> Edit Generation Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-8 pb-12 max-w-6xl mx-auto">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Validated Environment</h1>
        <p className="text-slate-500 text-sm">Your robust, relational dataset and quality reports are ready for export.</p>
      </div>

      <WorkflowStepper currentStep={4} />

      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
           <h2 className="text-xl font-bold text-slate-900">5. Validate &amp; Export</h2>
        </div>
        <button 
          onClick={downloadZipBundle}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all flex items-center gap-2 shadow-md"
        >
          <Download size={18} /> Download ZIP Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
            <CheckCircle className="text-blue-500" /> Quality &amp; Scenario Report
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-600 text-sm font-medium">Total Rows Generated</span>
              <span className="font-bold text-slate-900">{quality?.total_rows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-600 text-sm font-medium">Referential Integrity (Foreign Keys)</span>
              <span className={`font-bold flex items-center gap-1 ${quality?.referential_integrity_passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {quality?.referential_integrity_passed ? <><Check size={16}/> 100% Passed</> : 'Failed / Orphans detected'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-600 text-sm font-medium">Scenario: Missing Data Injected</span>
              <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{(quality?.missing_value_rate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-600 text-sm font-medium">Constraint Compliance</span>
              <span className={`font-bold ${quality?.issues?.some(i => i.issue_type.includes('Constraint')) ? 'text-red-600' : 'text-emerald-600'}`}>
                {quality?.issues?.filter(i => i.issue_type.includes('Constraint')).length > 0 
                  ? `${quality.issues.filter(i => i.issue_type.includes('Constraint')).length} Violations` 
                  : 'Verified'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
            <ShieldCheck className="text-emerald-500" /> Privacy Risk Assessment
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-600 text-sm font-medium">Direct Identifier Leakage Risk</span>
              <span className="font-bold text-emerald-600">{privacy?.identifier_leakage_risk}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-600 text-sm font-medium">Exact Duplicate Records</span>
              <span className="font-bold text-slate-900">{privacy?.exact_duplicates}</span>
            </div>
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 flex gap-3 shadow-sm">
               <ShieldCheck size={20} className="shrink-0 text-emerald-600 mt-0.5" />
               <p className="font-medium leading-relaxed">Privacy Guaranteed: Safe for testing. No real production PII was used during generation.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-2 mb-2">
          <TableIcon size={20} className="text-slate-700" />
          <h3 className="text-xl font-bold text-slate-900">Relational Datasets</h3>
        </div>
        {Object.entries(data).map(([tableName, rows]) => (
          <div key={tableName} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:border-blue-300 transition-colors">
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-slate-900">
                  {tableName} 
                </h4>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {rows.length.toLocaleString()} rows
                </span>
              </div>
              <button 
                onClick={() => {
                  if (rows.length === 0) return;
                  const keys = Object.keys(rows[0]);
                  const csvContent = [
                      keys.join(","),
                      ...rows.map(r => keys.map(k => `"${String(r[k]).replace(/"/g, '""')}"`).join(","))
                  ].join("\n");
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${tableName}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs font-bold text-blue-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download size={14} /> EXPORT CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    {rows.length > 0 && Object.keys(rows[0]).map(key => (
                      <th key={key} className="px-6 py-3 whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                      {Object.values(row).map((val, vIdx) => (
                        <td key={vIdx} className="px-6 py-3.5 text-slate-700 whitespace-nowrap font-mono text-xs">
                          {val === null ? <span className="text-slate-400 italic bg-slate-100 px-1 rounded">NULL</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && (
              <div className="bg-slate-50 py-3 text-center border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Showing top 5 rows. Download bundle to view all {rows.length.toLocaleString()} records.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {invoices && invoices.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-xl font-bold text-slate-900">Documents Output</h3>
                <p className="text-slate-500 text-sm mt-1">Generated mathematically from synthetic orders and customers.</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {invoices.map((inv, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{inv.type || 'Invoice'}</span>
                      <h4 className="font-bold text-slate-900">{inv.document_number || inv.invoice_number}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">{inv.title || inv.customer}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-700">{inv.subtitle || inv.amount}</div>
                  </div>
                </div>
                <div className="p-0 bg-slate-100 flex-1 relative min-h-[400px]">
                  <iframe 
                    srcDoc={inv.html} 
                    title={`Document ${inv.document_number || inv.invoice_number}`}
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
                      a.download = `${inv.document_number || inv.invoice_number}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Download size={16} /> Save HTML
                  </button>
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(inv.html);
                      printWindow.document.close();
                      // Wait for images/styles to load then print
                      printWindow.onload = () => {
                          printWindow.focus();
                          printWindow.print();
                      };
                    }}
                    className="text-sm font-bold text-white flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Export to PDF
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
