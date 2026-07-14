import { MODE_LABELS, MODEL_LOAD_LABELS } from '../config/viewerConfig.js'
import { PANEL_CONTENT } from '../config/panelContent.js'
import { formatBytes } from '../utils/formatters.js'

export function createViewState({ dom, getMarkers }) {
  const appState = {
    mode: 'inspect',
    modelLoadState: 'idle',
    modelLoadMessage: 'No model request has started.',
    modelLoadProgress: 0,
    activeStatusTab: 'Timeline',
    activePanel: null,
    actionStatus: 'Ready',
    compactLayout: false,
    selectedMarker: null,
    selectedMarkers: [],
    hiddenMarkerCount: 0,
    measureStart: null,
    aiStatus: 'idle',
    screenshotStatus: 'idle',
  }

  function renderAppState() {
    const markers = getMarkers()
    document.body.dataset.mode = appState.mode
    document.body.dataset.modelLoadState = appState.modelLoadState
    document.body.classList.toggle('is-model-busy', appState.modelLoadState === 'loading')

    if (dom.currentModeLabelEl) {
      dom.currentModeLabelEl.textContent = MODE_LABELS[appState.mode] ?? 'Viewer Mode'
    }

    if (dom.modelLoadStateEl) {
      dom.modelLoadStateEl.textContent = MODEL_LOAD_LABELS[appState.modelLoadState] ?? appState.modelLoadState
      dom.modelLoadStateEl.title = appState.modelLoadMessage
    }

    if (dom.actionStatusEl) {
      dom.actionStatusEl.textContent = appState.actionStatus
      dom.actionStatusEl.title = appState.actionStatus
    }

    if (dom.loadingOverlayEl) {
      const isLoading = appState.modelLoadState === 'loading'
      const isError = appState.modelLoadState === 'error'
      const percent = Math.round(appState.modelLoadProgress)

      dom.loadingOverlayEl.hidden = !(isLoading || isError)
      dom.loadingOverlayEl.setAttribute('aria-busy', isLoading ? 'true' : 'false')
      dom.loadingStateLabelEl.textContent = isError ? 'Model load failed' : 'Loading 3D model'
      dom.loadingPercentEl.textContent = isLoading ? `${percent}%` : 'Error'
      dom.loadingProgressBarEl.style.width = isLoading && percent > 0 ? `${percent}%` : '42%'
      dom.loadingProgressBarEl.classList.toggle('is-indeterminate', isLoading && percent === 0)
      dom.loadingMessageEl.textContent = appState.modelLoadMessage
      dom.retryModelLoadButton.hidden = !isError
    }

    if (dom.commandPanelEl) {
      const panel = appState.activePanel ? PANEL_CONTENT[appState.activePanel] : null
      dom.commandPanelEl.hidden = !panel
      if (panel) {
        dom.commandPanelTitleEl.textContent = panel.title
        dom.commandPanelTextEl.textContent = panel.text
      }
    }

    document.body.classList.toggle('is-compact-layout', appState.compactLayout)
    dom.selectedCountEl.textContent = String(appState.selectedMarkers.length)
    dom.hiddenCountEl.textContent = String(appState.hiddenMarkerCount)
    dom.riskPointsCountEl.textContent = String(markers.length)
    dom.alertsCountEl.textContent = String(markers.filter((marker) => marker.severity === 'High').length)

    document.querySelectorAll('[data-mode-target]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.modeTarget === appState.mode)
    })

    document.querySelectorAll('.status-tab').forEach((tab) => {
      tab.classList.toggle('is-active', tab.textContent.trim() === appState.activeStatusTab)
    })

    const isModelBusy = appState.modelLoadState === 'loading'
    document.querySelectorAll('[data-mode-target], [data-action="focus-target"], #actionFocusTarget, #actionFitView').forEach((button) => {
      button.disabled = isModelBusy
    })
  }

  function setAppState(patch) {
    Object.assign(appState, patch)
    renderAppState()
  }

  function setMode(mode) {
    if (mode !== 'measure') {
      appState.measureStart = null
    }

    const modeHints = {
      marker: 'Click scene to add marker',
      measure: 'Click first measurement point',
      boxSelect: 'Drag to box select markers',
      lasso: 'Drag to select markers',
      select: 'Click marker to select',
      pan: 'Drag to pan view',
    }

    setAppState({
      mode,
      activePanel: null,
      actionStatus: modeHints[mode] ?? `${MODE_LABELS[mode] ?? mode} active`,
    })
  }

  function setModelLoadState(modelLoadState, modelLoadMessage) {
    const modelLoadProgress = modelLoadState === 'ready'
      ? 100
      : modelLoadState === 'loading'
        ? appState.modelLoadProgress
        : 0
    setAppState({ modelLoadState, modelLoadMessage, modelLoadProgress })
  }

  function setModelLoadProgress(receivedBytes, totalBytes) {
    if (!totalBytes) {
      return
    }

    const modelLoadProgress = Math.max(1, Math.min(99, (receivedBytes / totalBytes) * 100))
    setAppState({
      modelLoadProgress,
      modelLoadMessage: `Loading /models/positanos_tunnel.glb (${formatBytes(receivedBytes)} of ${formatBytes(totalBytes)})`,
    })
  }

  function showPanel(panelName) {
    const panel = PANEL_CONTENT[panelName]
    setAppState({
      activePanel: panel ? panelName : null,
      actionStatus: panel ? `${panel.title} panel open` : 'Panel unavailable',
    })
  }

  function clearPanel() {
    setAppState({ activePanel: null, actionStatus: 'Ready' })
  }

  function setActionStatus(actionStatus) {
    setAppState({ actionStatus })
  }

  return {
    appState,
    renderAppState,
    setAppState,
    setMode,
    setModelLoadState,
    setModelLoadProgress,
    showPanel,
    clearPanel,
    setActionStatus,
  }
}
