export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert error-alert d-flex align-items-start gap-3" role="alert">
      <i className="bi bi-exclamation-triangle-fill error-alert-icon" aria-hidden="true" />
      <div className="flex-grow-1">
        <div className="fw-semibold">Не удалось получить данные</div>
        <div className="error-alert-text">{message}</div>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger flex-shrink-0" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
          Повторить
        </button>
      )}
    </div>
  )
}
