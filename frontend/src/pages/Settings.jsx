import { useState } from 'react';
import { Settings as SettingsIcon, Database, Shield, Sliders, Save, Check } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [defaultLocale, setDefaultLocale] = useState('en_US');
  const [maxRowLimit, setMaxRowLimit] = useState(5000);
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-in space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">System Settings</h1>
        <p className="text-slate-500 text-sm">Configure default generation parameters, AI model preferences, and security options.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Generation Defaults */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 text-lg">Generation Defaults</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Default Locale</label>
              <select
                value={defaultLocale}
                onChange={(e) => setDefaultLocale(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="en_US">🇺🇸 English (US)</option>
                <option value="en_GB">🇬🇧 English (UK)</option>
                <option value="ur_PK">🇵🇰 Urdu (Pakistan)</option>
                <option value="ar_SA">🇸🇦 Arabic (Saudi Arabia)</option>
                <option value="es_ES">🇪🇸 Spanish (Spain)</option>
                <option value="zh_CN">🇨🇳 Chinese (China)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Max Rows Per Table</label>
              <input
                type="number"
                value={maxRowLimit}
                onChange={(e) => setMaxRowLimit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Provider Config */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database size={20} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-lg">AI Copilot Engine</h2>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">AI Inference Model</label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="fallback-rules">Rule-Based Deterministic Fallback</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">When Gemini API key is configured, natural language prompts are parsed instantly into schema definitions.</p>
          </div>
        </div>

        {/* Privacy Guard Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield size={20} className="text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-lg">Privacy Guard</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Automatically sanitize direct PII identifiers (SSN, credit card, real phone numbers)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Enforce zero-knowledge memory (Never persist raw user prompt logs)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            {saved ? <Check size={18} className="text-white" /> : <Save size={18} />}
            <span>{saved ? 'Preferences Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
