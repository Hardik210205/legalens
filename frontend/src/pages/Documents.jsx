import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Trash2, UploadCloud, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { deleteDocument, getDocuments, uploadDocument } from '../services/legalService';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocuments();
      setDocuments(
        data.map((d) => ({
          ...d,
          size: d.size,
          uploadedAt: d.created_at || d.uploadedAt || ''
        }))
      );
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to load documents.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Document',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-slate-300">
            <FileText className="w-4 h-4 text-slate-300" />
          </span>
          <div>
            <div className="text-text-primary font-medium">
              {row.filename || row.name || 'Document'}
            </div>
            <div className="text-xs text-text-secondary">
              Case · {row.case_id || row.caseId || '—'} ·{' '}
              {row.content_type || row.type || 'File'}
            </div>
            {row.size && (
              <div className="text-[11px] text-text-secondary">
                {(row.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            )}
          </div>
        </div>
      )
    },
    { key: 'uploadedAt', label: 'Uploaded at' }
  ], []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const addFilesToQueue = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;
    setQueuedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const next = [...prev];
      for (const f of incoming) {
        const key = `${f.name}-${f.size}`;
        if (!existingKeys.has(key)) next.push(f);
      }
      return next;
    });
  };

  const removeQueuedFile = (idx) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e) => {
    addFilesToQueue(e.target.files);
    e.target.value = '';
  };

  const uploadQueued = async () => {
    if (queuedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      for (let i = 0; i < queuedFiles.length; i += 1) {
        const file = queuedFiles[i];
        await uploadDocument(file, null, (p) => {
          const overall = Math.round(((i + p / 100) / queuedFiles.length) * 100);
          setUploadProgress(overall);
        });
        setDocuments((prev) => [
          {
            id: `pending-${Date.now()}-${i}`,
            filename: file.name,
            content_type: file.type || 'application/octet-stream',
            size: file.size,
            uploadedAt: 'Just now'
          },
          ...prev
        ]);
      }
      setQueuedFiles([]);
      await fetchDocuments();
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Upload failed.');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm('Delete this document?')) return;
    setError(null);
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Unable to delete document.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Documents</h1>
          <p className="text-sm text-text-secondary mt-1">
            Central library for contracts, playbooks, and work product.
          </p>
        </div>
        <Button type="button" onClick={handleUploadClick} disabled={uploading}>
          <UploadCloud className="h-4 w-4" />
          <span>Add files</span>
        </Button>
      </div>

      <Card className="p-4 mt-2" hover>
        <div
          className={`rounded-2xl border border-dashed p-4 transition-colors ${
            dragActive
              ? 'border-accent bg-accent-soft'
              : 'border-border bg-background/40'
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            addFilesToQueue(e.dataTransfer.files);
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-text-primary">
                Drag & drop uploads
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Drop one or more files here, or click “Add files”.
              </div>
            </div>
            <Button
              type="button"
              variant="subtle"
              onClick={uploadQueued}
              disabled={uploading || queuedFiles.length === 0}
            >
              {uploading ? 'Uploading…' : 'Upload queued'}
            </Button>
          </div>

          {queuedFiles.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-text-primary mb-2">
                Uploaded Files
              </div>
              <div className="space-y-2">
                {queuedFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${f.size}-${idx}`}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-8 w-8 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-slate-300">
                        <FileText className="w-4 h-4 text-slate-300" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-text-primary truncate">
                          {f.name}
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          {formatBytes(f.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQueuedFile(idx)}
                      className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundImage:
                      'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-text-secondary">
                Upload progress: {uploadProgress}%
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 text-xs">
            {error}
          </div>
        )}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="mt-4">
            <Table
              columns={[
                ...columns,
                {
                  key: 'actions',
                  label: '',
                  render: (row) => (
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4 text-slate-300" />
                    </button>
                  )
                }
              ]}
              data={documents}
              emptyState={
                <div className="flex flex-col items-center gap-2 py-2">
                  <FileText className="w-5 h-5 text-slate-300" />
                  <div className="text-sm font-medium text-text-primary">
                    No documents yet
                  </div>
                  <div className="text-xs text-text-secondary">
                    Upload your first file to start asking questions.
                  </div>
                </div>
              }
            />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </Card>
    </div>
  );
};

export default Documents;

