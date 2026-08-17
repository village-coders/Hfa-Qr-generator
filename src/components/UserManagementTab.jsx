import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Trash2, Pencil, User, Mail, 
  CheckCircle2, AlertCircle, RefreshCw, X, Loader2, KeyRound, Building, LogIn,
  ShieldCheck, ShieldOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function UserManagementTab() {
  const { user: currentUser, token, isAdmin, logout } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Create user modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
  });

  // Edit user modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    active: true,
  });

  // Modal alert / confirmation state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' | 'warning'
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmColor: 'rose',
  });

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'user',
      department: u.department || '',
      active: u.active !== false,
    });
    setShowEditModal(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.QR_USERS, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (res.status === 401) {
        setStatusMsg({ 
          type: 'error', 
          text: 'Session expired or missing authorization token. Please log out and sign in again.' 
        });
      } else if (json.success) {
        setUsersList(json.data || []);
      } else {
        setStatusMsg({ type: 'error', text: json.message || 'Failed to load QR users.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setCreating(true);
    setStatusMsg({ type: 'info', text: 'Creating new QR user...' });

    try {
      const res = await fetch(API_ENDPOINTS.QR_USERS, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create QR user.');
      }

      setStatusMsg({ type: 'success', text: `QR User "${formData.name}" created successfully!` });
      setShowCreateModal(false);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'user',
        department: '',
      });
      fetchUsers();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = (userToDelete) => {
    if (userToDelete._id === currentUser?._id || userToDelete.username === currentUser?.username) {
      setConfirmModal({
        isOpen: true,
        type: 'warning',
        title: 'Action Not Allowed',
        message: 'You cannot delete your own QR admin account.',
        confirmText: 'Understood',
        confirmColor: 'emerald',
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete QR User',
      message: `Are you sure you want to permanently delete user "${userToDelete.name}" (@${userToDelete.username})? This action cannot be undone.`,
      confirmText: 'Yes, Delete User',
      confirmColor: 'rose',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(API_ENDPOINTS.QR_USER_BY_ID(userToDelete._id), {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });

          const json = await res.json();
          if (json.success) {
            setStatusMsg({ type: 'success', text: `QR User "${userToDelete.name}" deleted.` });
            fetchUsers();
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
          } else {
            setStatusMsg({ type: 'error', text: json.message || 'Failed to delete QR user.' });
          }
        } catch (err) {
          setStatusMsg({ type: 'error', text: 'Error deleting QR user.' });
        }
      },
    });
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setStatusMsg({ type: 'error', text: 'Name and email are required.' });
      return;
    }
    setEditSaving(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        department: editForm.department.trim(),
        active: editForm.active,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }
      const res = await fetch(API_ENDPOINTS.QR_USER_BY_ID(editingUser._id), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update user.');
      setStatusMsg({ type: 'success', text: `User "${editForm.name}" updated successfully.` });
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setEditSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Access Restricted</h2>
        <p className="text-sm text-slate-500">Only authorized administrators can access QR User Management.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-12 px-3 sm:px-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">QR User Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create and manage users who can generate and maintain HFA QR codes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow transition-all"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New QR User</span>
        </button>
      </div>

      {/* Alert */}
      {statusMsg.text && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusMsg.type === 'error' ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          {statusMsg.type === 'error' && (
            <button
              onClick={logout}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow self-start sm:self-auto flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In Again</span>
            </button>
          )}
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-xs sm:text-sm font-semibold">Loading QR users...</p>
        </div>
      ) : usersList.length === 0 ? (
        <div className="py-16 text-center px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No QR users found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Create your first QR user to grant access to the portal.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow"
          >
            Create QR User
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {usersList.map((u) => {
              const isSelf = u._id === currentUser?._id || u.username === currentUser?.username;
              return (
                <div key={u._id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100 flex-shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-slate-900">{u.name}</p>
                          {isSelf && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-semibold text-slate-700">{u.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    {u.department && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dept:</span>
                        <span className="font-medium text-slate-700">{u.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">QR User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {usersList.map((u) => {
                    const isSelf = u._id === currentUser?._id || u.username === currentUser?.username;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">{u.name}</p>
                                {isSelf && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-medium">{u.email}</td>

                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-600">{u.department || '—'}</td>

                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              title="Edit QR User"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Delete QR User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New QR User</h3>
                <p className="text-xs text-slate-500">Add a dedicated user for HFA QR Portal.</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="johndoe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="user">User (Standard)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Halal Compliance"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full mt-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating QR User...</span>
                  </>
                ) : (
                  <span>Create QR User</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit QR User</h3>
                <p className="text-xs text-slate-500 font-mono">@{editingUser.username}</p>
              </div>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="user">User (Standard)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Account Status
                  </label>
                  <select
                    value={editForm.active ? 'active' : 'inactive'}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Change Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Leave blank if you don't want to change the password.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    placeholder="e.g. Halal Compliance"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirm / Alert Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center">
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border ${
              confirmModal.type === 'warning'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              {confirmModal.type === 'warning' ? (
                <AlertCircle className="w-7 h-7" />
              ) : (
                <Trash2 className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">{confirmModal.message}</p>

            <div className="flex gap-2.5">
              {confirmModal.type !== 'warning' && (
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) {
                    confirmModal.onConfirm();
                  } else {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                  confirmModal.confirmColor === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
