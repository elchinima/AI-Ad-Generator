import { useState } from 'react'

const defaultValues = {
  businessName: '',
  audience: '',
  language: 'english',
  goal: 'sales',
  tone: 'confident',
  productInfo: '',
}

function AdForm({ onGenerate, isLoading }) {
  const [values, setValues] = useState(defaultValues)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onGenerate(values)
  }

  return (
    <form className="ad-form" onSubmit={handleSubmit}>
      <label>
        Business name
        <input
          name="businessName"
          value={values.businessName}
          onChange={handleChange}
          placeholder="Cafe Baku"
          required
        />
      </label>

      <div className="form-row">
        <label>
          Target audience
          <input
            name="audience"
            value={values.audience}
            onChange={handleChange}
            placeholder="Small business owners"
            required
          />
        </label>

        <label>
          Language
          <select name="language" value={values.language} onChange={handleChange}>
            <option value="russian">Russian</option>
            <option value="azerbaijani">Azerbaijani</option>
            <option value="english">English</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Goal
          <select name="goal" value={values.goal} onChange={handleChange}>
            <option value="sales">Sales</option>
            <option value="leads">Leads</option>
            <option value="awareness">Awareness</option>
            <option value="retention">Retention</option>
          </select>
        </label>

        <label>
          Tone
          <select name="tone" value={values.tone} onChange={handleChange}>
            <option value="confident">Confident</option>
            <option value="friendly">Friendly</option>
            <option value="premium">Premium</option>
            <option value="playful">Playful</option>
          </select>
        </label>
      </div>

      <label>
        Product or service info
        <textarea
          name="productInfo"
          value={values.productInfo}
          onChange={handleChange}
          placeholder="Write a short description of the product, service, offer, or main benefit."
          rows="6"
          required
        />
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate ad'}
      </button>
    </form>
  )
}

export default AdForm
