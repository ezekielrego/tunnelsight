const DB_NAME = 'tunnelsight-workspace'
const DB_VERSION = 1
const STORE_NAME = 'models'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(mode, callback) {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const result = callback(store)

    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  }).finally(() => {
    db.close()
  })
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function listWorkspaceFiles() {
  const db = await openDb()
  try {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    const records = await requestToPromise(request)
    return records.sort((a, b) => b.createdAt - a.createdAt)
  } finally {
    db.close()
  }
}

export async function getWorkspaceFile(id) {
  const db = await openDb()
  try {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    return await requestToPromise(store.get(id))
  } finally {
    db.close()
  }
}

export async function getWorkspaceUsage() {
  const files = await listWorkspaceFiles()
  return files.reduce((total, file) => total + (file.size || 0), 0)
}

export async function saveWorkspaceFile(file, quotaBytes) {
  const files = await listWorkspaceFiles()
  const currentUsage = files.reduce((total, item) => total + (item.size || 0), 0)

  if (currentUsage + file.size > quotaBytes) {
    throw new Error('Workspace storage limit reached. Remove an old file before uploading another model.')
  }

  const record = {
    id: `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9_.-]/g, '-'),
    name: file.name,
    size: file.size,
    type: file.type || 'model/gltf-binary',
    createdAt: Date.now(),
    blob: file,
  }

  await withStore('readwrite', (store) => {
    store.put(record)
  })

  return record
}

export async function saveWorkspaceLink({ name, url, source = 'Remote link' }) {
  const record = {
    id: `${Date.now()}-${name}`.replace(/[^a-zA-Z0-9_.-]/g, '-'),
    name,
    size: 0,
    type: 'remote/model-link',
    source,
    url,
    createdAt: Date.now(),
  }

  await withStore('readwrite', (store) => {
    store.put(record)
  })

  return record
}

export async function deleteWorkspaceFile(id) {
  await withStore('readwrite', (store) => {
    store.delete(id)
  })
}
