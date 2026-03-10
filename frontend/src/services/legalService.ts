import api from './api';

export async function askQuestion(question: string, caseId?: number | null) {
  const res = await api.post('/ask/', {
    question,
    case_id: caseId ?? null
  });
  return res.data;
}

export async function getCases() {
  const res = await api.get('/cases/');
  return res.data;
}

export async function getCaseById(caseId: number | string) {
  const res = await api.get(`/cases/${caseId}`);
  return res.data;
}

export async function createCase(payload: {
  title: string;
  description?: string | null;
}) {
  const res = await api.post('/cases/', payload);
  return res.data;
}

export async function updateCase(
  caseId: number | string,
  payload: { title: string; description?: string | null }
) {
  const res = await api.put(`/cases/${caseId}`, payload);
  return res.data;
}

export async function deleteCase(caseId: number | string) {
  await api.delete(`/cases/${caseId}`);
}

export async function uploadDocument(
  file: File,
  caseId?: number | null,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: caseId ? { case_id: caseId } : undefined,
    onUploadProgress: (evt) => {
      if (!onProgress) return;
      const total = evt.total || 0;
      if (!total) return;
      const percent = Math.round((evt.loaded / total) * 100);
      onProgress(percent);
    }
  });
  return res.data;
}

export async function getDocuments() {
  const res = await api.get('/documents/');
  return res.data;
}

export async function deleteDocument(documentId: number | string) {
  await api.delete(`/documents/${documentId}`);
}

export async function getUsers() {
  const res = await api.get('/users/');
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get('/users/me');
  return res.data;
}

export async function login(email: string, password: string) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const res = await api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return res.data;
}

export async function register(email: string, password: string) {
  const res = await api.post('/auth/register', {
    email,
    password
  });
  return res.data;
}

export async function updateUserRole(userId: number | string, role: string) {
  const res = await api.put(`/users/${userId}`, { role });
  return res.data;
}

export async function deleteUser(userId: number | string) {
  await api.delete(`/users/${userId}`);
}