export type TabKey = 'convert' | 'calc' | 'notes' | 'clock'

export type TabItem = {
  key: TabKey
  label: string
}

export const tabs: TabItem[] = [
  { key: 'convert', label: 'CONVERT' },
  { key: 'calc', label: 'CALC' },
  { key: 'notes', label: 'NOTES' },
  { key: 'clock', label: 'CLOCK' },
]
