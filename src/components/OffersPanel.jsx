import { useDispatch, useSelector } from 'react-redux'
import { clearBrand, searchOffers } from '../store/searchSlice'
import { formatNumber, formatPrice } from '../utils/format'
import EmptyState from './EmptyState'
import ErrorAlert from './ErrorAlert'
import Loader from './Loader'
import OffersTable from './OffersTable'

function StatCard({ icon, label, value, tone = '' }) {
  return (
    <div className="col-6 col-lg-3">
      <div className={`stat-card ${tone}`}>
        <span className="stat-icon" aria-hidden="true">
          <i className={`bi ${icon}`} />
        </span>
        <div className="min-w-0">
          <div className="stat-value text-truncate">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  )
}

export default function OffersPanel() {
  const dispatch = useDispatch()
  const { query, offers, apiKey } = useSelector((state) => state.search)
  const { number, brand } = query

  const retry = () => {
    dispatch(searchOffers({ number, brand, key: apiKey.trim() }))
  }

  return (
    <section className="panel" aria-labelledby="offers-title">
      <div className="panel-header offers-head">
        <div>
          <button type="button" className="back-link" onClick={() => dispatch(clearBrand())}>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Другой производитель
          </button>
          <h2 className="panel-title mt-2" id="offers-title">
            Аналоги и предложения
          </h2>
          <p className="panel-subtitle">
            Артикул <span className="article-chip">{number}</span>
            <span className="mx-2 text-muted">·</span>
            <span className="brand-pill">{brand}</span>
          </p>
        </div>

        {offers.status === 'success' && (
          <span className="panel-hint">
            <i className="bi bi-info-circle" aria-hidden="true" />
            Цены и остатки — на момент запроса
          </span>
        )}
      </div>

      {offers.status === 'loading' && (
        <Loader
          title="Подбираем аналоги и предложения…"
          text="Сервис собирает цены и остатки по складам. Это может занять несколько секунд."
          lines={4}
        />
      )}

      {offers.status === 'error' && <ErrorAlert message={offers.error} onRetry={retry} />}

      {offers.status === 'success' && offers.items.length === 0 && (
        <EmptyState
          icon="bi-search"
          title="Аналоги не найдены"
          text={`По артикулу ${number} у производителя ${brand} не удалось найти предложений. Попробуйте другого производителя или проверьте написание артикула.`}
        >
          <button type="button" className="btn btn-outline-primary" onClick={() => dispatch(clearBrand())}>
            <i className="bi bi-arrow-left me-1" aria-hidden="true" />
            Вернуться к производителям
          </button>
        </EmptyState>
      )}

      {offers.status === 'success' && offers.items.length > 0 && offers.stats && (
        <>
          <div className="row g-3 mb-4">
            <StatCard icon="bi-box-seam" label="Позиций" value={formatNumber(offers.stats.total)} />
            <StatCard
              icon="bi-check2-circle"
              label="В наличии"
              value={formatNumber(offers.stats.inStock)}
              tone="success"
            />
            <StatCard
              icon="bi-building"
              label="Предложений"
              value={formatNumber(offers.stats.offers)}
              tone="amber"
            />
            <StatCard icon="bi-tag" label="Мин. цена" value={formatPrice(offers.stats.minPrice)} />
          </div>

          <OffersTable items={offers.items} />
        </>
      )}
    </section>
  )
}
