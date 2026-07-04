'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Textarea from '@/components/Textarea'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    assignedUser: [],
    relatedClient: [],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, clientsRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/clients'),
        fetch('/api/users'),
      ])
      setTasks(await tasksRes.json())
      setClients(await clientsRes.json())
      setUsers(await usersRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task)
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedUser: task.assignedUser,
        relatedClient: task.relatedClient,
      })
    } else {
      setEditingTask(null)
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
        assignedUser: [],
        relatedClient: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchData()
        handleCloseModal()
      }
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => {
        const colors = {
          'Low': 'bg-blue-900/30 text-blue-400',
          'Medium': 'bg-yellow-900/30 text-yellow-400',
          'High': 'bg-red-900/30 text-red-400',
        }
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[value] || 'bg-gray-900/30 text-gray-400'}`}>
            {value}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors = {
          'Pending': 'bg-yellow-900/30 text-yellow-400',
          'Done': 'bg-green-900/30 text-green-400',
        }
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[value] || 'bg-gray-900/30 text-gray-400'}`}>
            {value}
          </span>
        )
      },
    },
    { key: 'dueDate', label: 'Due Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, task) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(task)
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(task.id)
            }}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Manage your to-do list</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Add Task</Button>
      </div>

      <Table columns={columns} data={tasks} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Follow up with client"
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Task details..."
            rows={3}
          />

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Done', label: 'Done' },
              ]}
            />

            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned User"
              name="assignedUser"
              value={formData.assignedUser[0] || ''}
              onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value ? [e.target.value] : [] })}
              options={users.map(user => ({ value: user.id, label: user.name }))}
              placeholder="Select user"
            />

            <Select
              label="Related Client"
              name="relatedClient"
              value={formData.relatedClient[0] || ''}
              onChange={(e) => setFormData({ ...formData, relatedClient: e.target.value ? [e.target.value] : [] })}
              options={clients.map(client => ({ value: client.id, label: client.clientName }))}
              placeholder="Select client"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
