const STEPS = [
  { number: 1, label: 'Артикул', shortLabel: 'Артикул', hint: 'Поиск производителей' },
  { number: 2, label: 'Производитель', shortLabel: 'Бренд', hint: 'Выбор бренда' },
  { number: 3, label: 'Предложения', shortLabel: 'Цены', hint: 'Аналоги и цены' },
]

export default function Stepper({ current }) {
  return (
    <ol className="stepper" aria-label="Этапы подбора">
      {STEPS.map((step) => {
        const state = step.number < current ? 'done' : step.number === current ? 'active' : 'todo'
        return (
          <li key={step.number} className={`stepper-item ${state}`} aria-current={state === 'active' ? 'step' : undefined}>
            <span className="stepper-circle" aria-hidden="true">
              {state === 'done' ? <i className="bi bi-check-lg" /> : step.number}
            </span>
            <span className="stepper-text">
              <span className="stepper-label">
                <span className="stepper-label-full">{step.label}</span>
                <span className="stepper-label-short">{step.shortLabel}</span>
              </span>
              <span className="stepper-hint">{step.hint}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
