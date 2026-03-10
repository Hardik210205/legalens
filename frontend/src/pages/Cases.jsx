import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  createCase,
  deleteCase,
  getCases,
  updateCase
} from '../services/legalService';

const Cases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCases();
      const mapped = data.map((c) => ({
        ...c,
        status: c.status || '—',
        createdAt: c.created_at || c.createdAt || ''
      }));
      setCases(mapped);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to load cases.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        String(c.id).toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q)
    );
  }, [cases, query]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openCreate = () => {
    setActiveCase(null);
    setTitle('');
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setActiveCase(row);
    setTitle(row.title || '');
    setNotes(row.description || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (activeCase) {
        const data = await updateCase(activeCase.id, {
          title: title.trim(),
          description: notes || null
        });
        const updated = {
          ...data,
          status: data.status || activeCase.status || '—',
          createdAt: data.created_at || activeCase.createdAt || ''
        };
        setCases((prev) =>
          prev.map((c) => (c.id === activeCase.id ? updated : c))
        );
      } else {
        const data = await createCase({
          title: title.trim(),
          description: notes || null
        });
        const created = {
          ...data,
          status: data.status || '—',
          createdAt: data.created_at || ''
        };
        setCases((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Unable to save case.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this case?')) return;
    setDeletingId(row.id);
    setError(null);
    try {
      await deleteCase(row.id);
      setCases((prev) => prev.filter((c) => c.id !== row.id));
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Unable to delete case.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-200">
          {row.status}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created at' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => navigate(`/cases/${row.id}`)}
            className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Eye className="w-4 h-4 text-slate-300" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Pencil className="w-4 h-4 text-slate-300" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row.id}
            className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 text-slate-300" />
          </button>
          <button className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition">
            <MoreHorizontal className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Cases</h1>
          <p className="text-sm text-slate-400 mt-1">
            Centralized view of your matters and projects.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-1.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New case</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, ID, or status"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="card p-4 mt-2">
        {error && (
          <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 text-xs">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-sm text-slate-400">Loading cases…</div>
        ) : (
          <>
            <Table columns={columns} data={paged} />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeCase ? 'Edit case' : 'Create new case'}
        primaryAction={{
          label: activeCase ? 'Save' : 'Create',
          onClick: handleSave
        }}
      >
        <div className="space-y-3 text-sm">
          <div>
            <label className="label" htmlFor="case-title">
              Title
            </label>
            <input
              id="case-title"
              type="text"
              placeholder="e.g. Vendor MSA – Acme Inc."
              className="w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="case-notes">
              Notes
            </label>
            <textarea
              id="case-notes"
              rows={3}
              placeholder="Optional context for your team."
              className="w-full resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs px-3 py-1.5"
          >
            {saving ? 'Saving…' : activeCase ? 'Save changes' : 'Create case'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Cases;

