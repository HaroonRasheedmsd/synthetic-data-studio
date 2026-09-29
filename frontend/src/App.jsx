import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Database, Home as HomeIcon, Table } from 'lucide-react';
import Home from './pages/Home';
import SchemaBuilder from './pages/SchemaBuilder';
import DataPreview from './pages/DataPreview';

function App() {
  const location = useLocation();

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Database size={20} className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  SynthData
                </span>
              </div>
              <div className="hidden md:flex space-x-2">
                <NavLink to="/" icon={HomeIcon}>Home</NavLink>
                <NavLink to="/build" icon={Database}>Schema Builder</NavLink>
                <NavLink to="/preview" icon={Table}>Data Preview</NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
