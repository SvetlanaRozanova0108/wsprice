import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetSearch, searchBrands, setApiKey } from '../store/searchSlice'

const EXAMPLES = ['0189', '7160500039S']

export default function SearchForm() {
  const dispatch = useDispatch()
  const { apiKey, query, brands } = useSelector((state) => state.search)
  const [number, setNumber] = useState(query.number)
  const loading = brands.status === 'loading'
  const hasResults = brands.status === 'success' && brands.items.length > 0

  useEffect(() => {
    setNumber(query.number)
  }, [query.number])

  const runSearch = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    dispatch(searchBrands({ number: trimmed, key: apiKey.trim() }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (loading) return
    runSearch(number)
  }

  const handleReset = () => {
    setNumber('')
    dispatch(resetSearch())
  }

  return (
    <section className="search-card" aria-label="Поиск по артикулу">
      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <label htmlFor="article" className="form-label fw-semibold mb-0">
            Артикул автозапчасти
          </label>
          <span className="search-badge">
            <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
            Два шага: бренд → аналоги
          </span>
        </div>

        <div className="search-row">
          <div className="input-group input-group-lg flex-grow-1">
            <span className="input-group-text" aria-hidden="true">
              <i className="bi bi-upc-scan" />
            </span>
            <input
              id="article"
              type="text"
              className="form-control"
              placeholder="Например: 0189 или 7160500039S"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
              disabled={loading}
              aria-describedby="article-help"
            />
            {number && !loading && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setNumber('')}
                aria-label="Очистить артикул"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg search-btn" disabled={loading || !number.trim()}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            ) : (
              <i className="bi bi-search me-2" aria-hidden="true" />
            )}
            {loading ? 'Ищем…' : 'Найти'}
          </button>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
          <div id="article-help" className="form-text mb-0">
            Введите номер детали и нажмите Enter. Спецсимволы кодируются автоматически.
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="examples-label">Примеры:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="example-chip"
                onClick={() => {
                  setNumber(example)
                  runSearch(example)
                }}
                disabled={loading}
              >
                {example}
              </button>
            ))}
            {hasResults && (
              <button type="button" className="btn btn-link btn-sm p-0 ms-1" onClick={handleReset}>
                Сбросить
              </button>
            )}
          </div>
        </div>
      </form>

      <details className="api-settings">
        <summary>
          <i className="bi bi-key" aria-hidden="true" />
          Настройки подключения
        </summary>
        <div className="api-settings-body">
          <label htmlFor="apiKey" className="form-label small fw-semibold mb-1">
            Ключ покупателя (API key)
          </label>
          <input
            id="apiKey"
            type="text"
            className="form-control form-control-sm font-monospace"
            value={apiKey}
            onChange={(event) => dispatch(setApiKey(event.target.value))}
            autoComplete="off"
            spellCheck={false}
            placeholder="00000000-0000-0000-0000-000000000000"
          />
          <div className="form-text">
            По умолчанию используется демонстрационный ключ из документации. Ключ сохраняется только
            в вашем браузере.
          </div>
        </div>
      </details>
    </section>
  )
}
