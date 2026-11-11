export default function Loader({
  title = 'Загружаем данные…',
  text = 'Пожалуйста, подождите.',
  lines = 3,
}) {
  return (
    <div className="loader-card" role="status" aria-live="polite">
      <div className="loader-head">
        <span className="spinner-border text-primary" aria-hidden="true" />
        <div>
          <div className="loader-title">{title}</div>
          {text && <div className="loader-text">{text}</div>}
        </div>
      </div>
      <div className="skeleton-lines" aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="skeleton-line"
            style={{ width: `${92 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  )
}
