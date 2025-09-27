import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// Removed: import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    // Replaced the custom 'gradiant-bg' and 'text-black' with Tailwind utilities
    <div className='min-h-screen p-4 flex flex-col items-center justify-center font-sans bg-gray-50 text-gray-800 space-y-8'>
      {/* Logos Container */}
      <div className='flex justify-center items-center space-x-8'>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          {/* Added Tailwind styles for logo size and animation */}
          <img src={viteLogo} className="w-24 h-24 hover:drop-shadow-lg transition-transform duration-300 transform hover:scale-105" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          {/* Added Tailwind styles for logo size and animation */}
          <img src={reactLogo} className="w-24 h-24 react hover:drop-shadow-lg transition-transform duration-300 transform hover:scale-105" alt="React logo" />
        </a>
      </div>

      {/* Main Content */}
      <h1 className='text-5xl font-extrabold text-indigo-600 tracking-tight'>IMageEditor</h1>
      
      {/* Card */}
      <div className="p-6 bg-white shadow-xl rounded-xl border border-gray-200 w-full max-w-sm flex flex-col items-center space-y-4">
        
        {/* Button */}
        <button 
          onClick={() => setCount((count) => count + 1)}
          className='px-6 py-2 text-lg font-semibold rounded-full text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-150 ease-in-out shadow-md hover:shadow-lg'
        >
          count is {count}
        </button>
        
        {/* HMR Message */}
        <p className='text-sm text-gray-600 mt-2 text-center'>
          Edit <code className='bg-gray-100 p-1 rounded font-mono text-indigo-500'>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
      {/* Read the Docs message */}
      <p className="text-gray-500 text-center mt-4">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App