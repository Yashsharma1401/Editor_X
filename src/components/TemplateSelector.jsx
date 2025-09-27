import { useState } from 'react'

const templates = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with an empty canvas',
    preview: null
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Title slide with text and shapes',
    data: {
      objects: [
        {
          type: 'rect',
          left: 50,
          top: 50,
          width: 200,
          height: 100,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2
        },
        {
          type: 'i-text',
          left: 150,
          top: 100,
          text: 'Presentation Title',
          fontSize: 24,
          fill: '#ffffff',
          textAlign: 'center'
        }
      ]
    }
  },
  {
    id: 'diagram',
    name: 'Flow Diagram',
    description: 'Basic flowchart template',
    data: {
      objects: [
        {
          type: 'rect',
          left: 100,
          top: 100,
          width: 120,
          height: 60,
          fill: '#10b981',
          rx: 10,
          ry: 10
        },
        {
          type: 'i-text',
          left: 160,
          top: 130,
          text: 'Start',
          fontSize: 16,
          fill: '#ffffff',
          textAlign: 'center'
        },
        {
          type: 'rect',
          left: 100,
          top: 200,
          width: 120,
          height: 60,
          fill: '#f59e0b',
          rx: 10,
          ry: 10
        },
        {
          type: 'i-text',
          left: 160,
          top: 230,
          text: 'Process',
          fontSize: 16,
          fill: '#ffffff',
          textAlign: 'center'
        }
      ]
    }
  },
  {
    id: 'poster',
    name: 'Poster Design',
    description: 'Event poster template',
    data: {
      objects: [
        {
          type: 'rect',
          left: 50,
          top: 50,
          width: 300,
          height: 200,
          fill: '#1f2937',
          stroke: '#374151',
          strokeWidth: 3
        },
        {
          type: 'i-text',
          left: 200,
          top: 100,
          text: 'EVENT TITLE',
          fontSize: 32,
          fill: '#ffffff',
          textAlign: 'center',
          fontWeight: 'bold'
        },
        {
          type: 'i-text',
          left: 200,
          top: 150,
          text: 'Date & Location',
          fontSize: 18,
          fill: '#d1d5db',
          textAlign: 'center'
        },
        {
          type: 'circle',
          left: 200,
          top: 180,
          radius: 20,
          fill: '#ef4444'
        }
      ]
    }
  }
]

export default function TemplateSelector({ onSelect, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choose a Template
            </h2>
            <p className="text-slate-600 mt-2">Start your creative journey with a professional template</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                selectedTemplate?.id === template.id
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => setSelectedTemplate(template)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  selectedTemplate?.id === template.id
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {template.preview ? (
                    <img src={template.preview} alt={template.name} className="w-10 h-10" />
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{template.name}</h3>
                  <p className="text-slate-600 mt-1">{template.description}</p>
                  {selectedTemplate?.id === template.id && (
                    <div className="flex items-center gap-2 mt-2 text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Use Template
          </button>
        </div>
      </div>
    </div>
  )
}
