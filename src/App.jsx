import { useState } from 'react'
import AdForm from './components/AdForm.jsx'
import AdResult from './components/AdResult.jsx'
import './App.css'

const initialResult = {
  shortAdText:
    'Enter a business name and product details to generate Instagram ad copy.',
  callToAction: 'Generate ad',
  hashtags: ['#InstagramAd', '#SmallBusiness', '#Marketing'],
}

async function readJsonResponse(response) {
  const responseText = await response.text()

  if (!responseText) {
    return {}
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error('The server returned an invalid JSON response.')
  }
}

function App() {
  const [result, setResult] = useState(initialResult)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(formData) {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ads/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const payload = await readJsonResponse(response)

      if (!response.ok) {
        throw new Error(payload.message || 'Could not generate ad copy.')
      }

      if (!payload.ad) {
        throw new Error('The server response did not include generated ad data.')
      }

      setResult(payload.ad)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="AI ad generator">
        <div className="intro">
          <p className="eyebrow">AI Ad Generator</p>
          <h1>Generate Instagram ad copy in seconds.</h1>
          <p>
            Turn business and product notes into a ready-to-review Instagram
            ad with short copy, a CTA, and at least three hashtags.
          </p>
        </div>

        <div className="generator-grid">
          <AdForm onGenerate={handleGenerate} isLoading={isLoading} />
          <AdResult result={result} isLoading={isLoading} error={error} />
        </div>
      </section>
    </main>
  )
}

export default App
