'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/Button'
import Table from '@/components/Table'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import ImageUpload from '@/components/ImageUpload'
import LoadingSpinner from '@/components/LoadingSpinner'
import Select from '@/components/Select'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [formData, setFormData] = useState({
    companyName: '',
    photo: null,
    users: [],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [companiesRes, usersRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/users'),
      ])
      const companiesData = await companiesRes.json()
      const usersData = await usersRes.json()
      setCompanies(companiesData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingCompany(company)
      setFormData({
        companyName: company.companyName,
        photo: company.photo,
        users: company.users,
      })
    } else {
      setEditingCompany(null)
      setFormData({
        companyName: '',
        photo: null,
        users: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCompany(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies'
      const method = editingCompany ? 'PUT' : 'POST'

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
      console.error('Error saving company:', error)
      alert('Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this company?')) return

    try {
      const response = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company')
    }
  }

  const columns = [
    {
      key: 'photo',
      label: 'Logo',
      render: (value) => (
        <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden">
          {value ? (
            <img src={value} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              N/A
            </div>
          )}
        </div>
      ),
    },
    { key: 'companyName', label: 'Company Name' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, company) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(company)
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(company.id)
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
          <h1 className="text-4xl font-bold text-white mb-2">Companies</h1>
          <p className="text-gray-400">Manage company records</p>
        </div>
        <Button onClick={() => handleOpenModal()}>Add Company</Button>
      </div>

      <Table columns={columns} data={companies} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            label="Company Logo"
            currentImage={formData.photo}
            onImageSelect={(base64) => setFormData({ ...formData, photo: base64 })}
            onImageRemove={() => setFormData({ ...formData, photo: null })}
          />

          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
            placeholder="Acme Corporation"
          />

          <Select
            label="Primary User"
            name="users"
            value={formData.users[0] || ''}
            onChange={(e) => setFormData({ ...formData, users: e.target.value ? [e.target.value] : [] })}
            options={users.map(user => ({ value: user.id, label: user.name }))}
            placeholder="Select user"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingCompany ? 'Update Company' : 'Create Company'}
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
