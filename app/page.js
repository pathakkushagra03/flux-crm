'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/Card'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    clients: 0,
    deals: 0,
    tasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [users, companies, clients, deals, tasks] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/companies').then(r => r.json()),
        fetch('/api/clients').then(r => r.json()),
        fetch('/api/deals').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
      ])

      setStats({
        users: users?.length || 0,
        companies: companies?.length || 0,
        clients: clients?.length || 0,
        deals: deals?.length || 0,
        tasks: tasks?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Users', value: stats.users, href: '/users', color: 'border-blue-500' },
    { label: 'Companies', value: stats.companies, href: '/companies', color: 'border-purple-500' },
    { label: 'Clients', value: stats.clients, href: '/clients', color: 'border-green-500' },
    { label: 'Deals', value: stats.deals, href: '/deals', color: 'border-yellow-500' },
    { label: 'Tasks', value: stats.tasks, href: '/tasks', color: 'border-red-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to Flux CRM</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className={`border-l-4 ${stat.color}`}>
              <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-semibold mb-4">
            Dashboard Overview
          </h2>
          <p className="text-gray-400">
            Manage clients, companies, deals, and tasks from one premium CRM dashboard.
          </p>
        </Card>
      </div>

    </div>
  )
}
