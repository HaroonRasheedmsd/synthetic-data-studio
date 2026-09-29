import { Link } from 'react-router-dom';
import { Sparkles, Database, FileText, ArrowRight, ShieldCheck, Activity, Code, LayoutTemplate } from 'lucide-react';

export default function Home() {
  return (
    <div className="animate-in pb-16 space-y-12">
      {/* Hero Section */}
      <div className="relative bg-white border border-slate-200 text-slate-900 rounded-[2rem] p-10 md:p-16 overflow-hidden shadow-xl shadow-blue-900/5 mb-12">
        {/* Subtle gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-0 right-40 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-2 shadow-sm">
            <Sparkles size={14} className="text-blue-500" /> HackDataV2 Official Submission
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            Generate realistic synthetic environments from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">plain language.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
            Create privacy-aware tabular, relational, and document data without exposing real records. Describe the data you need, and our AI builds a deterministic generation plan.
          </p>
          
          {/* Main Input Simulation */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col space-y-3 mt-8">
            <label className="text-sm font-semibold text-slate-700 px-1">What do you want to generate?</label>
            <div className="relative">
              <textarea 
                readOnly
                value="Create a Pakistani e-commerce environment with 5,000 customers, 20,000 orders, realistic products and invoices. Use PKR, Pakistani names and addresses."
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl p-4 text-sm font-medium resize-none outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-4 pt-2">
              <Link 
                to="/build" 
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20"
              >
                <Sparkles size={18} />
                <span>Generate with AI</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Start Templates</h3>
            <div className="flex flex-wrap gap-3">
              {['E-Commerce', 'Banking', 'Healthcare', 'Education'].map(template => (
                <Link key={template} to="/build" state={{ preset: template }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm font-semibold shadow-sm">
                  <LayoutTemplate size={14} /> {template}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={Database} 
          title="Relational Integrity" 
          desc="Smart mapping of parent-child foreign keys. Tables connect perfectly without orphans." 
          color="blue"
        />
        <FeatureCard 
          icon={Activity} 
          title="Scenario Lab" 
          desc="Mathematically inject missing values and extreme anomalies at scale." 
          color="indigo"
        />
        <FeatureCard 
          icon={ShieldCheck} 
          title="Privacy First" 
          desc="Zero risk of production PII leakage. Complete privacy risk assessment." 
          color="emerald"
        />
        <FeatureCard 
          icon={FileText} 
          title="Documents Engine" 
          desc="Generate pixel-perfect PDF/HTML documents tied directly to synthetic orders." 
          color="purple"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${colorStyles[color]} transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
