import { useDispatch, useSelector } from 'react-redux'
import { searchOffers } from '../store/searchSlice'
import { formatNumber, formatPrice, pluralize } from '../utils/format'

export default function BrandList() {
  const dispatch = useDispatch()
  const { brands, query, apiKey } = useSelector((state) => state.search)

  return (
    <section className="panel" aria-labelledby="brands-title">
      <div className="panel-header">
        <div>
          <h2 className="panel-title" id="brands-title">
            Выберите производителя
          </h2>
          <p className="panel-subtitle">
            Артикул <span className="article-chip">{query.number}</span> · найдено брендов:{' '}
            <strong>{brands.items.length}</strong>
          </p>
        </div>
        <span className="panel-hint">
          <i className="bi bi-mouse2" aria-hidden="true" /> Нажмите на карточку, чтобы получить аналоги
        </span>
      </div>

      <div className="row g-3">
        {brands.items.map((brand) => (
          <div className="col-12 col-xl-6" key={brand.id}>
            <button
              type="button"
              className="brand-card w-100 text-start"
              onClick={() =>
                dispatch(
                  searchOffers({
                    number: query.number,
                    brand: brand.brand,
                    key: apiKey.trim(),
                  }),
                )
              }
              aria-label={`Показать аналоги производителя ${brand.brand}`}
            >
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="min-w-0">
                  <div className="brand-name">{brand.brand}</div>

                  <div className="brand-numbers">
                    {brand.numbers.map((entry) => (
                      <span className="article-chip" key={entry.number} title={entry.name}>
                        {entry.number}
                      </span>
                    ))}
                  </div>

                  <div className="brand-meta">
                    <span>
                      <i className="bi bi-box-seam" aria-hidden="true" />
                      {formatNumber(brand.count)} шт.
                    </span>
                    <span>
                      <i className="bi bi-building" aria-hidden="true" />
                      {brand.offersCount}{' '}
                      {pluralize(brand.offersCount, ['предложение', 'предложения', 'предложений'])}
                    </span>
                    {brand.count === 0 && (
                      <span className="text-warning-emphasis">
                        <i className="bi bi-exclamation-circle" aria-hidden="true" />
                        нет в наличии
                      </span>
                    )}
                  </div>
                </div>

                <div className="brand-price">
                  <span>цена от</span>
                  <span className="brand-price-value">
                    {brand.bestPrice !== null ? formatPrice(brand.bestPrice) : '—'}
                  </span>
                  <span className="brand-arrow" aria-hidden="true">
                    <i className="bi bi-arrow-right" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
