'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Textarea from '@/components/Textarea'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DealsPage() {
  const [deals, setDeals] = useState([])
  const [clients, setClients] = useState([])
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [formData, setFormData] = useState({
    dealName: '',
    client: [],
    company: [],
    dealValue: 0,
    stage: 'Lead',
    expectedCloseDate: '',
    assignedUser: [],
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [dealsRes, clientsRes, companiesRes, usersRes] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/clients'),
        fetch('/api/companies'),
        fetch('/api/users'),
      ])
      setDeals(await dealsRes.json())
      setClients(await clientsRes.json())
      setCompanies(await companiesRes.json())
      setUsers(await usersRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (deal = null) => {
    if (deal) {
      setEditingDeal(deal)
      setFormData({
        dealName: deal.dealName,
        client: deal.client,
        company: deal.company,
        dealValue: deal.dealValue,
        stage: deal.stage,
        expectedCloseDate: deal.expectedCloseDate,
        assignedUser: deal.assignedUser,
        notes: deal.notes,
      })
    } else {
      setEditingDeal(null)
      setFormData({
        dealName: '',
        client: [],
        company: [],
        dealValue: 0,
        stage: 'Lead',
        expectedCloseDate: '',
        assignedUser: [],
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDeal(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingDeal ? `/api/deals/${editingDeal.id}` : '/api/deals'
      const method = editingDeal ? 'PUT' : 'POST'

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
      console.error('Error saving deal:', error)
      alert('Failed to save deal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    try {
      const response = await fetch(`/api/deals/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert('Failed to delete deal')
    }
  }

  const columns = [
    { key: 'dealName', label: 'Deal Name' },
    {
      key: 'dealValue',
      label: 'Value',
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (value) => {
        const colors = {
          'Lead': 'bg-gray-700/30 text-gray-300',
          'Contacted': 'bg-blue-900/30 text-blue-400',
          'Proposal': 'bg-yellow-900/30 text-yellow-400',
          'Won': 'bg-green-900/30 text-green-400',
          'Lost': 'bg-red-900/30 text-red-400',
        }
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[value] || 'bg-gray-900/30 text-gray-400'}`}>
            {value}
          </span>
        )
      },
    },
    { key: 'expectedCloseDate', label: 'Expected Close' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, deal) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(deal)
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(deal.id)
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
          <h1 className="text-4xl font-bold text-white mb-2">Deals</h1>
          <p className="text-gray-400">Track your sales pipeline</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Add Deal</Button>
      </div>

      <Table columns={columns} data={deals} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDeal ? 'Edit Deal' : 'Add New Deal'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Deal Name"
            name="dealName"
            value={formData.dealName}
            onChange={(e) => setFormData({ ...formData, dealName: e.target.value })}
            required
            placeholder="Website Redesign Project"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deal Value ($)"
              name="dealValue"
              type="number"
              value={formData.dealValue}
              onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
              placeholder="5000"
            />

            <Select
              label="Stage"
              name="stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              required
              options={[
                { value: 'Lead', label: 'Lead' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Proposal', label: 'Proposal' },
                { value: 'Won', label: 'Won' },
                { value: 'Lost', label: 'Lost' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Client"
              name="client"
              value={formData.client[0] || ''}
              onChange={(e) => setFormData({ ...formData, client: e.target.value ? [e.target.value] : [] })}
              options={clients.map(client => ({ value: client.id, label: client.clientName }))}
              placeholder="Select client"
            />

            <Select
              label="Company"
              name="company"
              value={formData.company[0] || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value ? [e.target.value] : [] })}
              options={companies.map(company => ({ value: company.id, label: company.companyName }))}
              placeholder="Select company"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expected Close Date"
              name="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
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

          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about the deal..."
            rows={4}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingDeal ? 'Update Deal' : 'Create Deal'}
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
