import React, { useEffect, useState } from 'react';
import { Shield, Trash2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import { deleteUser, getUsers, updateUserRole } from '../services/legalService';

const Users = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        const mapped = data.map((u) => ({
          ...u,
          role: u.role || 'member',
          lastActive: u.last_active || '—'
        }));
        setUsers(mapped);
      } catch (err) {
        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Failed to load users.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isAdmin]);

  const handleRoleChange = async (id, role) => {
    setSavingId(id);
    setError(null);
    try {
      const data = await updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: data.role || role } : u))
      );
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Unable to update role.');
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user from the workspace?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Unable to delete user.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="card p-6 flex items-center gap-3">
        <Shield className="h-5 w-5 text-slate-400" />
        <div>
          <h1 className="text-sm font-semibold text-slate-100">
            Restricted area
          </h1>
          <p className="text-xs text-slate-500">
            Only workspace administrators can view and manage users.
          </p>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'email',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
            <UserIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-slate-100">{row.email}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${
              row.role === 'admin'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            {row.role === 'admin' ? 'Admin' : 'Member'}
          </span>
          <select
            value={row.role}
            onChange={(e) => handleRoleChange(row.id, e.target.value)}
            disabled={savingId === row.id}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px] text-slate-100"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      )
    },
    { key: 'lastActive', label: 'Last active' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            disabled={deletingId === row.id}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-300 hover:bg-slate-900 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Users</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage workspace members and roles.
          </p>
        </div>
      </div>
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 text-xs">
          {error}
        </div>
      )}
      <div className="card p-4">
        {loading ? (
          <div className="text-sm text-slate-400">Loading users…</div>
        ) : (
          <Table columns={columns} data={users} />
        )}
      </div>
    </div>
  );
};

export default Users;

