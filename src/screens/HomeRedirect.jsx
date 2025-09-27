import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TemplateSelector from '../components/TemplateSelector'

function generateId() {
  // URL-safe base36 id
  const random = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36)
  return `${time}-${random}`
}

export default function HomeRedirect() {
  const navigate = useNavigate()
  const [showTemplates, setShowTemplates] = useState(true)

  const handleTemplateSelect = (template) => {
    const id = generateId()
    const url = `/canvas/${id}`
    
    if (template.data) {
      // Store template data in sessionStorage to be loaded by canvas
      sessionStorage.setItem(`template_${id}`, JSON.stringify(template.data))
    }
    
    navigate(url, { replace: true })
  }

  const handleSkipTemplates = () => {
    const id = generateId()
    navigate(`/canvas/${id}`, { replace: true })
  }

  if (showTemplates) {
    return (
      <TemplateSelector
        onSelect={handleTemplateSelect}
        onClose={handleSkipTemplates}
      />
    )
  }

  return null
}


