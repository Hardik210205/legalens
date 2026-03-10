import React from 'react';

const Loader = () => {
  return (
    <div className="inline-flex items-center gap-2 text-slate-300">
      <span className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  );
};

export default Loader;

