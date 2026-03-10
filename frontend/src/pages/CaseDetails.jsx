import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paperclip, MessageCircle } from 'lucide-react';
import { getCaseById, getDocuments } from '../services/legalService';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [c, allDocs] = await Promise.all([
          getCaseById(id),
          getDocuments()
        ]);
        setCaseData({
          ...c,
          status: c.status || '—',
          owner: c.owner_email || '—',
          createdAt: c.created_at || ''
        });
        const relatedDocs = allDocs.filter(
          (d) => String(d.case_id) === String(id)
        );
        setDocuments(relatedDocs);
      } catch (err) {
        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Failed to load case details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="card p-6 text-sm text-slate-400">Loading case…</div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-sm text-red-200 bg-red-500/10 border border-red-500/40">
        {error}
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="card p-6 text-sm text-slate-400">Case not found.</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            Case ID · {id}
          </div>
          <h1 className="text-xl font-semibold text-slate-50">
            {caseData.title}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-200">
              {caseData.status}
            </span>
            <span>Owner · {caseData.owner}</span>
            <span>Opened · {caseData.createdAt}</span>
          </div>
        </div>
        <button
          className="btn-primary inline-flex items-center gap-1.5 text-sm"
          type="button"
          onClick={() => navigate(`/ask?caseId=${id}`)}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Ask AI about this case</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="card p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">
            Overview
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            {caseData.description || 'No description provided.'}
          </p>
        </section>

        <section className="card p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">
            Meta
          </h2>
          <dl className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <dt className="text-slate-500">Jurisdiction</dt>
              <dd className="font-medium">US / EU</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Practice area</dt>
              <dd className="font-medium">Corporate</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Sensitivity</dt>
              <dd className="font-medium">Confidential</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Associated documents
            </h2>
            <p className="text-xs text-slate-500">
              Documents linked to this matter
            </p>
          </div>
        </div>
        <ul className="divide-y divide-slate-800">
          {documents.length === 0 ? (
            <li className="py-4 text-sm text-slate-500">
              No documents linked to this case yet.
            </li>
          ) : (
            documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Paperclip className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="text-slate-100">
                      {doc.filename || 'Document'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {doc.content_type || 'File'} · Case #{doc.case_id}
                    </div>
                  </div>
                </div>
                <button className="text-xs text-primary-400 hover:text-primary-300">
                  Open
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default CaseDetails;

