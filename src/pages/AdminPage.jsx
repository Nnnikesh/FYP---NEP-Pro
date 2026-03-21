import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  Users, Store, Image, TrendingUp, CheckCircle, XCircle,
  Clock, Eye, Mail, MessageSquare, RefreshCw, Send,
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

export default function AdminPage() {
  const { token } = useAuth()

  const { data: stats, loading: statsLoading, reload: reloadStats } = useAdminFetch('/api/admin/stats', token)
  const { data: users, loading: usersLoading, reload: reloadUsers } = useAdminFetch('/api/admin/users', token)
  const { data: pendingVendors, loading: vendorsLoading, reload: reloadVendors } = useAdminFetch('/api/vendors/admin/pending', token)
  const { data: supportMessages, loading: supportLoading, reload: reloadSupport } = useAdminFetch('/api/support', token)

  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)
  const [replyText, setReplyText] = useState({})   // { [msgId]: string }

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
      reloadStats()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
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
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, vendors, and platform activity</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { reloadStats(); reloadUsers(); reloadVendors(); reloadSupport() }} className="gap-2 bg-transparent">
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
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="vendors">
              Vendor Approvals
              {stats?.pendingApprovals > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
                  {stats.pendingApprovals}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="support">
              Support
              {stats?.unreadSupport > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
                  {stats.unreadSupport}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Vendor Approvals Tab */}
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
                              onClick={() => handleVendorStatus(vendor.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                              {actionLoading === `vendor-${vendor.id}-approved` ? 'Approving...' : 'Approve Vendor'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              disabled={actionLoading === `vendor-${vendor.id}-rejected`}
                              onClick={() => handleVendorStatus(vendor.id, 'rejected')}
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

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : (
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
                      {users?.map((user) => (
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
                                onClick={() => handleUserStatus(user.id, !user.is_active)}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Messages Tab */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
                  </div>
                ) : supportMessages?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No support messages yet.</p>
                  </div>
                ) : (
                  supportMessages?.map((msg) => (
                    <Card key={msg.id} className={`border ${!msg.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <CardContent className="pt-4 pb-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold">{msg.name}</span>
                          <span className="text-sm text-muted-foreground">{msg.email}</span>
                          {!msg.is_read && <Badge variant="default" className="text-[10px]">Unread</Badge>}
                          {msg.admin_reply && <Badge variant="secondary" className="text-[10px]">Replied</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Message */}
                        <p className="text-sm font-medium">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>

                        {/* Existing reply */}
                        {msg.admin_reply && (
                          <div className="bg-muted rounded-lg px-4 py-3 border-l-4 border-primary">
                            <p className="text-xs font-semibold text-primary mb-1">Admin Reply</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{msg.admin_reply}</p>
                          </div>
                        )}

                        {/* Reply box */}
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

          {/* Analytics Tab */}
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
                        { label: 'Pending Vendor Approvals', value: stats?.pendingApprovals },
                        { label: 'Unread Support Messages', value: stats?.unreadSupport },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-lg font-bold">{item.value ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Vendor Specializations</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Traditional', percentage: 30 },
                      { name: 'Newari', percentage: 22 },
                      { name: 'Brahmin', percentage: 18 },
                      { name: 'Modern / Luxury', percentage: 16 },
                      { name: 'Corporate', percentage: 14 },
                    ].map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground">{item.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
