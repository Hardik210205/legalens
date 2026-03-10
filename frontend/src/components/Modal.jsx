import React from 'react';

const Modal = ({ open, title, children, onClose, primaryAction }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/60">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-100 text-sm"
            onClick={onClose}
          >
            Esc
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-700 bg-slate-900 text-slate-200"
          >
            Cancel
          </button>
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="px-3 py-1.5 text-sm rounded-md bg-primary-500 hover:bg-primary-600 text-white"
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

