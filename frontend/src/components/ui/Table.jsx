import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

const Table = ({ columns, data, onRowClick, emptyState }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string') {
        return sortDir === 'asc'
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-background/60">
          <tr>
            {columns.map((col) => {
              const sortable = col.sortable;
              const isActive = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, sortable)}
                  className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-text-secondary ${
                    sortable ? 'cursor-pointer select-none' : ''
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    {col.label}
                    {sortable && (
                      <span className="text-[10px]">
                        {isActive ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-text-secondary"
              >
                {emptyState || 'No data yet.'}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={row.id ?? row.key}
                className="border-t border-border/60 hover:bg-background/40 transition-colors"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 align-middle text-sm text-text-primary"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const TableActionsMenu = ({ children }) => (
  <button className="h-7 w-7 inline-flex items-center justify-center rounded-xl border border-transparent text-text-secondary hover:text-text-primary hover:bg-background/60">
    {children || <MoreHorizontal className="h-3.5 w-3.5" />}
  </button>
);

export const TableSortIcon = ({ dir }) =>
  dir === 'asc' ? (
    <ChevronUp className="h-3 w-3" />
  ) : (
    <ChevronDown className="h-3 w-3" />
  );

export default Table;

