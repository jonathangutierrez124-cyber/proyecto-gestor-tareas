const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de servidor' }))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:    (path)       => req(path),
  post:   (path, data) => req(path, { method: 'POST',   body: data }),
  put:    (path, data) => req(path, { method: 'PUT',    body: data }),
  delete: (path)       => req(path, { method: 'DELETE' }),
}
