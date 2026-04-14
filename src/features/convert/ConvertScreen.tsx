import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { useEffect, useMemo, useState } from 'react'

type Category = 'LENGTH' | 'WEIGHT' | 'TEMP' | 'VOLUME' | 'SPEED' | 'CURRENCY'

const categories: Category[] = ['LENGTH', 'WEIGHT', 'TEMP', 'VOLUME', 'SPEED', 'CURRENCY']

const unitsByCategory: Record<Category, { code: string; label: string }[]> = {
  LENGTH: [
    { code: 'm', label: 'Meters' },
    { code: 'km', label: 'Kilometers' },
    { code: 'ft', label: 'Feet' },
  ],
  WEIGHT: [
    { code: 'kg', label: 'Kilograms' },
    { code: 'g', label: 'Grams' },
    { code: 'lb', label: 'Pounds' },
  ],
  TEMP: [
    { code: 'c', label: 'Celsius' },
    { code: 'f', label: 'Fahrenheit' },
    { code: 'k', label: 'Kelvin' },
  ],
  VOLUME: [
    { code: 'l', label: 'Liters' },
    { code: 'ml', label: 'Milliliters' },
    { code: 'gal', label: 'Gallons' },
  ],
  SPEED: [
    { code: 'mps', label: 'Meters/sec' },
    { code: 'kph', label: 'Km/hour' },
    { code: 'mph', label: 'Miles/hour' },
  ],
  CURRENCY: [
    { code: 'USD', label: 'US Dollar' },
    { code: 'EUR', label: 'Euro' },
    { code: 'NGN', label: 'Naira' },
    { code: 'GBP', label: 'Pound Sterling' },
    { code: 'JPY', label: 'Japanese Yen' },
  ],
}

const fallbackCurrencyRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  NGN: 1580,
  GBP: 0.78,
  JPY: 151.4,
}

const currencyFlags: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  NGN: '🇳🇬',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
}

const currencyCacheKey = 'convertor.currency.cache'

function convertValue(category: Category, value: number, from: string, to: string) {
  if (Number.isNaN(value)) return 0
  if (from === to) return value

  if (category === 'LENGTH') {
    const base: Record<string, number> = { m: 1, km: 1000, ft: 0.3048 }
    return (value * base[from]) / base[to]
  }
  if (category === 'WEIGHT') {
    const base: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237 }
    return (value * base[from]) / base[to]
  }
  if (category === 'VOLUME') {
    const base: Record<string, number> = { l: 1, ml: 0.001, gal: 3.785411784 }
    return (value * base[from]) / base[to]
  }
  if (category === 'SPEED') {
    const base: Record<string, number> = { mps: 1, kph: 0.2777777778, mph: 0.44704 }
    return (value * base[from]) / base[to]
  }
  if (category === 'TEMP') {
    if (from === 'c' && to === 'f') return value * (9 / 5) + 32
    if (from === 'f' && to === 'c') return (value - 32) * (5 / 9)
    if (from === 'c' && to === 'k') return value + 273.15
    if (from === 'k' && to === 'c') return value - 273.15
    if (from === 'f' && to === 'k') return (value - 32) * (5 / 9) + 273.15
    if (from === 'k' && to === 'f') return (value - 273.15) * (9 / 5) + 32
  }
  if (category === 'CURRENCY') {
    return (value / fallbackCurrencyRates[from]) * fallbackCurrencyRates[to]
  }

  return value
}

const keypad = ['7', '8', '9', '⌫', '4', '5', '6', '.', '1', '2', '3', 'C', '00', '0', '+/-', '=']

export function ConvertScreen() {
  const [category, setCategory] = useState<Category>('LENGTH')
  const [fromUnit, setFromUnit] = useState(unitsByCategory.LENGTH[0].code)
  const [toUnit, setToUnit] = useState(unitsByCategory.LENGTH[1].code)
  const [value, setValue] = useState('1')
  const [currencyRates, setCurrencyRates] = useState<Record<string, number>>(fallbackCurrencyRates)
  const [updatedAt, setUpdatedAt] = useState<string>('local cache')
  const [syncing, setSyncing] = useState(false)
  const [pickerSide, setPickerSide] = useState<'from' | 'to' | null>(null)

  const activeUnits = unitsByCategory[category]
  const parsed = Number(value || 0)
  const converted = useMemo(
    () =>
      category === 'CURRENCY'
        ? (parsed / currencyRates[fromUnit]) * currencyRates[toUnit]
        : convertValue(category, parsed, fromUnit, toUnit),
    [category, parsed, fromUnit, toUnit, currencyRates],
  )

  useEffect(() => {
    const cached = localStorage.getItem(currencyCacheKey)
    if (!cached) return
    try {
      const parsedCache = JSON.parse(cached) as { rates: Record<string, number>; updatedAt: string }
      if (parsedCache?.rates && parsedCache?.updatedAt) {
        setCurrencyRates((current) => ({ ...current, ...parsedCache.rates }))
        setUpdatedAt(parsedCache.updatedAt)
      }
    } catch {
      setCurrencyRates(fallbackCurrencyRates)
    }
  }, [])

  useEffect(() => {
    let alive = true

    async function syncCurrency() {
      setSyncing(true)
      try {
        const endpoint =
          'https://api.exchangerate.host/latest?base=USD&symbols=USD,EUR,NGN,GBP,JPY'
        const response = await tauriFetch(endpoint, { connectTimeout: 8000 }).catch(() => fetch(endpoint))
        const payload = (await response.json()) as { rates?: Record<string, number> }
        if (!alive || !payload.rates) return
        const merged = { ...fallbackCurrencyRates, ...payload.rates }
        const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setCurrencyRates(merged)
        setUpdatedAt(stamp)
        localStorage.setItem(currencyCacheKey, JSON.stringify({ rates: merged, updatedAt: stamp }))
      } catch {
        if (!alive) return
      } finally {
        if (alive) setSyncing(false)
      }
    }

    syncCurrency()
    return () => {
      alive = false
    }
  }, [])

  function onCategoryChange(next: Category) {
    setCategory(next)
    setFromUnit(unitsByCategory[next][0].code)
    setToUnit(unitsByCategory[next][1].code)
    setValue('1')

  }

  function chooseUnit(unit: string) {
    if (pickerSide === 'from') setFromUnit(unit)
    if (pickerSide === 'to') setToUnit(unit)
    setPickerSide(null)
  }

  function swapUnits() {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  function onKey(key: string) {
    if (key === 'C') {
      setValue('0')
      return
    }
    if (key === '⌫') {
      setValue((current) => (current.length <= 1 ? '0' : current.slice(0, -1)))
      return
    }
    if (key === '+/-') {
      setValue((current) => {
        if (current === '0') return current
        return current.startsWith('-') ? current.slice(1) : `-${current}`
      })
      return
    }
    if (key === '=') return
    if (key === '.') {
      setValue((current) => (current.includes('.') ? current : `${current}.`))
      return
    }
    setValue((current) => (current === '0' ? key : `${current}${key}`))
  }

  return (
    <section className="screen convert-screen">
      <div className="category-row">
        {categories.map((item) => (
          <button
            key={item}
            className={`pill ${item === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="panel-stack">
        <div className="panel active">
          <button className="unit-toggle" onClick={() => setPickerSide('from')}>
            {category === 'CURRENCY' ? `${currencyFlags[fromUnit]} ${fromUnit}` : fromUnit} <span>⌄</span>
          </button>
          <div className="panel-value">{value}</div>
          <p>{activeUnits.find((unit) => unit.code === fromUnit)?.label}</p>
        </div>

        <button className="swap-button" onClick={swapUnits}>
          ↕
        </button>

        <div className="panel">
          <button className="unit-toggle" onClick={() => setPickerSide('to')}>
            {category === 'CURRENCY' ? `${currencyFlags[toUnit]} ${toUnit}` : toUnit} <span>⌄</span>
          </button>
          <div className="panel-value">{converted.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
          <p>{activeUnits.find((unit) => unit.code === toUnit)?.label}</p>
        </div>
      </div>

      {category === 'CURRENCY' && (
        <p className="muted meta">Last updated: {updatedAt}{syncing ? ' · syncing' : ''}</p>
      )}

      <div className="keypad-grid">
        {keypad.map((key) => (
          <button key={key} className={`key ${key === '=' ? 'eq' : ''}`} onClick={() => onKey(key)}>
            {key}
          </button>
        ))}
      </div>

      {pickerSide && (
        <div className="sheet-backdrop" onClick={() => setPickerSide(null)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <h3>SELECT UNIT</h3>
            <div className="sheet-list">
              {activeUnits.map((unit) => (
                <button key={unit.code} className="sheet-row" onClick={() => chooseUnit(unit.code)}>
                  <span>{category === 'CURRENCY' ? `${currencyFlags[unit.code]} ${unit.code}` : unit.code}</span>
                  <span className="muted">{unit.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {syncing && <span className="top-progress" />}
    </section>
  )
}
