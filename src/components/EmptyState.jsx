export default function EmptyState({
  icon = 'bi-inbox',
  title = 'Ничего не найдено',
  text,
  children,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </span>
      <h2 className="empty-title">{title}</h2>
      {text && <p className="empty-text">{text}</p>}
      {children}
    </div>
  )
}
