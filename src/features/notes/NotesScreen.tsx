import { load } from '@tauri-apps/plugin-store'
import { useEffect, useMemo, useRef, useState } from 'react'

type Note = {
  id: string
  title: string
  body: string
  updatedAt: number
  accent: string
  pinned: boolean
}

const palette = ['#00FFB2', '#7B5CFA', '#FF4D6D', '#FFC14D']
const storagePath = 'notes.store.json'
const storageKey = 'convertor.notes'

function formatStamp(timestamp: number) {
  return new Date(timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [contextId, setContextId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const pressTimerRef = useRef<number | null>(null)

  const editing = useMemo(() => notes.find((note) => note.id === editingId) ?? null, [editingId, notes])
  const orderedNotes = useMemo(
    () => [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt),
    [notes],
  )

  useEffect(() => {
    let alive = true

    async function hydrate() {
      try {
        const store = await load(storagePath, { autoSave: true, defaults: {} })
        const saved = await store.get<Note[]>('notes')
        if (alive && Array.isArray(saved)) {
          setNotes(saved)
        }
      } catch {
        const local = localStorage.getItem(storageKey)
        if (alive && local) {
          try {
            const parsed = JSON.parse(local) as Note[]
            if (Array.isArray(parsed)) {
              setNotes(parsed)
            }
          } catch {
            setNotes([])
          }
        }
      } finally {
        if (alive) setHydrated(true)
      }
    }

    hydrate()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    setSaving(true)
    const id = window.setTimeout(async () => {
      try {
        const store = await load(storagePath, { autoSave: true, defaults: {} })
        await store.set('notes', notes)
        await store.save()
      } catch {
        localStorage.setItem(storageKey, JSON.stringify(notes))
      } finally {
        setSaving(false)
      }
    }, 180)
    return () => window.clearTimeout(id)
  }, [notes, hydrated])

  function createNote() {
    const id = crypto.randomUUID()
    const next: Note = {
      id,
      title: 'Untitled',
      body: '',
      updatedAt: Date.now(),
      accent: palette[Math.floor(Math.random() * palette.length)],
      pinned: false,
    }
    setNotes((list) => [next, ...list])
    setEditingId(id)
  }

  function updateNote(partial: Partial<Note>) {
    if (!editingId) return
    setNotes((list) =>
      list.map((note) =>
        note.id === editingId
          ? {
              ...note,
              ...partial,
              updatedAt: Date.now(),
            }
          : note,
      ),
    )
  }

  function deleteNote(id: string) {
    setNotes((list) => list.filter((note) => note.id !== id))
    if (editingId === id) setEditingId(null)
    if (contextId === id) setContextId(null)
  }

  function togglePin(id: string) {
    setNotes((list) =>
      list.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: Date.now(),
            }
          : note,
      ),
    )
    setContextId(null)
  }

  function onPressStart(id: string) {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current)
    }
    pressTimerRef.current = window.setTimeout(() => {
      setContextId(id)
    }, 360)
  }

  function onPressEnd() {
    if (!pressTimerRef.current) return
    window.clearTimeout(pressTimerRef.current)
    pressTimerRef.current = null
  }

  if (editing) {
    return (
      <section className="screen notes-editor">
        <header className="notes-header">
          <button className="ghost" onClick={() => setEditingId(null)}>
            ←
          </button>
          <button className="ghost" onClick={() => deleteNote(editing.id)}>
            ⌫
          </button>
        </header>

        <input
          value={editing.title}
          onChange={(event) => updateNote({ title: event.target.value || 'Untitled' })}
          className="notes-title"
        />
        <textarea
          value={editing.body}
          onChange={(event) => updateNote({ body: event.target.value })}
          className="notes-body allow-select"
          placeholder="Write your note"
        />
        <div className="notes-footer">
          <span>{editing.body.length} chars</span>
          <span className={`save-dot ${saving ? 'saving' : ''}`} />
        </div>
      </section>
    )
  }

  return (
    <section className="screen notes-screen">
      <header className="notes-header">
        <h2>NOTES</h2>
        <button className="primary round" onClick={createNote}>
          +
        </button>
      </header>

      <div className="notes-list">
        {notes.length === 0 && <p className="muted">No notes yet</p>}
        {orderedNotes.map((note) => (
          <div key={note.id} className="note-shell">
            <button
              className="note-card"
              onPointerDown={() => onPressStart(note.id)}
              onPointerUp={onPressEnd}
              onPointerCancel={onPressEnd}
              onPointerLeave={onPressEnd}
              onClick={() => setEditingId(note.id)}
            >
              <span className="accent" style={{ backgroundColor: note.accent }} />
              <div className="note-content">
                <h3>
                  {note.title}
                  {note.pinned ? ' • PINNED' : ''}
                </h3>
                <p>{note.body.slice(0, 96) || 'Empty note'}</p>
              </div>
              <span className="stamp">{formatStamp(note.updatedAt)}</span>
            </button>
            <div className={`note-actions ${contextId === note.id ? 'show' : ''}`}>
              <button className="ghost" onClick={() => togglePin(note.id)}>
                {note.pinned ? 'UNPIN' : 'PIN'}
              </button>
              <button className="ghost" onClick={() => deleteNote(note.id)}>
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
