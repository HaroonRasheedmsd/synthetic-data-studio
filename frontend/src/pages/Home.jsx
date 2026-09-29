import { useState, useEffect } from 'react';
import { Sparkles, Database, FileText, Sliders, ShieldCheck, Activity, Plus, ShoppingCart, Landmark, Stethoscope, GraduationCap, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PRESETS } from '../utils/presets';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch('http://127.0.0.1:8000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setProjects(await res.json());
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleQuickStart = (presetKey) => {
    const preset = PRESETS[presetKey] || PRESETS["E-Commerce"];
    localStorage.setItem('synthdata_schema', JSON.stringify(preset));
    navigate('/preview');
  };

  return (
    <div className="animate-in space-y-12 pb-12">
      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Synthetic Data Studio
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Generate realistic tabular, relational and business-document data without exposing real records.
        </p>
        <div className="flex justify-center items-center gap-4">
          <Link 
            to="/build" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Plus size={20} /> New Synthetic Environment
          </Link>
          <a href="#quick-starts" className="px-8 py-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold transition-all shadow-sm">
            Use Quick Start
          </a>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/build')}>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Sparkles size={24} /></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">AI Schema Copilot</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Describe your environment and AI builds the generation plan.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/datasets')}>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><Database size={24} /></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Synthetic World</h3>
          <p className="text-sm text-slate-600 leading-relaxed">One consistent world powers tables, databases and documents.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/scenarios')}>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Sliders size={24} /></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Scenario Lab</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Inject missing data, outliers, boundary cases and anomalies.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/quality')}>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Activity size={24} /></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Validation Engine</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Verify relationships, constraints and business rules.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/documents')}>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4"><FileText size={24} /></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Document Studio</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Generate invoices and bank statements from synthetic records.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/quality')}>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4"><ShieldCheck size={24} /></div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Privacy Guard</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Detect duplicate records and potential identifier leakage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="quick-starts">
        {/* Quick Starts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Dashboard Quick Start</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><ShoppingCart size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900">E-Commerce</h4>
                  <p className="text-xs text-slate-500">Customers, Products, Orders, Payments, Invoices.</p>
                </div>
              </div>
              <button onClick={() => handleQuickStart("E-Commerce")} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">Generate</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Landmark size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900">Banking</h4>
                  <p className="text-xs text-slate-500">Customers, Accounts, Transactions, Statements.</p>
                </div>
              </div>
              <button onClick={() => handleQuickStart("Banking")} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">Generate</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Stethoscope size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900">Healthcare</h4>
                  <p className="text-xs text-slate-500">Patients, Doctors, Appointments, Prescriptions.</p>
                </div>
              </div>
              <button onClick={() => handleQuickStart("Healthcare")} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">Generate</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><GraduationCap size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900">Education</h4>
                  <p className="text-xs text-slate-500">Students, Courses, Enrollments, Grades.</p>
                </div>
              </div>
              <button onClick={() => handleQuickStart("Education")} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">Generate</button>
            </div>
          </div>
        </div>

        {/* Recent Environments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-slate-400" /> Recent Environments
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="m-auto text-sm font-bold text-slate-400 animate-pulse">Loading environments...</div>
            ) : projects.length === 0 ? (
              <div className="m-auto text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database size={24} className="text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-700">No environments yet.</h4>
                <p className="text-sm text-slate-500 mt-1">Describe your environment or choose a Quick Start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(proj => {
                  let meta = {};
                  try { meta = JSON.parse(proj.metadata_json); } catch(e){}
                  return (
                    <div key={proj.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                         onClick={() => {
                            if (proj.plan_json) {
                              localStorage.setItem('synthdata_schema', proj.plan_json);
                              navigate('/preview');
                            }
                         }}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-blue-900">{proj.name}</h4>
                        <span className="text-xs text-slate-400">{new Date(proj.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-3">
                        <span>{meta.rows ? meta.rows.toLocaleString() : 'N/A'} records</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{meta.tables || 0} tables</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
