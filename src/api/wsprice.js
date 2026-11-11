/**
 * Тонкий клиент к Web-сервису «Проценка» (favorit-parts.ru).
 *
 * GET /hs/hsprice/?key=...&number=...&brand=...&analogues=on&info=on
 *
 * В ответ приходит { goods: [...] } либо { error: "..." }.
 * Цену позиции берём не из goods.price, а из конкретных складов goods[].warehouses[].
 */

const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001'
const API_BASE = import.meta.env.VITE_API_BASE || '/hs/hsprice/'

export { DEFAULT_API_KEY }

export class ApiError extends Error {
  constructor(message, { status = null, raw = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.raw = raw
  }
}

const ERROR_MESSAGES = {
  'empty key!': 'Не указан ключ покупателя. Укажите ключ в настройках подключения.',
  'invalid key client!': 'Неверный ключ покупателя. Проверьте ключ в настройках подключения.',
  'invalid access key': 'Неверный ключ покупателя. Проверьте ключ в настройках подключения.',
  'empty number goods!': 'Не указан артикул детали.',
  'request quota exceeded!': 'Превышен лимит запросов к сервису. Попробуйте немного позже.',
}

function normalizeApiError(raw) {
  const text = String(raw ?? '').trim()
  const known = ERROR_MESSAGES[text.toLowerCase()]
  return known || `Сервис вернул ошибку: ${text || 'неизвестная ошибка'}`
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

async function requestGoods(params, signal) {
  const base = API_BASE.startsWith('http')
    ? API_BASE
    : new URL(API_BASE, window.location.origin).toString()

  const url = new URL(base)
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, String(value))
    }
  })

  let response
  try {
    response = await fetch(url.toString(), {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(
      'Не удалось связаться с сервисом. Проверьте подключение к интернету и попробуйте ещё раз.',
    )
  }

  if (!response.ok) {
    let payload = null
    try {
      payload = await response.json()
    } catch {
      // Тело ответа может быть не JSON — используем общий текст ошибки.
    }

    if (payload?.error) {
      throw new ApiError(normalizeApiError(payload.error), {
        status: response.status,
        raw: payload.error,
      })
    }

    throw new ApiError(
      `Сервис ответил с ошибкой ${response.status}${response.statusText ? ` ${response.statusText}` : ''}. Попробуйте ещё раз.`,
      { status: response.status },
    )
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new ApiError('Сервис вернул некорректный ответ: не удалось прочитать JSON.')
  }

  if (data?.error) {
    throw new ApiError(normalizeApiError(data.error), { raw: data.error })
  }

  if (!data || !Array.isArray(data.goods)) {
    throw new ApiError('Неожиданный формат ответа: в ответе отсутствует массив «goods».')
  }

  return data.goods
}

/** Сервис возвращает одну «пустую» позицию, если деталь не найдена. */
export function isEmptyGoods(goods) {
  return (
    !Array.isArray(goods) ||
    goods.length === 0 ||
    (goods.length === 1 && !goods[0]?.brand && !goods[0]?.number)
  )
}

/** Предложения только с положительным остатком, отсортированные по цене. */
export function getOffers(goodsItem) {
  const warehouses = Array.isArray(goodsItem?.warehouses) ? goodsItem.warehouses : []

  return warehouses
    .map((warehouse, index) => ({
      id: warehouse.id || `${goodsItem?.goodsID || 'offer'}-${index}`,
      code: warehouse.code || 'Склад',
      price: toNumber(warehouse.price),
      stock: toNumber(warehouse.stock),
      own: Boolean(warehouse.own),
      notRefund: Boolean(warehouse.notRefund),
      shipmentDate: warehouse.shipmentDate || null,
    }))
    .filter((offer) => offer.stock > 0)
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity) || b.stock - a.stock)
}

function minPrice(offers) {
  const prices = offers.map((offer) => offer.price).filter((price) => price > 0)
  return prices.length ? Math.min(...prices) : null
}

/** Группирует товары по производителю для первого шага подбора. */
export function groupBrands(goods) {
  const groups = new Map()

  goods.forEach((item) => {
    if (!item?.brand || !item?.number) return

    const brand = String(item.brand).trim()
    const key = brand.toLocaleUpperCase('ru-RU')
    const offers = getOffers(item)
    const bestPrice = minPrice(offers)
    const stock = toNumber(item.count)

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        brand,
        numbers: [],
        count: 0,
        offersCount: 0,
        bestPrice: null,
      })
    }

    const group = groups.get(key)
    group.count += stock
    group.offersCount += offers.length

    if (bestPrice !== null && (group.bestPrice === null || bestPrice < group.bestPrice)) {
      group.bestPrice = bestPrice
    }

    if (!group.numbers.some((entry) => entry.number === item.number)) {
      group.numbers.push({
        number: item.number,
        name: item.name || '',
        count: stock,
        bestPrice,
      })
    }
  })

  return Array.from(groups.values()).sort(
    (a, b) => b.count - a.count || a.brand.localeCompare(b.brand, 'ru'),
  )
}

function toPosition(item, isOriginal) {
  const offers = getOffers(item)
  const warehouseStock = offers.reduce((sum, offer) => sum + offer.stock, 0)
  const stock = toNumber(item.count) || warehouseStock

  return {
    id: item.goodsID || `${item.brand || 'brand'}-${item.number || 'number'}`,
    brand: item.brand || 'Без производителя',
    number: item.number || '—',
    name: item.name || 'Без названия',
    isOriginal,
    notRefund: Boolean(item.notRefund),
    rate: toNumber(item.rate) || 1,
    offers,
    stock,
    bestPrice: minPrice(offers),
  }
}

/**
 * Собирает исходную позицию и её аналоги в единый список.
 * Дубликаты (например, исходный товар, повторно пришедший в analogues) убираются.
 */
export function buildPositions(goods) {
  const seen = new Set()
  const items = []

  const push = (item, isOriginal) => {
    if (!item || (!item.brand && !item.number)) return
    const dedupeKey = item.goodsID || `${item.brand}|${item.number}`
    if (seen.has(dedupeKey)) return
    seen.add(dedupeKey)
    items.push(toPosition(item, isOriginal))
  }

  goods.forEach((item) => {
    push(item, true)
    if (Array.isArray(item.analogues)) {
      item.analogues.forEach((analogue) => push(analogue, false))
    }
  })

  items.sort(
    (a, b) =>
      Number(b.stock > 0) - Number(a.stock > 0) ||
      Number(b.isOriginal) - Number(a.isOriginal) ||
      (a.bestPrice ?? Infinity) - (b.bestPrice ?? Infinity) ||
      a.brand.localeCompare(b.brand, 'ru'),
  )

  const prices = items.map((item) => item.bestPrice).filter((price) => price !== null)

  return {
    items,
    stats: {
      total: items.length,
      inStock: items.filter((item) => item.stock > 0).length,
      offers: items.reduce((sum, item) => sum + item.offers.length, 0),
      totalStock: items.reduce((sum, item) => sum + item.stock, 0),
      minPrice: prices.length ? Math.min(...prices) : null,
    },
  }
}

export async function fetchBrands({ number, key, signal }) {
  const goods = await requestGoods({ key, number, info: 'on' }, signal)
  if (isEmptyGoods(goods)) return []
  return groupBrands(goods)
}

export async function fetchAnalogues({ number, brand, key, signal }) {
  const goods = await requestGoods(
    { key, number, brand, analogues: 'on', info: 'on' },
    signal,
  )
  if (isEmptyGoods(goods)) return buildPositions([])
  return buildPositions(goods)
}
