import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

const rows = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

type Operator = '+' | '−' | '×' | '÷' | null

export function CalcScreen() {
  const [display, setDisplay] = useState('0')
  const [left, setLeft] = useState<number | null>(null)
  const [op, setOp] = useState<Operator>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)

  const expression = useMemo(() => {
    if (left === null || op === null) return ''
    return `${left} ${op}`
  }, [left, op])

  function calc(a: number, b: number, operator: Exclude<Operator, null>) {
    if (operator === '+') return a + b
    if (operator === '−') return a - b
    if (operator === '×') return a * b
    if (operator === '÷') return b === 0 ? 0 : a / b
    return b
  }

  function onKey(key: string) {
    if (/^\d$/.test(key)) {
      setDisplay((value) => (value === '0' ? key : `${value}${key}`))
      return
    }

    if (key === '.') {
      setDisplay((value) => (value.includes('.') ? value : `${value}.`))
      return
    }

    if (key === 'AC') {
      setDisplay('0')
      setLeft(null)
      setOp(null)
      return
    }

    if (key === '+/-') {
      setDisplay((value) => (value.startsWith('-') ? value.slice(1) : `-${value}`))
      return
    }

    if (key === '%') {
      setDisplay((value) => String(Number(value) / 100))
      return
    }

    if (['+', '−', '×', '÷'].includes(key)) {
      setLeft(Number(display))
      setOp(key as Exclude<Operator, null>)
      setDisplay('0')
      return
    }

    if (key === '=' && left !== null && op) {
      const right = Number(display)
      const result = calc(left, right, op)
      setHistory((list) => [`${left} ${op} ${right} = ${result}`, ...list].slice(0, 8))
      setDisplay(String(result))
      setLeft(null)
      setOp(null)
    }
  }

  return (
    <section className="screen calc-screen">
      <div className="calc-display">
        <div className="expression">{history[0] ?? expression}</div>
        <div className="value">
          {display}
          <span className="cursor">|</span>
        </div>
      </div>

      <div className="calc-grid">
        {rows.map((row, rowIndex) =>
          row.map((key) => {
            const wide = rowIndex === 4 && key === '0'
            const functionKey = rowIndex === 0
            const equals = key === '='
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={`calc-key ${functionKey ? 'func' : ''} ${equals ? 'eq' : ''} ${wide ? 'wide' : ''}`}
              >
                {key}
              </button>
            )
          }),
        )}
      </div>

      <button className="ghost history-toggle" onClick={() => setHistoryOpen((open) => !open)}>
        HISTORY
      </button>

      <motion.div
        className={`history-sheet ${historyOpen ? 'open' : ''}`}
        initial={false}
        animate={{ y: historyOpen ? 0 : 190 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 190 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 60) setHistoryOpen(false)
          if (info.offset.y < -30) setHistoryOpen(true)
        }}
      >
        <span className="sheet-handle" />
        <h3>HISTORY</h3>
        {history.length === 0 && <p className="muted">No calculations yet</p>}
        {history.map((item) => (
          <div key={item} className="history-row">
            <span>{item}</span>
            <button
              className="ghost copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(item).catch(() => undefined)
              }}
            >
              ⧉
            </button>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
