import { Fragment, useMemo, useState } from 'react'
import { formatNumber, formatPrice, formatShipmentDate } from '../utils/format'

const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { value: 'default', label: 'Сначала в наличии' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'stock-desc', label: 'Остаток: больше' },
  { value: 'brand', label: 'Производитель: А–Я' },
]

function StockBadge({ stock }) {
  if (stock > 0) {
    return (
      <span className="stock-badge in">
        <i className="bi bi-check-circle-fill" aria-hidden="true" />
        {formatNumber(stock)} шт.
      </span>
    )
  }
  return (
    <span className="stock-badge out">
      <i className="bi bi-dash-circle" aria-hidden="true" />
      нет
    </span>
  )
}

export default function OffersTable({ items }) {
  const [filter, setFilter] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(() => new Set())

  const rows = useMemo(() => {
    const query = filter.trim().toLowerCase()

    const filtered = items.filter((item) => {
      if (onlyInStock && item.stock <= 0) return false
      if (!query) return true
      return [item.name, item.brand, item.number].some((value) =>
        String(value).toLowerCase().includes(query),
      )
    })

    switch (sort) {
      case 'price-asc':
        return filtered.sort(
          (a, b) =>
            (a.bestPrice ?? Infinity) - (b.bestPrice ?? Infinity) ||
            a.brand.localeCompare(b.brand, 'ru'),
        )
      case 'price-desc':
        return filtered.sort(
          (a, b) =>
            (b.bestPrice ?? -Infinity) - (a.bestPrice ?? -Infinity) ||
            a.brand.localeCompare(b.brand, 'ru'),
        )
      case 'stock-desc':
        return filtered.sort((a, b) => b.stock - a.stock)
      case 'brand':
        return filtered.sort((a, b) => a.brand.localeCompare(b.brand, 'ru'))
      default:
        return filtered
    }
  }, [items, filter, onlyInStock, sort])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * PAGE_SIZE
  const visibleRows = rows.slice(start, start + PAGE_SIZE)

  const toggleRow = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetFilters = () => {
    setFilter('')
    setOnlyInStock(false)
    setSort('default')
    setPage(1)
  }

  return (
    <div className="offers-table-block">
      <div className="offers-toolbar">
        <div className="input-group search-filter">
          <span className="input-group-text" aria-hidden="true">
            <i className="bi bi-search" />
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Фильтр: название, бренд или артикул"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value)
              setPage(1)
            }}
            aria-label="Фильтр по названию, производителю или артикулу"
          />
        </div>

        <div className="form-check form-switch stock-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="only-in-stock"
            checked={onlyInStock}
            onChange={(event) => {
              setOnlyInStock(event.target.checked)
              setPage(1)
            }}
          />
          <label className="form-check-label" htmlFor="only-in-stock">
            Только в наличии
          </label>
        </div>

        <select
          className="form-select sort-select"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}
          aria-label="Сортировка"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-scroll-hint">
        <i className="bi bi-arrows-move" aria-hidden="true" />
        Прокрутите таблицу по горизонтали, чтобы увидеть цены и остатки
      </div>

      <div className="table-responsive">
        <table className="table offers-table align-middle mb-0">
          <thead>
            <tr>
              <th>Название</th>
              <th>Производитель</th>
              <th>Артикул</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
              <th className="text-end">Склады</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((item) => {
              const isExpanded = expanded.has(item.id)
              return (
                <Fragment key={item.id}>
                  <tr className={isExpanded ? 'is-expanded' : undefined}>
                    <td>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="product-name">{item.name}</span>
                        {item.notRefund && (
                          <span className="badge badge-soft-warning">без возврата</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="product-brand">{item.brand}</span>
                        {item.isOriginal && (
                          <span className="badge badge-soft-primary">исходная</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="article-chip">{item.number}</span>
                    </td>
                    <td className="text-end">
                      <span className="price-cell">
                        {item.offers.length > 1 && <span className="from">от</span>}
                        {formatPrice(item.bestPrice)}
                      </span>
                    </td>
                    <td className="text-end">
                      <StockBadge stock={item.stock} />
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary offer-toggle"
                        onClick={() => toggleRow(item.id)}
                        aria-expanded={isExpanded}
                        aria-label={`Предложения по складам: ${item.offers.length}`}
                      >
                        <i className="bi bi-building me-1" aria-hidden="true" />
                        {item.offers.length}
                        <i
                          className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} ms-1`}
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="offer-details-row">
                      <td colSpan={6}>
                        <div className="warehouse-panel">
                          <div className="warehouse-panel-title">
                            Предложения по складам
                            {item.rate > 1 && <span className="rate-note">кратность: {item.rate}</span>}
                          </div>

                          {item.offers.length === 0 ? (
                            <div className="text-muted small">
                              Нет предложений в наличии. Позиция доступна под заказ или отсутствует
                              на складах.
                            </div>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-sm warehouse-table align-middle mb-0">
                                <thead>
                                  <tr>
                                    <th>Склад</th>
                                    <th className="text-end">Цена</th>
                                    <th className="text-end">Остаток</th>
                                    <th>Отгрузка</th>
                                    <th>Примечание</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.offers.map((offer) => (
                                    <tr key={offer.id}>
                                      <td>
                                        <span className="fw-semibold">{offer.code}</span>
                                        {offer.own && (
                                          <span className="badge badge-soft-success ms-2">свой склад</span>
                                        )}
                                      </td>
                                      <td className="text-end fw-semibold">{formatPrice(offer.price)}</td>
                                      <td className="text-end">{formatNumber(offer.stock)} шт.</td>
                                      <td className="text-muted small">
                                        {formatShipmentDate(offer.shipmentDate)}
                                      </td>
                                      <td>
                                        {offer.notRefund ? (
                                          <span className="badge badge-soft-warning">без возврата</span>
                                        ) : (
                                          <span className="text-muted small">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="table-empty">
                    <i className="bi bi-funnel" aria-hidden="true" />
                    <div>
                      <div className="fw-semibold">По фильтру ничего не найдено</div>
                      <div className="text-muted small">Измените запрос или сбросьте фильтры.</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
                      Сбросить фильтры
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="offers-footer">
          <div className="text-muted small">
            Показано {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} из {formatNumber(rows.length)}
          </div>
          <nav aria-label="Постраничная навигация">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(safePage - 1)}
                  aria-label="Предыдущая страница"
                >
                  <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  {safePage} / {pageCount}
                </span>
              </li>
              <li className={`page-item ${safePage === pageCount ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(safePage + 1)}
                  aria-label="Следующая страница"
                >
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
