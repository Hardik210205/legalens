import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, FolderOpen, FileText, MessageCircle, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { StatSkeletonGrid, TableSkeleton } from '../components/ui/Skeleton';
import { getCases, getDocuments, getUsers } from '../services/legalService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cases, setCases] = useState([]);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(1);
  const [queryCount, setQueryCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requests = [getCases(), getDocuments()];
        if (isAdmin) {
          requests.push(getUsers());
        }

        const results = await Promise.all(requests);
        const casesData = results[0] || [];
        const docsData = results[1] || [];
        const usersData = isAdmin ? results[2] || [] : [];

        setCases(casesData);
        setDocumentsCount(docsData.length);
        setUsersCount(isAdmin ? usersData.length : 1);
        setQueryCount(Number(window.localStorage.getItem('queryCount') || 0));
      } catch (err) {
        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Failed to load dashboard metrics.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  const stats = useMemo(
    () => [
      {
        id: 'cases',
        label: 'Total Cases',
        value: String(cases.length),
        delta: 'Live data',
        icon: FolderOpen
      },
      {
        id: 'documents',
        label: 'Documents',
        value: String(documentsCount),
        delta: 'Live data',
        icon: FileText
      },
      {
        id: 'queries',
        label: 'Queries',
        value: String(queryCount),
        delta: 'Session total',
        icon: MessageCircle
      },
      {
        id: 'users',
        label: 'Active Users',
        value: String(usersCount),
        delta: isAdmin ? 'Workspace users' : 'Current user',
        icon: Users
      }
    ],
    [cases.length, documentsCount, isAdmin, queryCount, usersCount]
  );

  const recentCases = useMemo(
    () =>
      [...cases]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 8)
        .map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status || '—',
          owner: c.owner_email || '—',
          updatedAt: c.updated_at || c.created_at || '—'
        })),
    [cases]
  );

  const columns = [
    { key: 'id', label: 'Case ID' },
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
    { key: 'owner', label: 'Owner' },
    { key: 'updatedAt', label: 'Last activity' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-text-primary">
            Overview
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            High-level view across cases, documents, users, and AI activity.
          </p>
        </div>
        <button className="hidden sm:inline-flex items-center gap-1 rounded-2xl border border-border bg-card px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-accent/60">
          <ArrowUpRight className="h-3 w-3" />
          <span>Export metrics</span>
        </button>
      </div>

      {loading ? (
        <StatSkeletonGrid />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id} className="p-4 flex flex-col gap-3" hover>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-text-secondary">{stat.label}</div>
                  <div className="h-8 w-8 rounded-2xl bg-accent-soft border border-accent/40 flex items-center justify-center text-accent">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="text-2xl font-semibold text-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">{stat.delta}</div>
                </motion.div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mt-2">
        <Card className="p-4 md:col-span-2" hover>
          {error && (
            <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 text-xs">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Recent cases
              </h2>
              <p className="text-xs text-text-secondary">
                Last activity across your workspace
              </p>
            </div>
          </div>
          {loading ? (
            <TableSkeleton />
          ) : (
            <Table columns={columns} data={recentCases} />
          )}
        </Card>

        <Card className="p-4 space-y-3" hover>
          <h2 className="text-sm font-semibold text-text-primary">
            AI query activity
          </h2>
          <p className="text-xs text-text-secondary">
            Simple visualization of recent query volume (local-only).
          </p>
          <div className="mt-2 flex items-end gap-1 h-24">
            {Array.from({ length: 7 }).map((_, idx) => {
              const base = Math.max(1, queryCount % 10);
              const height = 20 + ((base + idx * 3) % 40);
              return (
                <motion.div
                  key={idx}
                  className="flex-1 rounded-full bg-accent-soft"
                  style={{ height }}
                  initial={{ scaleY: 0.2, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-text-secondary mt-1">
            <span>Last 7 days</span>
            <span>{queryCount} total queries</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

