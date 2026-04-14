import { motion } from 'framer-motion'

export function SplashScreen() {
  return (
    <motion.section
      className="splash"
      initial={{ y: 0, opacity: 1 }}
      exit={{ y: -36, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1>convertor</h1>
      <motion.div
        className="splash-rule"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      />
      <p>SMART UTILITY TOOLKIT</p>
    </motion.section>
  )
}
