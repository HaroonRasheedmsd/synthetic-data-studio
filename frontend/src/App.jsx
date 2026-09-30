import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Database, Home as HomeIcon, FileText, Settings, ShieldCheck, Download, Table, Sparkles, Sliders, LogOut, User as UserIcon, Activity, Receipt, CreditCard, ChevronRight, Key, Layers, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from './utils/api';
import Home from './pages/Home';
import SchemaBuilder from './pages/SchemaBuilder';
import DataPreview from './pages/DataPreview';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import SettingsPage from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const NavLink = ({ to, icon: Icon, title, description, color = "blue" }) => {
    const isActive = (location.pathname.startsWith(to) && to !== '/') || location.pathname === to;

    const colorClasses = {
      blue: isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-blue-50 text-blue-600',
      purple: isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' : 'bg-purple-50 text-purple-600',
      indigo: isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-indigo-50 text-indigo-600',
      emerald: isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 'bg-emerald-50 text-emerald-600',
      rose: isActive ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30' : 'bg-rose-50 text-rose-600',
      amber: isActive ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30' : 'bg-amber-50 text-amber-600',
    };

    return (
      <Link
        to={to}
        className={`flex items-start space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-white text-blue-900 shadow-md shadow-slate-200/50 border border-blue-200 ring-1 ring-blue-100' 
            : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
        }`}
      >
        <div className={`p-2 rounded-lg mt-0.5 transition-all duration-200 ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="font-bold text-[13px] tracking-tight leading-snug text-slate-900 mb-0.5">{title}</div>
          {description && (
            <div className="text-[10px] text-slate-400 font-medium truncate leading-none">{description}</div>
          )}
        </div>
      </Link>
    );
  };

  // Unauthenticated Layout
  if (!token) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  // Authenticated Layout
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F6F8FA] flex font-sans text-slate-800">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col fixed h-full z-20 shadow-sm">
          {/* Brand Logo Header */}
          <div className="p-5 flex items-center space-x-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <div className="font-black text-[16px] tracking-tight leading-none text-white">HackDataV2</div>
              <div className="text-[10px] text-indigo-200 font-semibold tracking-wide uppercase mt-1">Synthetic Data Studio</div>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-3">Navigation</div>
              <NavLink to="/dashboard" icon={HomeIcon} title="Dashboard" description="Overview & projects" color="blue" />
            </div>

            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-3">Synthetic Data Generators</div>
              <div className="space-y-1">
                <NavLink to="/build" icon={Sparkles} title="AI Generator Studio" description="Intent & ER Builder" color="indigo" />
                <NavLink to="/datasets" icon={Table} title="Tabular Data" description="Flat independent tables" color="blue" />
                <NavLink to="/scenarios" icon={Layers} title="Relational Graph" description="Connected DB & SQL Engine" color="indigo" />
                <NavLink to="/invoices" icon={Receipt} title="Synthetic Invoice" description="Demo billing data" color="emerald" />
                <NavLink to="/statements" icon={CreditCard} title="Synthetic Statement" description="Demo ledger data" color="indigo" />
                <NavLink to="/narratives" icon={BookOpen} title="Narrative Document" description="Multi-lingual reports" color="indigo" />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-3">Quality & System</div>
              <div className="space-y-1">
                <NavLink to="/quality" icon={ShieldCheck} title="Quality & Constraints" description="Verification report" color="emerald" />
                <NavLink to="/exports" icon={Download} title="Export Center" description="ZIP & CSV bundles" color="indigo" />
                <NavLink to="/settings" icon={Settings} title="Settings" description="Preferences & Keys" color="blue" />
              </div>
            </div>
          </nav>

          {/* API Status Widget (Matching user screenshot) */}
          <div className="px-4 py-3.5 border-t border-slate-100 bg-slate-50/80 space-y-3">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-3 shadow-md border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-slate-300">API Status</span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Gemini 3.8 Flash • 4-model fallback</div>
            </div>

            {/* User Profile Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate leading-none mb-0.5">{user?.full_name || 'User'}</div>
                  <div className="text-[10px] text-slate-400 truncate leading-none">{user?.email || ''}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                title="Logout"
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto relative w-full">
          <div className="absolute top-6 right-8 z-50">
            <button 
              onClick={() => document.documentElement.classList.toggle('dark-theme')}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-full px-4 py-2 shadow-sm hover:bg-slate-50 transition-all hover:shadow-md theme-toggle"
            >
              <span>🌓 Toggle Theme</span>
            </button>
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/build" element={<SchemaBuilder />} />
            <Route path="/preview" element={<DataPreview activeTab="all" />} />
            <Route path="/datasets" element={<DataPreview activeTab="datasets" />} />
            <Route path="/scenarios" element={<DataPreview activeTab="scenarios" />} />
            <Route path="/documents" element={<DataPreview activeTab="documents" />} />
            <Route path="/invoices" element={<DataPreview activeTab="invoices" />} />
            <Route path="/statements" element={<DataPreview activeTab="statements" />} />
            <Route path="/narratives" element={<DataPreview activeTab="narratives" />} />
            <Route path="/quality" element={<DataPreview activeTab="quality" />} />
            <Route path="/exports" element={<DataPreview activeTab="exports" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
