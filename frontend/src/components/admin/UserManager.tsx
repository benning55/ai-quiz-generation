"use client"

import { useState, useEffect } from 'react'
import { Search, Edit2, Save, X, Crown, Calendar, Mail, UserCheck, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  id: number
  clerk_user_id: string
  email: string
  full_name: string | null
  has_active_payment: boolean
  member_tier: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

interface UserManagerProps {
  onStatsUpdate?: () => void
}

export default function UserManager({ onStatsUpdate }: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'paid'>('all')
  const itemsPerPage = 20

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search and tier
  useEffect(() => {
    let filtered = users

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.clerk_user_id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by tier
    if (filterTier !== 'all') {
      if (filterTier === 'paid') {
        filtered = filtered.filter(user => user.has_active_payment)
      } else {
        filtered = filtered.filter(user => !user.has_active_payment)
      }
    }

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [users, searchQuery, filterTier])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/users/`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users:', response.status)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditForm({
      has_active_payment: user.has_active_payment,
      member_tier: user.member_tier,
      expires_at: user.expires_at
    })
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditForm({})
  }

  const handleSave = async (userId: number) => {
    setIsSaving(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/users/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
        }
      )

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === userId ? updatedUser : u))
        setEditingUserId(null)
        setEditForm({})
        if (onStatsUpdate) onStatsUpdate()
      } else {
        console.error('Failed to update user:', response.status)
        alert('Failed to update user. Please try again.')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please check your connection.')
    } finally {
      setIsSaving(false)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <UserCheck className="w-6 h-6 mr-2 text-red-600" />
          User Management
        </h2>
        <Button
          onClick={fetchUsers}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by email, name, or Clerk ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value as any)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All Users</option>
          <option value="paid">Paid Users Only</option>
          <option value="free">Free Users Only</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Paid Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.has_active_payment).length}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Free Users</p>
          <p className="text-2xl font-bold text-gray-600">
            {users.filter(u => !u.has_active_payment).length}
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Info
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No users found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* User Info */}
                  <td className="px-4 py-4">
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 font-mono">{user.clerk_user_id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {editingUserId === user.id ? (
                      <select
                        value={editForm.has_active_payment ? 'true' : 'false'}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          has_active_payment: e.target.value === 'true'
                        })}
                        className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.has_active_payment
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.has_active_payment ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </span>
                    )}
                  </td>

                  {/* Tier */}
                  <td className="px-4 py-4">
                    {editingUserId === user.id ? (
                      <select
                        value={editForm.member_tier || user.member_tier || 'free'}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          member_tier: e.target.value
                        })}
                        className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option value="free">Free</option>
                        <option value="7_day_trial">7-Day Trial</option>
                        <option value="7_days">7 Days</option>
                        <option value="30_days">30 Days</option>
                        <option value="premium">Premium</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 capitalize">
                        {(user.member_tier || 'free').replace('_', ' ')}
                      </span>
                    )}
                  </td>

                  {/* Expires At */}
                  <td className="px-4 py-4">
                    {editingUserId === user.id ? (
                      <Input
                        type="datetime-local"
                        value={editForm.expires_at ? new Date(editForm.expires_at).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          expires_at: e.target.value ? new Date(e.target.value).toISOString() : null
                        })}
                        className="text-sm"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-900">{formatDate(user.expires_at)}</p>
                          {user.expires_at && isExpired(user.expires_at) && (
                            <p className="text-xs text-red-600 flex items-center mt-1">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Expired
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    {editingUserId === user.id ? (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSave(user.id)}
                          disabled={isSaving}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleEdit(user)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
