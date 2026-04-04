import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  Users, Store, Image, TrendingUp, CheckCircle, XCircle,
  Clock, Eye, Mail, MessageSquare, RefreshCw, Send, Search, CalendarDays,
} from 'lucide-react'

const API = 'http://localhost:5001'

function useAdminFetch(path, token) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [path, token])

  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load }
}

function CountBadge({ count }) {
  if (!count) return null
  return (
    <span className={`ml-1.5 inline-flex items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold ${count > 9 ? 'h-4 px-1.5' : 'h-4 w-4'}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

const statusVariant = (s) =>
  ({ approved: 'default', pending: 'outline', rejected: 'destructive', suspended: 'secondary' }[s] ?? 'outline')

export default function AdminPage() {
  const { token } = useAuth()

  const { data: stats, loading: statsLoading, reload: reloadStats } = useAdminFetch('/api/admin/stats', token)
  const { data: users, loading: usersLoading, reload: reloadUsers } = useAdminFetch('/api/admin/users', token)
  const { data: pendingVendors, loading: vendorsLoading, reload: reloadVendors } = useAdminFetch('/api/vendors/admin/pending', token)
  const { data: allVendors, loading: allVendorsLoading, reload: reloadAllVendors } = useAdminFetch('/api/admin/vendors', token)
  const { data: bookings, loading: bookingsLoading, reload: reloadBookings } = useAdminFetch('/api/admin/bookings', token)
  const { data: supportMessages, loading: supportLoading, reload: reloadSupport } = useAdminFetch('/api/support', token)

  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)
  const [replyText, setReplyText] = useState({})
  const [confirm, setConfirm] = useState(null) // { title, description, confirmLabel, variant, onConfirm }

  // Users tab
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  // Support tab
  const [supportFilter, setSupportFilter] = useState('all')

  // All Vendors tab
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const authPatch = async (url, body) => {
    const res = await fetch(`${API}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || 'Action failed.')
    }
    return res.json()
  }

  const handleVendorStatus = async (vendorId, status) => {
    setActionLoading(`vendor-${vendorId}-${status}`)
    try {
      await authPatch(`/api/vendors/${vendorId}/status`, { status })
      showToast(`Vendor ${status}.`)
      reloadVendors()
      reloadAllVendors()
      reloadStats()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const confirmVendorAction = (vendor, status) => {
    if (status === 'approved') {
      handleVendorStatus(vendor.id, status)
      return
    }
    setConfirm({
      title: status === 'rejected' ? 'Reject Vendor?' : 'Suspend Vendor?',
      description: status === 'rejected'
        ? `This will reject "${vendor.business_name}". They will not appear on the marketplace.`
        : `This will suspend "${vendor.business_name}". They will be hidden from the marketplace.`,
      confirmLabel: status === 'rejected' ? 'Reject' : 'Suspend',
      variant: 'destructive',
      onConfirm: () => handleVendorStatus(vendor.id, status),
    })
  }

  const handleUserStatus = async (userId, is_active) => {
    setActionLoading(`user-${userId}`)
    try {
      await authPatch(`/api/admin/users/${userId}/status`, { is_active })
      showToast(`User ${is_active ? 'activated' : 'deactivated'}.`)
      reloadUsers()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const confirmUserStatus = (user) => {
    if (user.is_active) {
      setConfirm({
        title: 'Deactivate User?',
        description: `"${user.name}" will lose access to the platform immediately.`,
        confirmLabel: 'Deactivate',
        variant: 'destructive',
        onConfirm: () => handleUserStatus(user.id, false),
      })
    } else {
      handleUserStatus(user.id, true)
    }
  }

  const handleMarkRead = async (msgId) => {
    setActionLoading(`msg-${msgId}`)
    try {
      await authPatch(`/api/support/${msgId}/read`, {})
      showToast('Marked as read.')
      reloadSupport()
      reloadStats()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReply = async (msgId) => {
    const reply = replyText[msgId]?.trim()
    if (!reply) return
    setActionLoading(`reply-${msgId}`)
    try {
      const res = await fetch(`${API}/api/support/${msgId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ admin_reply: reply }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed.') }
      showToast('Reply sent.')
      setReplyText((prev) => ({ ...prev, [msgId]: '' }))
      reloadSupport()
      reloadStats() // reply marks as read server-side
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const reloadAll = () => {
    reloadStats(); reloadUsers(); reloadVendors(); reloadAllVendors(); reloadBookings(); reloadSupport()
  }

  // Derived / filtered data
  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = userSearch.toLowerCase()
    return users.filter(u => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
      return matchesSearch && matchesRole
    })
  }, [users, userSearch, userRoleFilter])

  const filteredSupport = useMemo(() => {
    if (!supportMessages) return []
    return supportFilter === 'unread' ? supportMessages.filter(m => !m.is_read) : supportMessages
  }, [supportMessages, supportFilter])

  const filteredAllVendors = useMemo(() => {
    if (!allVendors) return []
    return vendorStatusFilter === 'all' ? allVendors : allVendors.filter(v => v.status === vendorStatusFilter)
  }, [allVendors, vendorStatusFilter])

  const specializationStats = useMemo(() => {
    if (!allVendors) return []
    const counts = {}
    allVendors.forEach(v => {
      ;(v.specializations || []).filter(Boolean).forEach(s => {
        counts[s] = (counts[s] || 0) + 1
      })
    })
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }))
  }, [allVendors])

  const analyticsCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers?.toLocaleString() ?? '—', sub: 'Hosts & Vendors', icon: Users },
        { label: 'Active Vendors', value: stats.totalVendors ?? '—', sub: 'Approved & active', icon: Store },
        { label: 'Portfolio Photos', value: stats.totalPhotos?.toLocaleString() ?? '—', sub: 'Uploaded by vendors', icon: Image },
        { label: 'Total Bookings', value: stats.totalBookings ?? '—', sub: 'All bookings', icon: TrendingUp },
        { label: 'Pending Approvals', value: stats.pendingApprovals ?? '—', sub: 'Action required', icon: Clock, urgent: stats.pendingApprovals > 0 },
        { label: 'Unread Support', value: stats.unreadSupport ?? '—', sub: 'Messages', icon: MessageSquare, urgent: stats.unreadSupport > 0 },
      ]
    : []

  return (
    <div className="flex-1 bg-muted/30">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 border">
            <h3 className="font-semibold text-lg">{confirm.title}</h3>
            <p className="text-sm text-muted-foreground">{confirm.description}</p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button
                variant={confirm.variant || 'destructive'}
                onClick={() => { confirm.onConfirm(); setConfirm(null) }}
              >
                {confirm.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, vendors, and platform activity</p>
          </div>
          <Button variant="outline" size="sm" onClick={reloadAll} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {analyticsCards.map((card) => (
              <Card key={card.label} className={card.urgent ? 'border-2 border-destructive/50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-3xl font-bold">{card.value}</p>
                      <p className={`text-xs mt-1 ${card.urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {card.sub}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <card.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="flex w-full flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="vendors" className="flex-1">
              Vendor Approvals
              <CountBadge count={stats?.pendingApprovals} />
            </TabsTrigger>
            <TabsTrigger value="allvendors" className="flex-1">All Vendors</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />Bookings
            </TabsTrigger>
            <TabsTrigger value="support" className="flex-1">
              Support
              <CountBadge count={stats?.unreadSupport} />
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
          </TabsList>

          {/* ── Vendor Approvals ──────────────────────────────────────── */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Approval Queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vendorsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
                  </div>
                ) : pendingVendors?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No pending vendor applications.</p>
                  </div>
                ) : (
                  pendingVendors?.map((vendor) => (
                    <Card key={vendor.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{vendor.business_name}</h3>
                              <p className="text-sm text-muted-foreground">{vendor.location || 'Location not specified'}</p>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground">Name:</span><span className="ml-2">{vendor.name}</span></div>
                            <div><span className="text-muted-foreground">Email:</span><span className="ml-2">{vendor.email}</span></div>
                            <div><span className="text-muted-foreground">Phone:</span><span className="ml-2">{vendor.phone || '—'}</span></div>
                            <div><span className="text-muted-foreground">Submitted:</span><span className="ml-2">{new Date(vendor.submitted_at).toLocaleDateString()}</span></div>
                          </div>
                          {vendor.specializations?.filter(Boolean).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {vendor.specializations.filter(Boolean).map((spec) => (
                                <Badge key={spec} variant="secondary">{spec}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-2"
                              disabled={actionLoading === `vendor-${vendor.id}-approved`}
                              onClick={() => confirmVendorAction(vendor, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {actionLoading === `vendor-${vendor.id}-approved` ? 'Approving...' : 'Approve Vendor'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              disabled={actionLoading === `vendor-${vendor.id}-rejected`}
                              onClick={() => confirmVendorAction(vendor, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                              {actionLoading === `vendor-${vendor.id}-rejected` ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── All Vendors ───────────────────────────────────────────── */}
          <TabsContent value="allvendors">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle>All Vendors</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {['all', 'approved', 'pending', 'rejected', 'suspended'].map(s => (
                      <Button
                        key={s}
                        variant={vendorStatusFilter === s ? 'default' : 'outline'}
                        size="sm"
                        className="capitalize"
                        onClick={() => setVendorStatusFilter(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {allVendorsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : filteredAllVendors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No vendors found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.business_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{vendor.name}</TableCell>
                          <TableCell className="text-sm">{vendor.location || '—'}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(vendor.status)} className="capitalize">{vendor.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{vendor.rating ? `${vendor.rating} ★` : '—'}</TableCell>
                          <TableCell className="text-sm">{new Date(vendor.submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {vendor.status !== 'approved' && (
                                <Button
                                  variant="ghost" size="sm"
                                  className="text-primary hover:text-primary h-7 px-2"
                                  disabled={!!actionLoading}
                                  onClick={() => confirmVendorAction(vendor, 'approved')}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                </Button>
                              )}
                              {vendor.status === 'approved' && (
                                <Button
                                  variant="ghost" size="sm"
                                  className="text-destructive hover:text-destructive h-7 px-2"
                                  disabled={!!actionLoading}
                                  onClick={() => confirmVendorAction(vendor, 'suspended')}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />Suspend
                                </Button>
                              )}
                              {vendor.status === 'pending' && (
                                <Button
                                  variant="ghost" size="sm"
                                  className="text-destructive hover:text-destructive h-7 px-2"
                                  disabled={!!actionLoading}
                                  onClick={() => confirmVendorAction(vendor, 'rejected')}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Users ─────────────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name or email..."
                      className="pl-9"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-1">
                    {['all', 'client', 'vendor', 'admin'].map(r => (
                      <Button
                        key={r}
                        variant={userRoleFilter === r ? 'default' : 'outline'}
                        size="sm"
                        className="capitalize"
                        onClick={() => setUserRoleFilter(r)}
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No users match your filters.
                            </TableCell>
                          </TableRow>
                        ) : filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : user.role === 'vendor' ? 'secondary' : 'outline'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {user.role !== 'admin' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={actionLoading === `user-${user.id}`}
                                  onClick={() => confirmUserStatus(user)}
                                  className={user.is_active ? 'text-destructive hover:text-destructive' : 'text-primary hover:text-primary'}
                                >
                                  {actionLoading === `user-${user.id}` ? '...' : user.is_active ? (
                                    <><XCircle className="h-4 w-4 mr-1" />Deactivate</>
                                  ) : (
                                    <><CheckCircle className="h-4 w-4 mr-1" />Activate</>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Bookings ──────────────────────────────────────────────── */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : bookings?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No bookings yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Host</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Booked On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div className="font-medium">{b.host_name}</div>
                            <div className="text-xs text-muted-foreground">{b.host_email}</div>
                          </TableCell>
                          <TableCell className="font-medium">{b.business_name}</TableCell>
                          <TableCell className="text-sm">
                            {b.event_date ? new Date(b.event_date).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'outline'}
                              className="capitalize"
                            >
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.budget ? `NPR ${Number(b.budget).toLocaleString()}` : '—'}
                          </TableCell>
                          <TableCell className="text-sm">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Support ───────────────────────────────────────────────── */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Support Messages</CardTitle>
                  <div className="flex gap-1">
                    {['all', 'unread'].map(f => (
                      <Button
                        key={f}
                        variant={supportFilter === f ? 'default' : 'outline'}
                        size="sm"
                        className="capitalize"
                        onClick={() => setSupportFilter(f)}
                      >
                        {f}{f === 'unread' && stats?.unreadSupport > 0 ? ` (${stats.unreadSupport})` : ''}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
                  </div>
                ) : filteredSupport.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>{supportFilter === 'unread' ? 'No unread messages.' : 'No support messages yet.'}</p>
                  </div>
                ) : (
                  filteredSupport.map((msg) => (
                    <Card key={msg.id} className={`border ${!msg.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <CardContent className="pt-4 pb-4 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold">{msg.name}</span>
                          <span className="text-sm text-muted-foreground">{msg.email}</span>
                          {!msg.is_read && <Badge variant="default" className="text-[10px]">Unread</Badge>}
                          {msg.admin_reply && <Badge variant="secondary" className="text-[10px]">Replied</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
                        {msg.admin_reply && (
                          <div className="bg-muted rounded-lg px-4 py-3 border-l-4 border-primary">
                            <p className="text-xs font-semibold text-primary mb-1">Admin Reply</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{msg.admin_reply}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <input
                            className="flex-1 text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder={msg.admin_reply ? 'Update reply...' : 'Write a reply...'}
                            value={replyText[msg.id] || ''}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(msg.id) } }}
                          />
                          <Button
                            size="sm"
                            className="gap-2 shrink-0"
                            disabled={!replyText[msg.id]?.trim() || actionLoading === `reply-${msg.id}`}
                            onClick={() => handleReply(msg.id)}
                          >
                            <Send className="h-4 w-4" />
                            {actionLoading === `reply-${msg.id}` ? 'Sending...' : 'Reply'}
                          </Button>
                          {!msg.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 bg-transparent shrink-0"
                              disabled={actionLoading === `msg-${msg.id}`}
                              onClick={() => handleMarkRead(msg.id)}
                            >
                              <Eye className="h-4 w-4" />
                              {actionLoading === `msg-${msg.id}` ? '...' : 'Read'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Analytics ─────────────────────────────────────────────── */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="h-40 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: 'Total Users (non-admin)', value: stats?.totalUsers },
                        { label: 'Approved Vendors', value: stats?.totalVendors },
                        { label: 'Portfolio Photos Uploaded', value: stats?.totalPhotos },
                        { label: 'Total Bookings', value: stats?.totalBookings },
                        { label: 'Pending Vendor Approvals', value: stats?.pendingApprovals, urgent: stats?.pendingApprovals > 0 },
                        { label: 'Unread Support Messages', value: stats?.unreadSupport, urgent: stats?.unreadSupport > 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className={`text-sm ${item.urgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            {item.label}
                          </span>
                          <span className={`text-lg font-bold ${item.urgent ? 'text-destructive' : ''}`}>
                            {item.value ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Vendor Specializations</CardTitle></CardHeader>
                <CardContent>
                  {allVendorsLoading ? (
                    <div className="h-40 bg-muted animate-pulse rounded" />
                  ) : specializationStats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No specialization data available.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {specializationStats.map((item) => (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground">
                              {item.count} vendor{item.count !== 1 ? 's' : ''} · {item.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
