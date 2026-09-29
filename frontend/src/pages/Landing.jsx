import { Link } from 'react-router-dom';
import { Database, ShieldCheck, FileText, Table, Sliders, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Database size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">Synthetic Data Studio</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 font-bold text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
          <Link to="/signup" className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 py-20 text-center animate-in">
        <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          From intent to validated <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">synthetic environment.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Realistic, privacy-aware tabular, relational, and document data generated on demand.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/signup" className="px-8 py-4 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-200">
            Create Free Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Table size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Relational Engine</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Maps multi-table graphs in memory to ensure rigid 1:N Primary Key / Foreign Key integrity without orphans.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Privacy Guard</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Zero real records stored. mathematically assess generated datasets for direct identifier leakage.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Document Studio</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Dynamically compile synthetic data into perfectly calculated HTML and PDF invoices and bank statements.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
