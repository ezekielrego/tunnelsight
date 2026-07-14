import { DEFAULT_MODELS, WORKSPACE_QUOTA_BYTES } from '../config/viewerConfig.js'
import { formatBytes } from '../utils/formatters.js'
import {
  deleteWorkspaceFile,
  getWorkspaceFile,
  getWorkspaceUsage,
  listWorkspaceFiles,
  saveWorkspaceFile,
  saveWorkspaceLink,
} from '../storage/workspaceFiles.js'

function googleDriveToDownloadUrl(value) {
  const match = value.match(/\/d\/([^/]+)/) || value.match(/[?&]id=([^&]+)/)
  if (!match) {
    return value
  }
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(match[1])}`
}

function getFilenameFromUrl(value) {
  try {
    const url = new URL(value)
    const leaf = url.pathname.split('/').filter(Boolean).pop()
    return leaf || 'remote-model.glb'
  } catch {
    return 'remote-model.glb'
  }
}

function sourceClassFor(file) {
  if (file.url && file.source?.toLowerCase().includes('google')) {
    return 'file-row-drive'
  }
  if (file.url) {
    return 'file-row-link'
  }
  return 'file-row-local'
}

function sourceIconFor(file) {
  if (file.url && file.source?.toLowerCase().includes('google')) {
    return 'i-google-drive-source'
  }
  if (file.url) {
    return 'i-link-source'
  }
  return 'i-file-up'
}

function iconUse(iconId) {
  return `<svg viewBox="0 0 24 24"><use href="#${iconId}"></use></svg>`
}

export function createFileManager({ dom, modelLoader, setActionStatus, clearPanel }) {
  async function updateQuota() {
    const used = await getWorkspaceUsage()
    const percent = Math.min(100, (used / WORKSPACE_QUOTA_BYTES) * 100)
    dom.workspaceQuotaText.textContent = `${formatBytes(used)} of ${formatBytes(WORKSPACE_QUOTA_BYTES)} used`
    dom.workspaceQuotaBar.style.width = `${percent}%`
  }

  function renderDefaultModels() {
    dom.defaultModelList.innerHTML = ''
    for (const model of DEFAULT_MODELS) {
      const row = document.createElement('div')
      row.className = 'file-row file-row-default'
      row.innerHTML = `
        <span class="file-row-main">
          <span><strong>${model.name}</strong><small>Built-in model</small></span>
        </span>
        <button class="file-row-load" type="button">Load</button>
      `
      row.querySelector('button').addEventListener('click', () => {
        modelLoader.loadModelFromUrl({
          url: model.url,
          filename: model.filename,
          label: model.name,
        })
        close()
      })
      dom.defaultModelList.appendChild(row)
    }
  }

  async function renderSavedFiles() {
    const files = await listWorkspaceFiles()
    dom.savedModelList.innerHTML = ''

    if (!files.length) {
      const empty = document.createElement('span')
      empty.className = 'empty-file-state'
      empty.textContent = 'No saved uploads in this browser yet.'
      dom.savedModelList.appendChild(empty)
      await updateQuota()
      return
    }

    for (const file of files) {
      const row = document.createElement('div')
      row.className = `file-row ${sourceClassFor(file)}`
      row.innerHTML = `
        <span class="file-row-main">
          <span class="source-icon">${iconUse(sourceIconFor(file))}</span>
          <span><strong>${file.name}</strong><small>${file.url ? file.source : formatBytes(file.size)}</small></span>
        </span>
        <div class="file-row-actions">
          <button class="file-row-load" type="button" data-load>${iconUse(file.url ? sourceIconFor(file) : 'i-file-up')}Load</button>
          <button class="file-row-delete" type="button" data-delete><svg viewBox="0 0 24 24"><path d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Delete</button>
        </div>
      `
      row.querySelector('[data-load]').addEventListener('click', async () => {
        const record = await getWorkspaceFile(file.id)
        if (record.url) {
          modelLoader.loadModelFromUrl({
            url: record.url,
            filename: record.name,
            label: record.name,
          })
          close()
          return
        }

        const objectUrl = URL.createObjectURL(record.blob)
        modelLoader.loadModelFromUrl({
          url: objectUrl,
          filename: record.name,
          label: record.name,
          objectUrl: true,
        })
        close()
      })
      row.querySelector('[data-delete]').addEventListener('click', async () => {
        await deleteWorkspaceFile(file.id)
        setActionStatus('Workspace file deleted')
        await renderSavedFiles()
      })
      dom.savedModelList.appendChild(row)
    }

    await updateQuota()
  }

  async function open() {
    clearPanel()
    dom.fileManagerPanel.hidden = false
    document.body.classList.add('is-file-manager-open')
    renderDefaultModels()
    await renderSavedFiles()
    setActionStatus('File manager open')
  }

  function close() {
    dom.fileManagerPanel.hidden = true
    document.body.classList.remove('is-file-manager-open')
  }

  async function handleUpload(file) {
    if (!file) {
      return
    }

    if (!/\.glb$|\.gltf$/i.test(file.name)) {
      setActionStatus('Only GLB or GLTF models are supported')
      return
    }

    try {
      const record = await saveWorkspaceFile(file, WORKSPACE_QUOTA_BYTES)
      const objectUrl = URL.createObjectURL(record.blob)
      modelLoader.loadModelFromUrl({
        url: objectUrl,
        filename: record.name,
        label: record.name,
        objectUrl: true,
      })
      setActionStatus('Model saved and loading')
      await renderSavedFiles()
      close()
    } catch (error) {
      setActionStatus(error.message)
    } finally {
      dom.workspaceFileInput.value = ''
    }
  }

  async function loadRemoteLink(rawUrl, sourceLabel) {
    const url = rawUrl.trim()
    if (!url) {
      setActionStatus('Paste a model link first')
      return
    }

    const filename = getFilenameFromUrl(url)
    await saveWorkspaceLink({ name: filename, url, source: sourceLabel })
    modelLoader.loadModelFromUrl({
      url,
      filename,
      label: filename,
    })
    await renderSavedFiles()
    close()
  }

  dom.closeFileManagerButton?.addEventListener('click', close)
  dom.workspaceFileInput?.addEventListener('change', () => {
    handleUpload(dom.workspaceFileInput.files?.[0])
  })
  dom.loadModelLinkButton?.addEventListener('click', () => {
    loadRemoteLink(dom.modelLinkInput.value, 'Remote model')
  })
  dom.loadGoogleDriveLinkButton?.addEventListener('click', () => {
    loadRemoteLink(googleDriveToDownloadUrl(dom.googleDriveInput.value), 'Google Drive model')
  })

  return {
    open,
    close,
    refresh: renderSavedFiles,
  }
}
