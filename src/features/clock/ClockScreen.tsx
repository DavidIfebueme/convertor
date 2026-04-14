import { useEffect, useMemo, useState } from 'react'

const presets = ['UTC', 'Europe/London', 'Africa/Lagos', 'America/New_York', 'Asia/Tokyo']

function formatTime(date: Date, zone?: string) {
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: zone,
  }).format(date)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatOffset(zone: string) {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  })
  const parts = formatter.formatToParts(now)
  return parts.find((part) => part.type === 'timeZoneName')?.value ?? 'UTC'
}

export function ClockScreen() {
  const [now, setNow] = useState(new Date())
  const [zones, setZones] = useState(['Africa/Lagos', 'Europe/London'])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hour = now.getHours() % 12
  const minute = now.getMinutes()
  const second = now.getSeconds()

  const handStyle = useMemo(
    () => ({
      hour: { transform: `rotate(${hour * 30 + minute * 0.5}deg)` },
      minute: { transform: `rotate(${minute * 6}deg)` },
      second: { transform: `rotate(${second * 6}deg)` },
    }),
    [hour, minute, second],
  )

  const filteredPresets = useMemo(
    () => presets.filter((zone) => !zones.includes(zone) && zone.toLowerCase().includes(query.toLowerCase())),
    [zones, query],
  )

  function addZone(zone: string) {
    if (zones.includes(zone)) return
    setZones((list) => [...list, zone])
    setPickerOpen(false)
    setQuery('')
  }

  return (
    <section className="screen clock-screen">
      <div className="analog">
        <div className="ring" />
        <div className="ticks">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className={`tick ${index % 3 === 0 ? 'major' : ''}`}
              style={{ transform: `rotate(${index * 30}deg)` }}
            />
          ))}
        </div>
        <div className="hand hour" style={handStyle.hour} />
        <div className="hand minute" style={handStyle.minute} />
        <div className="hand second" style={handStyle.second} />
        <div className="center-dot" />
      </div>

      <div className="clock-digital">
        <strong>{formatTime(now)}</strong>
        <span>{formatDate(now)}</span>
      </div>

      <header className="world-title-row">
        <p>WORLD CLOCKS</p>
        <button className="ghost" onClick={() => setPickerOpen(true)}>
          +
        </button>
      </header>

      <div className="world-list">
        {zones.map((zone) => (
          <div className="world-row" key={zone}>
            <span className="globe-glyph">◌</span>
            <span>{zone.split('/').pop()?.replace('_', ' ')}</span>
            <span className="offset-pill">{formatOffset(zone)}</span>
            <strong>{formatTime(now, zone)}</strong>
          </div>
        ))}
      </div>

      {pickerOpen && (
        <div className="sheet-backdrop" onClick={() => setPickerOpen(false)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <h3>ADD TIMEZONE</h3>
            <input
              className="sheet-search allow-select"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city"
            />
            <div className="sheet-list">
              {filteredPresets.length === 0 && <p className="muted">No matches</p>}
              {filteredPresets.map((zone) => (
                <button key={zone} className="sheet-row" onClick={() => addZone(zone)}>
                  <span>{zone.split('/').pop()?.replace('_', ' ')}</span>
                  <span className="muted">{formatOffset(zone)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
