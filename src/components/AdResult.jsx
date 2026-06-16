function AdResult({ result, isLoading, error }) {
  const hashtags = Array.isArray(result.hashtags) ? result.hashtags : []

  return (
    <aside className="ad-result" aria-live="polite">
      <div className="result-header">
        <span>Instagram ad result</span>
        <strong>{isLoading ? 'Working' : 'Ready'}</strong>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      {isLoading ? (
        <div className="ai-loader" role="status" aria-label="AI is generating">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : null}

      <article className={isLoading ? 'result-card is-loading' : 'result-card'}>
        <p className="result-label">Short ad text</p>
        <p className="primary-text">{result.shortAdText}</p>

        <p className="result-label">CTA</p>
        <p className="cta">{result.callToAction}</p>

        <p className="result-label">Hashtags</p>
        <div className="hashtags">
          {hashtags.map((hashtag) => (
            <span key={hashtag}>{hashtag}</span>
          ))}
        </div>
      </article>
    </aside>
  )
}

export default AdResult
