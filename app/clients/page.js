'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Textarea from '@/components/Textarea'
import ImageUpload from '@/components/ImageUpload'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    company: [],
    assignedUser: [],
    profilePhoto: null,
    status: 'New',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsRes, companiesRes, usersRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/companies'),
        fetch('/api/users'),
      ])
      const clientsData = await clientsRes.json()
      const companiesData = await companiesRes.json()
      const usersData = await usersRes.json()
      setClients(clientsData)
      setCompanies(companiesData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        clientName: client.clientName,
        email: client.email,
        phone: client.phone,
        company: client.company,
        assignedUser: client.assignedUser,
        profilePhoto: client.profilePhoto,
        status: client.status,
        notes: client.notes,
      })
    } else {
      setEditingClient(null)
      setFormData({
        clientName: '',
        email: '',
        phone: '',
        company: [],
        assignedUser: [],
        profilePhoto: null,
        status: 'New',
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'
      const method = editingClient ? 'PUT' : 'POST'

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
      console.error('Error saving client:', error)
      alert('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const response = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  const columns = [
    {
      key: 'profilePhoto',
      label: 'Photo',
      render: (value) => (
        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
          {value ? (
            <img src={value} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      ),
    },
    { key: 'clientName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors = {
          'New': 'bg-blue-900/30 text-blue-400',
          'Active': 'bg-green-900/30 text-green-400',
          'Inactive': 'bg-red-900/30 text-red-400',
        }
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[value] || 'bg-gray-900/30 text-gray-400'}`}>
            {value}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, client) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(client)
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(client.id)
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
          <h1 className="text-4xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">Manage client relationships</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Add Client</Button>
      </div>

      <Table columns={columns} data={clients} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            label="Profile Photo"
            currentImage={formData.profilePhoto}
            onImageSelect={(base64) => setFormData({ ...formData, profilePhoto: base64 })}
            onImageRemove={() => setFormData({ ...formData, profilePhoto: null })}
          />

          <Input
            label="Client Name"
            name="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
            placeholder="John Smith"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />

            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Company"
              name="company"
              value={formData.company[0] || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value ? [e.target.value] : [] })}
              options={companies.map(company => ({ value: company.id, label: company.companyName }))}
              placeholder="Select company"
            />

            <Select
              label="Assigned User"
              name="assignedUser"
              value={formData.assignedUser[0] || ''}
              onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value ? [e.target.value] : [] })}
              options={users.map(user => ({ value: user.id, label: user.name }))}
              placeholder="Select user"
            />
          </div>

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
            options={[
              { value: 'New', label: 'New' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about the client..."
            rows={4}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
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
