import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BrandList from './components/BrandList'
import EmptyState from './components/EmptyState'
import ErrorAlert from './components/ErrorAlert'
import Loader from './components/Loader'
import OffersPanel from './components/OffersPanel'
import SearchForm from './components/SearchForm'
import Stepper from './components/Stepper'
import { searchBrands } from './store/searchSlice'

const STORAGE_KEY = 'wsprice.apiKey'

const HOW_IT_WORKS = [
  {
    icon: 'bi-upc-scan',
    title: 'Введите артикул',
    text: 'Номер детали, например 0189 или 7160500039S.',
  },
  {
    icon: 'bi-diagram-3',
    title: 'Выберите производителя',
    text: 'Сервис покажет все бренды, выпускающие деталь с этим номером.',
  },
  {
    icon: 'bi-table',
    title: 'Сравните предложения',
    text: 'Аналоги, цены и остатки по складам — в одной таблице.',
  },
]

function Welcome() {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome-head">
        <span className="welcome-kicker">Подбор номенклатуры</span>
        <h2 className="welcome-title" id="welcome-title">
          Найдите деталь и её аналоги за два шага
        </h2>
        <p className="welcome-text">
          Введите артикул — сервис «Проценка» подскажет производителей. Выберите бренд, чтобы
          получить аналоги с актуальными ценами и остатками на складах.
        </p>
      </div>
      <div className="row g-3">
        {HOW_IT_WORKS.map((item, index) => (
          <div className="col-12 col-md-4" key={item.title}>
            <div className="how-card">
              <span className="how-number">{index + 1}</span>
              <span className="how-icon" aria-hidden="true">
                <i className={`bi ${item.icon}`} />
              </span>
              <div className="how-title">{item.title}</div>
              <div className="how-text">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="welcome-tip">
        <i className="bi bi-lightbulb" aria-hidden="true" />
        Попробуйте пример <span className="article-chip">0189</span> — он работает с демонстрационным
        ключом из документации.
      </div>
    </section>
  )
}

export default function App() {
  const dispatch = useDispatch()
  const { apiKey, query, brands, offers } = useSelector((state) => state.search)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, apiKey)
    } catch {
      // localStorage может быть недоступен (приватный режим) — не критично.
    }
  }, [apiKey])

  const hasBrands = brands.status === 'success' && brands.items.length > 0
  const currentStep = hasBrands ? (query.brand ? 3 : 2) : 1

  const retryBrands = () => {
    dispatch(searchBrands({ number: query.number, key: apiKey.trim() }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container app-header-inner">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <i className="bi bi-box-seam-fill" />
            </span>
            <div>
              <h1>Проценка</h1>
              <p>Подбор автозапчастей и аналогов</p>
            </div>
          </div>
          <div className="header-meta">
            <span className="status-dot" aria-hidden="true" />
            API favorit-parts.ru
          </div>
        </div>
      </header>

      <main className="container app-main">
        <SearchForm />
        <Stepper current={currentStep} />

        <div className="results" aria-live="polite">
          {brands.status === 'loading' && (
            <Loader
              title={`Ищем производителей по артикулу ${query.number}…`}
              text="Запрашиваем список брендов и предложений у сервиса."
            />
          )}

          {brands.status === 'error' && <ErrorAlert message={brands.error} onRetry={retryBrands} />}

          {brands.status === 'success' && brands.items.length === 0 && (
            <EmptyState
              icon="bi-search"
              title="По артикулу ничего не найдено"
              text={`Сервис не нашёл деталь с номером «${query.number}». Проверьте написание артикула или попробуйте другой номер.`}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => document.getElementById('article')?.focus()}
              >
                <i className="bi bi-pencil me-1" aria-hidden="true" />
                Изменить артикул
              </button>
            </EmptyState>
          )}

          {hasBrands && !query.brand && <BrandList />}

          {query.brand && <OffersPanel />}

          {brands.status === 'idle' && !query.number && <Welcome />}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container d-flex flex-wrap justify-content-between gap-2">
          <span>Проценка — подбор автозапчастей и аналогов</span>
          <span>
            Источник данных: API «Проценка» · favorit-parts.ru
            {offers.status === 'success' && ' · данные актуальны на момент запроса'}
          </span>
        </div>
      </footer>
    </div>
  )
}
