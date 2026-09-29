import { Link } from 'react-router-dom';
import { Sparkles, Database, FastForward } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Data generation, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            powered by AI.
          </span>
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          Describe your database architecture in plain English. 
          Our AI architect builds the schema, and our Python engine generates millions of realistic rows in seconds.
        </p>
      </div>

      <div className="flex space-x-4">
        <Link 
          to="/build" 
          className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.7)] flex items-center space-x-2"
        >
          <Sparkles size={20} />
          <span>Start Building</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-5xl">
        <FeatureCard 
          icon={Database} 
          title="Relational AI" 
          desc="Automatically infers Foreign Keys and complex table relationships."
        />
        <FeatureCard 
          icon={FastForward} 
          title="Faker Integration" 
          desc="Deterministically generates names, UUIDs, addresses, and dates."
        />
        <FeatureCard 
          icon={Sparkles} 
          title="Ready to Export" 
          desc="Download your synthetic data in JSON format instantly."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm text-left hover:border-gray-700 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="text-blue-400" size={24} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}
