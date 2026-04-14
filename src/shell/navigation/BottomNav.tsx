import { motion } from 'framer-motion'
import { CalcIcon, ClockIcon, ConvertIcon, NotesIcon } from '../../shared/ui/icons'
import type { TabKey } from '../types'
import { tabs } from '../types'

type BottomNavProps = {
  active: TabKey
  onChange: (tab: TabKey) => void
}

const indexByTab: Record<TabKey, number> = {
  convert: 0,
  calc: 1,
  notes: 2,
  clock: 3,
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <motion.div
        className="bottom-nav-indicator"
        animate={{ x: `${indexByTab[active] * 100}%` }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <span />
      </motion.div>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.key === 'convert' && <ConvertIcon active={isActive} className="tab-icon" />}
            {tab.key === 'calc' && <CalcIcon active={isActive} className="tab-icon" />}
            {tab.key === 'notes' && <NotesIcon active={isActive} className="tab-icon" />}
            {tab.key === 'clock' && <ClockIcon active={isActive} className="tab-icon" />}
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
