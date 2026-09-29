import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Database, Home as HomeIcon, FileText, Settings, ShieldCheck, Download, Table, Activity, Sparkles, Sliders } from 'lucide-react';
import Home from './pages/Home';
import SchemaBuilder from './pages/SchemaBuilder';
import DataPreview from './pages/DataPreview';

function App() {
  const location = useLocation();

  const NavLink = ({ to, icon: Icon, children }) => {
    // Basic active matching for dummy links mapping to preview
    const isActive = location.pathname === to || (to === '/preview' && ['/datasets', '/scenarios', '/documents', '/quality', '/exports'].includes(location.pathname));
    
    // Map visual routes to actual functional routes
    let target = to;
    if (['/datasets', '/scenarios', '/documents', '/quality', '/exports'].includes(to)) {
      target = '/preview';
    }

    return (
      <Link
        to={target}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
          isActive 
            ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Database size={16} className="text-white" />
          </div>
          <span className="font-bold text-[17px] text-slate-900 tracking-tight">
            Synthetic Studio
          </span>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-2">Workspace</div>
          <NavLink to="/" icon={HomeIcon}>Overview</NavLink>
          <NavLink to="/build" icon={Sparkles}>Generate</NavLink>
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6">Results</div>
          <NavLink to="/datasets" icon={Table}>Datasets</NavLink>
          <NavLink to="/scenarios" icon={Sliders}>Scenarios</NavLink>
          <NavLink to="/documents" icon={FileText}>Documents</NavLink>
          <NavLink to="/quality" icon={ShieldCheck}>Quality</NavLink>
          <NavLink to="/exports" icon={Download}>Exports</NavLink>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6">System</div>
          <NavLink to="/api" icon={Database}>API</NavLink>
          <NavLink to="/settings" icon={Settings}>Settings</NavLink>
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Activity size={14} className="text-emerald-500" />
            <span className="font-medium">AI Engine Online</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto relative w-full">
        <div className="absolute top-6 right-8 z-50">
          <button 
            onClick={() => document.documentElement.classList.toggle('dark-theme')}
            className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm hover:bg-slate-50 transition-colors theme-toggle"
          >
            <span className="font-bold text-slate-700">🌓 Toggle Theme</span>
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/build" element={<SchemaBuilder />} />
          <Route path="/preview" element={<DataPreview />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
