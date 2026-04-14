import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CalcScreen } from './features/calc/CalcScreen'
import { ClockScreen } from './features/clock/ClockScreen'
import { ConvertScreen } from './features/convert/ConvertScreen'
import { NotesScreen } from './features/notes/NotesScreen'
import { BottomNav } from './shell/navigation/BottomNav'
import { SplashScreen } from './shell/SplashScreen'
import type { TabKey } from './shell/types'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('convert')
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const id = window.setTimeout(() => setShowSplash(false), 1500)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <main className="app-frame">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="screen-wrap"
          >
            {activeTab === 'convert' && <ConvertScreen />}
            {activeTab === 'calc' && <CalcScreen />}
            {activeTab === 'notes' && <NotesScreen />}
            {activeTab === 'clock' && <ClockScreen />}
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && <BottomNav active={activeTab} onChange={setActiveTab} />}
    </main>
  )
}

export default App
