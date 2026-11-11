const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('ru-RU')

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number) ? priceFormatter.format(number) : '—'
}

export function formatNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? numberFormatter.format(number) : '—'
}

export function formatShipmentDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

/** Русская форма слова для числа: pluralize(3, ['товар', 'товара', 'товаров']). */
export function pluralize(count, forms) {
  const absolute = Math.abs(Number(count)) % 100
  const last = absolute % 10
  if (absolute > 10 && absolute < 20) return forms[2]
  if (last === 1) return forms[0]
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}
