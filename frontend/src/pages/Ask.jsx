import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageCircle, Sparkles, UploadCloud, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { askQuestion, getCases, uploadDocument } from '../services/legalService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

const Ask = () => {
  const [question, setQuestion] = useState('');
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState('');
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchCases = async () => {
      setCasesLoading(true);
      setCasesError(null);
      try {
        const data = await getCases();
        setCases(data || []);
      } catch (err) {
        if (err.response?.data?.detail) {
          setCasesError(err.response.data.detail);
        } else {
          setCasesError('Failed to load cases for filtering.');
        }
      } finally {
        setCasesLoading(false);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialCaseId = params.get('caseId');
    if (initialCaseId) {
      setCaseId(initialCaseId);
    }
  }, [location.search]);

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;
    setAttachedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const next = [...prev];
      for (const f of incoming) {
        const key = `${f.name}-${f.size}`;
        if (!existingKeys.has(key)) next.push(f);
      }
      return next;
    });
  };

  const removeAttached = (idx) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadAttached = async () => {
    if (attachedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      for (let i = 0; i < attachedFiles.length; i += 1) {
        const file = attachedFiles[i];
        await uploadDocument(file, caseId ? Number(caseId) : null, (p) => {
          const overall = Math.round(((i + p / 100) / attachedFiles.length) * 100);
          setUploadProgress(overall);
        });
      }
      setUploadProgress(100);
      // Keep the UI list but mark uploaded implicitly by showing success in chat context.
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to upload attached documents.');
      }
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const content = question.trim();
    setQuestion('');
    setLoading(true);
    setError(null);

    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content,
      caseId: caseId || null
    };

    setMessages((prev) => [
      ...prev,
      newUserMessage,
      { id: `${Date.now()}-pending`, role: 'assistant', pending: true }
    ]);

    try {
      // Upload any attached documents first (same backend upload API).
      if (attachedFiles.length > 0) {
        await uploadAttached();
      }

      const data = await askQuestion(
        content,
        caseId ? Number(caseId) : null
      );
      const assistantMessage = {
        id: `${Date.now()}-ai`,
        role: 'assistant',
        answer: data?.answer || '',
        sources: Array.isArray(data?.sources) ? data.sources : [],
        confidence: Number.isFinite(data?.confidence) ? data.confidence : 0
      };
      setMessages((prev) => [
        ...prev.filter((m) => !m.pending),
        assistantMessage
      ]);
      const currentCount = Number(window.localStorage.getItem('queryCount') || 0);
      window.localStorage.setItem('queryCount', String(currentCount + 1));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => !m.pending));
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onQuestionKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSubmit(e);
      }
    }
  };

  const attachedSummary = useMemo(() => {
    const totalBytes = attachedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    return {
      count: attachedFiles.length,
      totalBytes
    };
  }, [attachedFiles]);

  return (
    <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-8rem)]">
      <Card className="p-4 hidden md:flex flex-col" hover>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Sessions</h2>
          <p className="text-xs text-text-secondary">
            Lightweight local history for this browser.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 text-xs text-text-secondary">
          {messages.length === 0 ? (
            <p className="text-[11px] text-text-secondary">
              No queries yet. Ask your first legal question on the right.
            </p>
          ) : (
            messages
              .filter((m) => m.role === 'user')
              .slice(-10)
              .map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-background/60 px-3 py-2 line-clamp-3"
                >
                  <div className="text-[11px] text-text-secondary mb-1">
                    {m.caseId ? `Case #${m.caseId}` : 'All cases'}
                  </div>
                  <div className="text-xs text-text-primary">{m.content}</div>
                </div>
              ))
          )}
        </div>
      </Card>

      <Card className="p-4 flex flex-col md:col-span-2" hover>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-sm font-semibold text-text-primary">
              Ask AI
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Ask workspace-aware questions across your matters and documents.
            </p>
          </div>
        </div>

        {/* Attachments */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-text-primary">
              Attach documents
            </div>
            <Button
              type="button"
              variant="subtle"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Documents</span>
            </Button>
          </div>

          <div
            className={`mt-2 rounded-2xl border border-dashed p-3 transition-colors ${
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
              addFiles(e.dataTransfer.files);
            }}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-text-secondary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-xs text-text-secondary">
                Drag & drop files here to attach. They will be uploaded before your
                next question.
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-text-secondary mb-2">
                  <span>Attached Documents</span>
                  <span>
                    {attachedSummary.count} files · {formatBytes(attachedSummary.totalBytes)}
                  </span>
                </div>
                <div className="space-y-2">
                  {attachedFiles.map((f, idx) => (
                    <div
                      key={`${f.name}-${f.size}-${idx}`}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-8 w-8 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-text-secondary">
                          <FileText className="h-4 w-4" />
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
                        onClick={() => removeAttached(idx)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-2xl text-text-secondary hover:text-text-primary hover:bg-background/60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {(uploading || uploadProgress > 0) && (
                  <div className="mt-3">
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
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && !loading && !error && (
            <div className="mt-6 text-xs text-text-secondary">
              Start by asking something like:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>“Summarize key obligations in the latest MSA.”</li>
                <li>“Highlight unusual termination clauses across NDAs.”</li>
                <li>“Compare liability caps across open vendor contracts.”</li>
              </ul>
            </div>
          )}

          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-md rounded-2xl bg-accent text-white px-3 py-2 text-xs shadow-lg shadow-black/30">
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-accent-soft border border-accent/40 flex items-center justify-center text-accent mt-1">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="max-w-xl rounded-2xl bg-card border border-border px-3 py-2 text-xs text-text-primary space-y-2">
                  {m.pending ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-32" />
                      <span className="animate-pulse text-[11px] text-text-secondary">
                        Thinking…
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-wide text-text-secondary">
                          Answer
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          Confidence:{' '}
                          {(m.confidence * 100).toFixed(1)}
                          %
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-text-primary">
                        {m.answer}
                      </p>
                      <details className="mt-1">
                        <summary className="text-[11px] text-text-secondary cursor-pointer">
                          Sources ({m.sources.length})
                        </summary>
                        <ul className="mt-1 list-disc list-inside text-[11px] text-text-secondary">
                          {m.sources.length === 0 ? (
                            <li>No sources returned.</li>
                          ) : (
                            m.sources.map((s, idx) => <li key={idx}>{s}</li>)
                          )}
                        </ul>
                      </details>
                    </>
                  )}
                </div>
              </div>
            )
          )}

          {error && (
            <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 text-xs">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <div className="flex flex-col md:flex-row gap-2 md:items-center text-xs text-text-secondary">
            <div className="flex-1">
              <label className="label" htmlFor="case">
                Case (optional)
              </label>
              <select
                id="case"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                disabled={casesLoading}
                className="w-full bg-card border border-border rounded-2xl px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="">All cases</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              {casesError && (
                <p className="mt-1 text-[11px] text-red-300">{casesError}</p>
              )}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              id="question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onQuestionKeyDown}
              placeholder="Ask a legal question or reference a case…"
              className="flex-1 resize-none bg-card border border-border rounded-2xl px-3 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <Button
              type="submit"
              disabled={loading || uploading}
              className="h-10 px-4 text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{loading ? 'Thinking…' : 'Ask'}</span>
            </Button>
          </div>
          <p className="text-[11px] text-text-secondary">
            Press Enter to send. Shift+Enter for a new line. Any attached documents
            are uploaded before your question is submitted.
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Ask;

