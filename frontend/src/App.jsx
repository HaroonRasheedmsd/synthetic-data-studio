import { useState, useEffect } from 'react'

// Why this file exists: This is the main entry point for our React UI.
// How it works: It uses a React "hook" (useEffect) to call our Python backend as soon as the page loads.
// It then displays the backend's response using Tailwind CSS for beautiful styling.

function App() {
  // useState holds data that can change over time.
  // 'backendStatus' is the variable, 'setBackendStatus' is the function to update it.
  const [backendStatus, setBackendStatus] = useState("Checking connection...")

  // useEffect runs code automatically when the component appears on the screen.
  useEffect(() => {
    // We try to "fetch" data from our Python backend running on port 8000.
    fetch("http://localhost:8000/health")
      .then(response => response.json()) // Convert the response into JSON format
      .then(data => {
        // If successful, update our status with the message from Python!
        setBackendStatus(data.message)
      })
      .catch(error => {
        // If it fails (maybe the backend isn't running?), show an error.
        setBackendStatus("Error: Could not connect to the Python backend. Is it running on port 8000?")
        console.error("Connection error:", error)
      })
  }, []) // The empty array [] means "only run this once when the page loads".

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* A beautifully styled card using Tailwind classes */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 duration-300 border border-gray-100">
        
        {/* Header section with a vibrant gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h1 className="text-3xl font-extrabold text-white text-center tracking-tight drop-shadow-md">
            Data Studio
          </h1>
          <p className="text-blue-100 text-center mt-2 font-medium opacity-90">
            HackDataV2 Architecture Verified
          </p>
        </div>

        {/* Content section */}
        <div className="p-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              System Status
            </h2>
            
            {/* 
              This box changes color based on the status.
              If it contains the word "Error", it turns red. Otherwise, green.
            */}
            <div className={`p-4 rounded-xl font-medium text-sm shadow-inner flex items-center gap-3 transition-colors duration-500 ${
              backendStatus.includes("Error") 
                ? "bg-red-50 text-red-700 border border-red-200" 
                : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              <div className={`w-3 h-3 rounded-full animate-pulse flex-shrink-0 shadow-sm ${
                backendStatus.includes("Error") ? "bg-red-500" : "bg-green-500"
              }`}></div>
              {backendStatus}
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
              If the indicator above is <span className="font-bold text-green-600">green</span>, Phase 1 is officially complete! The Vite + React frontend is successfully talking to the FastAPI backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
