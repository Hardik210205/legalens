import React from 'react';

const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mt-3">
      <div>
        Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalPages}</span>
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2 py-1 rounded-md border border-slate-700 bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2 py-1 rounded-md border border-slate-700 bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

