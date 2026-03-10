import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-slate-300" />
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Settings</h1>
            <p className="text-sm text-slate-400 mt-1">
              Workspace configuration and preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">
            General
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="label" htmlFor="workspace-name">
                Workspace name
              </label>
              <input
                id="workspace-name"
                type="text"
                placeholder="Legal team – Acme Inc."
                className="w-full"
              />
            </div>
            <div>
              <label className="label" htmlFor="timezone">
                Timezone
              </label>
              <select
                id="timezone"
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option>UTC</option>
                <option>US/Eastern</option>
                <option>US/Pacific</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">
            AI & privacy
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-slate-100">Grounding</div>
                <p className="text-xs text-slate-500">
                  Restrict AI answers to workspace documents only.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" />
                <span className="h-5 w-9 rounded-full bg-slate-700 relative">
                  <span className="absolute left-1 top-0.5 h-4 w-4 rounded-full bg-slate-300" />
                </span>
              </label>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-slate-100">Logging</div>
                <p className="text-xs text-slate-500">
                  Control how long to retain AI query logs.
                </p>
              </div>
              <select className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100">
                <option>30 days</option>
                <option>90 days</option>
                <option>1 year</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

