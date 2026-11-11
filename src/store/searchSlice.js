import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { DEFAULT_API_KEY, fetchAnalogues, fetchBrands } from '../api/wsprice'

const STORAGE_KEY = 'wsprice.apiKey'

function getStoredApiKey() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_API_KEY
  } catch {
    return DEFAULT_API_KEY
  }
}

export const searchBrands = createAsyncThunk(
  'search/searchBrands',
  async ({ number, key }, { signal, rejectWithValue }) => {
    try {
      const brands = await fetchBrands({ number, key, signal })
      return { number, brands }
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      return rejectWithValue(error?.message || 'Не удалось выполнить поиск производителей.')
    }
  },
)

export const searchOffers = createAsyncThunk(
  'search/searchOffers',
  async ({ number, brand, key }, { signal, rejectWithValue }) => {
    try {
      const result = await fetchAnalogues({ number, brand, key, signal })
      return { number, brand, ...result }
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      return rejectWithValue(error?.message || 'Не удалось получить аналоги и предложения.')
    }
  },
)

const emptyBrands = { status: 'idle', items: [], error: null, requestId: null }
const emptyOffers = {
  status: 'idle',
  items: [],
  stats: null,
  error: null,
  requestId: null,
}

const initialState = {
  apiKey: getStoredApiKey(),
  query: { number: '', brand: null },
  brands: { ...emptyBrands },
  offers: { ...emptyOffers },
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setApiKey(state, action) {
      state.apiKey = action.payload
    },
    clearBrand(state) {
      state.query.brand = null
      state.offers = { ...emptyOffers }
    },
    resetSearch(state) {
      state.query = { number: '', brand: null }
      state.brands = { ...emptyBrands }
      state.offers = { ...emptyOffers }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state, action) => {
        state.query.number = action.meta.arg.number
        state.query.brand = null
        state.brands = {
          status: 'loading',
          items: [],
          error: null,
          requestId: action.meta.requestId,
        }
        state.offers = { ...emptyOffers }
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return
        state.brands.status = 'success'
        state.brands.items = action.payload.brands
        state.brands.error = null
      })
      .addCase(searchBrands.rejected, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return
        if (action.meta.aborted) return
        state.brands.status = 'error'
        state.brands.error = action.payload || action.error?.message || 'Неизвестная ошибка.'
      })
      .addCase(searchOffers.pending, (state, action) => {
        state.query.brand = action.meta.arg.brand
        state.offers = {
          status: 'loading',
          items: [],
          stats: null,
          error: null,
          requestId: action.meta.requestId,
        }
      })
      .addCase(searchOffers.fulfilled, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return
        state.offers.status = 'success'
        state.offers.items = action.payload.items
        state.offers.stats = action.payload.stats
        state.offers.error = null
      })
      .addCase(searchOffers.rejected, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return
        if (action.meta.aborted) return
        state.offers.status = 'error'
        state.offers.error = action.payload || action.error?.message || 'Неизвестная ошибка.'
      })
  },
})

export const { setApiKey, clearBrand, resetSearch } = searchSlice.actions
export default searchSlice.reducer
