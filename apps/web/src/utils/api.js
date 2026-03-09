const BASE = '/api';

function getToken() {
  return sessionStorage.getItem('ats_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 180)}`);
    }
    throw new Error(`Unexpected non-JSON response from API: ${text.slice(0, 120)}`);
  }

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  getJobs: (params = {}) => request('/jobs?' + new URLSearchParams(params)),
  jobsOverview: () => request('/jobs/overview'),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateJob: (id, body) => request(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  apply: (body) => request('/applications', { method: 'POST', body: JSON.stringify(body) }),
  myApplications: () => request('/applications/my'),
  myNotifications: () => request('/applications/my/notifications'),
  allApplications: (params = {}) => request('/applications?' + new URLSearchParams(params)),
  getApplication: (id) => request(`/applications/${id}`),
  updateStatus: (id, body) => request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  addNote: (id, noteOrBody) => request(`/applications/${id}/notes`, { method: 'POST', body: JSON.stringify(typeof noteOrBody === 'string' ? { note: noteOrBody } : noteOrBody) }),
  deleteNote: (id, noteId) => request(`/applications/${id}/notes/${noteId}`, { method: 'DELETE' }),
  scheduleInterview: (id, body) => request(`/applications/${id}/interviews`, { method: 'POST', body: JSON.stringify(body) }),
  updateInterview: (id, interviewId, body) => request(`/applications/${id}/interviews/${interviewId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  withdraw: (id) => request(`/applications/${id}/withdraw`, { method: 'PATCH' }),

  getDepartments: () => request('/departments'),
  createDepartment: (body) => request('/departments', { method: 'POST', body: JSON.stringify(body) }),
  updateDepartment: (id, body) => request(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: 'DELETE' }),

  uploadCV: (file) => {
    const form = new FormData();
    form.append('cv', file);
    return fetch(`${BASE}/upload/cv`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    }).then((r) => r.json());
  },
};
