import React, { useEffect, useState } from 'react'
import axios from 'axios'

function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  return (
    <form
      className="task-form"
      onSubmit={async (e) => {
        e.preventDefault()
        const { data } = await axios.post('/api/tasks', { title, description })
        setTitle('')
        setDescription('')
        onCreate?.(data)
      }}
    >
      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}

function TaskRow({ task, onChange, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')

  async function save() {
    const { data } = await axios.patch(`/api/tasks/${task.id}`, { title, description })
    onChange?.(data)
    setEditing(false)
  }

  async function remove() {
    await axios.delete(`/api/tasks/${task.id}`)
    onDelete?.(task.id)
  }

  return (
    <div className="task-card">
      {editing ? (
        <div className="task-editing">
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
          <button onClick={save}>Save</button>
          <button
            onClick={() => {
              setEditing(false)
              setTitle(task.title)
              setDescription(task.description || '')
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="task-row">
          <div className="task-info">
            <span className="task-title">{task.title}</span>
            <span className="task-desc">{task.description}</span>
          </div>
          <div>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={remove}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState([])

  async function load() {
    const { data } = await axios.get('/api/tasks')
    setTasks(data)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="app-container">
      <h1>📝 Task Manager</h1>
      <TaskForm onCreate={(t) => setTasks([t, ...tasks])} />
      {tasks.length === 0 ? (
        <p className="empty-text">No tasks yet — add one above!</p>
      ) : (
        tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onChange={(nt) => setTasks(tasks.map((x) => (x.id === nt.id ? nt : x)))}
            onDelete={(id) => setTasks(tasks.filter((x) => x.id !== id))}
          />
        ))
      )}
    </div>
  )
}
