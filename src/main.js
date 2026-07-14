import * as pc from 'playcanvas'
import './style.css'

const canvas = document.getElementById('application')
const zoneNameEl = document.getElementById('zoneName')
const riskScoreEl = document.getElementById('riskScore')
const labelLayerEl = document.getElementById('label-layer')
const severityLevelEl = document.getElementById('severityLevel')
const inspectionTimestampEl = document.getElementById('inspectionTimestamp')
const recommendationTextEl = document.getElementById('recommendationText')
const riskPointsCountEl = document.getElementById('riskPointsCount')
const alertsCountEl = document.getElementById('alertsCount')
const selectedCountEl = document.getElementById('selectedCount')
const hiddenCountEl = document.getElementById('hiddenCount')
const currentModeLabelEl = document.getElementById('currentModeLabel')
const modelLoadStateEl = document.getElementById('modelLoadState')
const actionStatusEl = document.getElementById('actionStatus')
const loadingOverlayEl = document.getElementById('loadingOverlay')
const loadingStateLabelEl = document.getElementById('loadingStateLabel')
const loadingPercentEl = document.getElementById('loadingPercent')
const loadingProgressBarEl = document.getElementById('loadingProgressBar')
const loadingMessageEl = document.getElementById('loadingMessage')
const retryModelLoadButton = document.getElementById('retryModelLoad')
const useFallbackSceneButton = document.getElementById('useFallbackScene')
const commandPanelEl = document.getElementById('commandPanel')
const commandPanelTitleEl = document.getElementById('commandPanelTitle')
const commandPanelTextEl = document.getElementById('commandPanelText')
const closeCommandPanelButton = document.getElementById('closeCommandPanel')
const actionFocusTargetButton = document.getElementById('actionFocusTarget')
const actionOrbitResetButton = document.getElementById('actionOrbitReset')
const actionLoadFallbackButton = document.getElementById('actionLoadFallback')
const actionFitViewButton = document.getElementById('actionFitView')

const MODEL_URL = '/models/positanos_tunnel.glb'
const MODEL_FILENAME = 'positanos_tunnel.glb'

const INSPECTION_POINTS = [
  {
    id: 'crown-spall',
    label: 'Crown Spalling - High',
    position: [-2.8, 1.8, -1.2],
    severity: 'High',
    riskScore: 91,
    recommendation: 'Restrict access and schedule immediate structural review.',
  },
  {
    id: 'wall-seepage',
    label: 'Wall Seepage - Medium',
    position: [1.6, 0.8, 2.4],
    severity: 'Medium',
    riskScore: 67,
    recommendation: 'Increase monitoring frequency and verify support integrity.',
  },
  {
    id: 'floor-crack',
    label: 'Invert Crack - Warning',
    position: [3.2, -1.4, -2.2],
    severity: 'Warning',
    riskScore: 54,
    recommendation: 'Run close-range inspection and confirm material stability before access.',
  },
]

const SEVERITY_COLORS = {
  High: new pc.Color(1, 0.22, 0.18),
  Medium: new pc.Color(1, 0.64, 0.16),
  Warning: new pc.Color(0.35, 0.7, 1),
}

const ROTATE_CAMERA_MODES = new Set(['inspect', 'orbit', 'rotate', 'scene'])

const MODE_LABELS = {
  inspect: 'Inspect Mode',
  analysis: 'Analysis Mode',
  scene: 'Scene Mode',
  measure: 'Measurement Mode',
  select: 'Selection Mode',
  orbit: 'Orbit Mode',
  pan: 'Pan Mode',
  annotate: 'Annotation Mode',
  marker: 'Marker Mode',
  highlight: 'Highlight Mode',
  boxSelect: 'Box Select Mode',
  lasso: 'Lasso Mode',
  rotate: 'Rotate Mode',
}

const MODEL_LOAD_LABELS = {
  idle: 'Idle',
  loading: 'Loading',
  ready: 'Ready',
  fallback: 'Fallback',
  error: 'Error',
}

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

const historyStack = []
const redoStack = []
let customMarkerCount = 0

const PANEL_CONTENT = {
  overview: {
    title: 'TunnelSight',
    text: 'State controller is active. Use mode buttons to switch tools and the model status pill to track load state.',
  },
  file: {
    title: 'File',
    text: 'Import, export, and project save actions will plug in here. Current model loads from /models/positanos_tunnel.glb.',
  },
  select: {
    title: 'Select',
    text: 'Selection commands are now routed. Object picking and selection sets are the next implementation step.',
  },
  render: {
    title: 'Render',
    text: 'Render settings and screenshot capture will be connected here after the capture workflow is added.',
  },
  help: {
    title: 'Help',
    text: 'Drag the viewport to orbit, scroll to zoom, and use Fit view to frame the current model.',
  },
  notes: {
    title: 'Notes',
    text: 'Inspection notes are not persisted yet. This panel is ready for the notes editor.',
  },
  collaboration: {
    title: 'Collaboration',
    text: 'Collaboration is not connected to a backend yet. The control is now routed and visible.',
  },
  filters: {
    title: 'Filters',
    text: 'Filtering is ready to receive severity, visibility, and layer controls.',
  },
  settings: {
    title: 'Settings',
    text: 'Viewer preferences, model quality, and interaction settings will live here.',
  },
}

window.tunnelSightState = appState

function renderAppState() {
  document.body.dataset.mode = appState.mode
  document.body.dataset.modelLoadState = appState.modelLoadState
  document.body.classList.toggle('is-model-busy', appState.modelLoadState === 'loading')

  if (currentModeLabelEl) {
    currentModeLabelEl.textContent = MODE_LABELS[appState.mode] ?? 'Viewer Mode'
  }

  if (modelLoadStateEl) {
    modelLoadStateEl.textContent = MODEL_LOAD_LABELS[appState.modelLoadState] ?? appState.modelLoadState
    modelLoadStateEl.title = appState.modelLoadMessage
  }

  if (actionStatusEl) {
    actionStatusEl.textContent = appState.actionStatus
    actionStatusEl.title = appState.actionStatus
  }

  if (loadingOverlayEl) {
    const isLoading = appState.modelLoadState === 'loading'
    const isError = appState.modelLoadState === 'error'
    const shouldShowLoader = isLoading || isError
    const percent = Math.round(appState.modelLoadProgress)

    loadingOverlayEl.hidden = !shouldShowLoader
    loadingOverlayEl.setAttribute('aria-busy', isLoading ? 'true' : 'false')
    loadingStateLabelEl.textContent = isError ? 'Model load failed' : 'Loading 3D model'
    loadingPercentEl.textContent = isLoading ? `${percent}%` : 'Error'
    loadingProgressBarEl.style.width = isLoading && percent > 0 ? `${percent}%` : '42%'
    loadingProgressBarEl.classList.toggle('is-indeterminate', isLoading && percent === 0)
    loadingMessageEl.textContent = appState.modelLoadMessage
    retryModelLoadButton.hidden = !isError
  }

  if (commandPanelEl) {
    const panel = appState.activePanel ? PANEL_CONTENT[appState.activePanel] : null
    commandPanelEl.hidden = !panel
    if (panel) {
      commandPanelTitleEl.textContent = panel.title
      commandPanelTextEl.textContent = panel.text
    }
  }

  document.body.classList.toggle('is-compact-layout', appState.compactLayout)
  selectedCountEl.textContent = String(appState.selectedMarkers.length)
  hiddenCountEl.textContent = String(appState.hiddenMarkerCount)
  riskPointsCountEl.textContent = String(markers.length)
  alertsCountEl.textContent = String(markers.filter((marker) => marker.severity === 'High').length)

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
  const modelLoadProgress = modelLoadState === 'ready' || modelLoadState === 'fallback'
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / (1024 ** exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
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

function focusModel() {
  if (modelRoot.children.length) {
    frameEntity(modelRoot, true)
    setActionStatus('Model framed')
    return
  }

  setActionStatus('No model to frame')
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - ((-2 * value + 2) ** 3) / 2
}

function animateCameraTo(target, nextDistance) {
  cameraMove.active = true
  cameraMove.elapsed = 0
  cameraMove.startTarget.copy(orbitTarget)
  cameraMove.endTarget.copy(target)
  cameraMove.startDistance = distance
  cameraMove.endDistance = nextDistance
}

function downloadScreenshot() {
  setAppState({ screenshotStatus: 'capturing', actionStatus: 'Capturing screenshot' })

  requestAnimationFrame(() => {
    canvas.toBlob((blob) => {
      if (!blob) {
        setAppState({ screenshotStatus: 'error', actionStatus: 'Screenshot failed' })
        return
      }

      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      link.href = URL.createObjectURL(blob)
      link.download = `tunnelsight-${timestamp}.png`
      link.click()
      URL.revokeObjectURL(link.href)
      setAppState({ screenshotStatus: 'ready', actionStatus: 'Screenshot saved' })
    }, 'image/png')
  })
}

function removeMarker(marker) {
  const index = markers.indexOf(marker)
  if (index === -1) {
    return
  }

  labelAnchors[index]?.remove()
  labelAnchors.splice(index, 1)
  markers.splice(index, 1)
  marker.destroy()

  if (appState.selectedMarker === marker) {
    clearSelection()
  } else {
    updateLabelsVisibility()
    renderAppState()
  }
}

function undoLastAction() {
  const action = historyStack.pop()
  if (!action) {
    setActionStatus('Nothing to undo')
    return
  }

  if (action.type === 'create-marker') {
    removeMarker(action.marker)
    redoStack.push(action)
    setActionStatus('Marker creation undone')
  }
}

function redoLastAction() {
  const action = redoStack.pop()
  if (!action) {
    setActionStatus('Nothing to redo')
    return
  }

  if (action.type === 'create-marker') {
    const marker = addWeakPoint(action.point)
    action.marker = marker
    historyStack.push(action)
    updateSelection(marker)
    setActionStatus('Marker creation redone')
  }
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setActionStatus('Fullscreen off')
      return
    }

    await document.documentElement.requestFullscreen()
    setActionStatus('Fullscreen on')
  } catch (err) {
    console.warn('Fullscreen failed:', err)
    setActionStatus('Fullscreen blocked')
  }
}

function runAction(action) {
  switch (action) {
    case 'focus-target':
      focusModel()
      break
    case 'toggle-fullscreen':
      toggleFullscreen()
      break
    case 'capture-screenshot':
      downloadScreenshot()
      break
    case 'toggle-layout':
      setAppState({
        compactLayout: !appState.compactLayout,
        actionStatus: appState.compactLayout ? 'Expanded layout' : 'Compact layout',
      })
      break
    case 'undo':
      undoLastAction()
      break
    case 'redo':
      redoLastAction()
      break
    case 'exit-viewer':
      setActionStatus('Exit unavailable')
      showPanel('overview')
      break
    default:
      setActionStatus('Action unavailable')
      break
  }
}

const app = new pc.Application(canvas, {
  mouse: new pc.Mouse(canvas),
  touch: new pc.TouchDevice(canvas),
  graphicsDeviceOptions: {
    preserveDrawingBuffer: true,
  },
})

app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW)
app.setCanvasResolution(pc.RESOLUTION_AUTO)
window.addEventListener('resize', () => app.resizeCanvas())
app.start()

app.scene.ambientLight = new pc.Color(0.25, 0.25, 0.3)

const camera = new pc.Entity('camera')
camera.addComponent('camera', {
  clearColor: new pc.Color(0.03, 0.07, 0.12),
})
camera.setPosition(0, 2, 8)
app.root.addChild(camera)

const light = new pc.Entity('light')
light.addComponent('light', {
  type: 'directional',
  intensity: 1.6,
  castShadows: true,
})
light.setEulerAngles(45, 30, 0)
app.root.addChild(light)

let yaw = 24
let pitch = -12
let distance = 12
const orbitTarget = new pc.Vec3(0, 1, 0)
const cameraMove = {
  active: false,
  elapsed: 0,
  duration: 0.85,
  startTarget: new pc.Vec3(),
  endTarget: new pc.Vec3(),
  startDistance: 12,
  endDistance: 12,
}
let dragging = false
let pointerDragged = false
let lastX = 0
let lastY = 0
let boxSelecting = false
let selectionStartX = 0
let selectionStartY = 0

canvas.addEventListener('mousedown', (event) => {
  if (appState.modelLoadState === 'loading') {
    return
  }

  if (appState.mode === 'boxSelect' || appState.mode === 'lasso') {
    boxSelecting = true
    pointerDragged = false
    selectionStartX = event.clientX
    selectionStartY = event.clientY
    lastX = event.clientX
    lastY = event.clientY
    updateSelectionBox(selectionStartX, selectionStartY, selectionStartX, selectionStartY)
    return
  }

  if (!ROTATE_CAMERA_MODES.has(appState.mode) && appState.mode !== 'pan') {
    return
  }

  dragging = true
  pointerDragged = false
  lastX = event.clientX
  lastY = event.clientY
})

window.addEventListener('mouseup', () => {
  if (boxSelecting) {
    finishBoxSelection()
  }

  dragging = false
})

window.addEventListener('mousemove', (event) => {
  if (boxSelecting) {
    if (Math.abs(event.clientX - selectionStartX) > 2 || Math.abs(event.clientY - selectionStartY) > 2) {
      pointerDragged = true
    }
    lastX = event.clientX
    lastY = event.clientY
    updateSelectionBox(selectionStartX, selectionStartY, event.clientX, event.clientY)
    return
  }

  if (!dragging) {
    return
  }

  const dx = event.clientX - lastX
  const dy = event.clientY - lastY
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    pointerDragged = true
  }
  if (appState.mode === 'pan') {
    orbitTarget.x -= dx * 0.015
    orbitTarget.y += dy * 0.015
  } else {
    yaw -= dx * 0.2
    pitch -= dy * 0.2
    pitch = Math.max(-80, Math.min(80, pitch))
  }
  lastX = event.clientX
  lastY = event.clientY
})

canvas.addEventListener('wheel', (event) => {
  event.preventDefault()
  distance += event.deltaY * 0.02
  distance = Math.max(1.5, Math.min(80, distance))
}, { passive: false })

const modelRoot = new pc.Entity('modelRoot')
app.root.addChild(modelRoot)

const markers = []
const labelAnchors = []
const measurements = []
const measurementLabels = []
const selectionBoxEl = document.createElement('div')
selectionBoxEl.className = 'selection-box'
selectionBoxEl.hidden = true
labelLayerEl.appendChild(selectionBoxEl)
let currentModelAsset = null
let modelLoadAttempt = 0

renderAppState()

function clearModelRoot() {
  for (let index = modelRoot.children.length - 1; index >= 0; index -= 1) {
    modelRoot.children[index].destroy()
  }
}

function clearMarkerLabels() {
  for (const anchor of labelAnchors) {
    anchor.remove()
  }

  markers.length = 0
  labelAnchors.length = 0
  clearMeasurements()
  clearSelection()
}

function clearMeasurements() {
  for (const label of measurementLabels) {
    label.remove()
  }

  measurements.length = 0
  measurementLabels.length = 0
  appState.measureStart = null
}

function clearSelection() {
  zoneNameEl.textContent = 'No zone selected'
  riskScoreEl.textContent = '-'
  severityLevelEl.textContent = '-'
  inspectionTimestampEl.textContent = '-'
  recommendationTextEl.textContent = 'Select a risk marker in the viewport to review inspection guidance.'
  setAppState({ selectedMarker: null, selectedMarkers: [], hiddenMarkerCount: 0 })
}

function updateLabelsVisibility() {
  for (let index = 0; index < labelAnchors.length; index += 1) {
    const anchor = labelAnchors[index]
    const marker = markers[index]
    anchor.hidden = !marker.enabled
    const isSelected = appState.selectedMarkers.includes(marker)
    anchor.classList.toggle('is-selected', isSelected)
    marker.setLocalScale(isSelected ? 0.28 : 0.18, isSelected ? 0.28 : 0.18, isSelected ? 0.28 : 0.18)
  }

  appState.hiddenMarkerCount = markers.filter((marker) => !marker.enabled).length
  hiddenCountEl.textContent = String(appState.hiddenMarkerCount)
}

function addWeakPoint(point) {
  const marker = new pc.Entity('marker')
  marker.addComponent('render', { type: 'sphere' })
  marker.setLocalScale(0.18, 0.18, 0.18)
  marker.setPosition(point.position[0], point.position[1], point.position[2])
  marker.riskId = point.id
  marker.label = point.label
  marker.severity = point.severity
  marker.riskScore = String(point.riskScore)
  marker.recommendation = point.recommendation

  const color = SEVERITY_COLORS[point.severity] ?? SEVERITY_COLORS.Warning
  const material = new pc.StandardMaterial()
  material.diffuse = color.clone()
  material.emissive = color.clone().mulScalar(0.72)
  material.emissiveIntensity = 2
  material.update()

  marker.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = material
  })

  const labelAnchor = document.createElement('div')
  labelAnchor.className = `marker-label marker-label-${point.severity.toLowerCase()}`
  labelAnchor.textContent = point.label
  labelLayerEl.appendChild(labelAnchor)

  modelRoot.addChild(marker)
  markers.push(marker)
  labelAnchors.push(labelAnchor)
  renderAppState()
  return marker
}

function seedInspectionMarkers() {
  INSPECTION_POINTS.forEach(addWeakPoint)
  updateLabelsVisibility()
  if (markers[0]) {
    updateSelection(markers[0])
  }
}

function updateSelection(marker) {
  setAppState({
    selectedMarker: marker,
    selectedMarkers: [marker],
    actionStatus: `${marker.severity} risk selected`,
  })
  zoneNameEl.textContent = marker.label
  riskScoreEl.textContent = marker.riskScore
  severityLevelEl.textContent = marker.severity
  inspectionTimestampEl.textContent = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  recommendationTextEl.textContent = marker.recommendation
}

function updateMultiSelection(selectedMarkers) {
  if (!selectedMarkers.length) {
    clearSelection()
    setActionStatus('No markers selected')
    return
  }

  const highestRisk = selectedMarkers.reduce((highest, marker) => (
    Number(marker.riskScore) > Number(highest.riskScore) ? marker : highest
  ), selectedMarkers[0])

  setAppState({
    selectedMarker: highestRisk,
    selectedMarkers,
    actionStatus: `${selectedMarkers.length} markers selected`,
  })
  zoneNameEl.textContent = `${selectedMarkers.length} markers selected`
  riskScoreEl.textContent = highestRisk.riskScore
  severityLevelEl.textContent = highestRisk.severity
  inspectionTimestampEl.textContent = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  recommendationTextEl.textContent = `Highest risk: ${highestRisk.label}. Review selected markers individually for details.`
}

function updateSelectionBox(startX, startY, endX, endY) {
  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)

  selectionBoxEl.hidden = false
  selectionBoxEl.style.left = `${left}px`
  selectionBoxEl.style.top = `${top}px`
  selectionBoxEl.style.width = `${width}px`
  selectionBoxEl.style.height = `${height}px`
}

function finishBoxSelection() {
  boxSelecting = false
  selectionBoxEl.hidden = true

  const rect = {
    left: Math.min(selectionStartX, lastX),
    right: Math.max(selectionStartX, lastX),
    top: Math.min(selectionStartY, lastY),
    bottom: Math.max(selectionStartY, lastY),
  }

  const selectedMarkers = markers.filter((marker) => {
    if (!marker.enabled) {
      return false
    }

    const screenPos = camera.camera.worldToScreen(marker.getPosition())
    return screenPos.x >= rect.left
      && screenPos.x <= rect.right
      && screenPos.y >= rect.top
      && screenPos.y <= rect.bottom
  })

  updateMultiSelection(selectedMarkers)
}

function findClosestMarker(event, maxDistance) {
  let closest = null
  let minDist = maxDistance

  for (const marker of markers) {
    if (!marker.enabled) {
      continue
    }

    const screenPos = camera.camera.worldToScreen(marker.getPosition())
    const dx = screenPos.x - event.clientX
    const dy = screenPos.y - event.clientY
    const distanceToMarker = Math.sqrt(dx * dx + dy * dy)

    if (distanceToMarker < minDist) {
      minDist = distanceToMarker
      closest = marker
    }
  }

  return closest
}

function getPlacementPoint(event) {
  const near = camera.camera.screenToWorld(event.clientX, event.clientY, camera.camera.nearClip)
  const far = camera.camera.screenToWorld(event.clientX, event.clientY, camera.camera.farClip)
  const direction = far.clone().sub(near)
  const targetY = 0

  if (Math.abs(direction.y) < 0.0001) {
    return orbitTarget.clone()
  }

  const t = (targetY - near.y) / direction.y
  if (t < 0) {
    return orbitTarget.clone()
  }

  return near.add(direction.mulScalar(t))
}

function getInteractionPoint(event) {
  const closest = findClosestMarker(event, 20)
  return closest ? closest.getPosition().clone() : getPlacementPoint(event)
}

function formatDistance(value) {
  return `${value.toFixed(value >= 10 ? 1 : 2)} m`
}

function handleMeasureClick(event) {
  const point = getInteractionPoint(event)

  if (!appState.measureStart) {
    setAppState({
      measureStart: point,
      actionStatus: 'Measure start set',
    })
    return
  }

  const start = appState.measureStart.clone()
  const end = point.clone()
  const distanceValue = start.distance(end)
  const label = document.createElement('div')
  label.className = 'measurement-label'
  label.textContent = formatDistance(distanceValue)
  labelLayerEl.appendChild(label)

  measurements.push({ start, end, distance: distanceValue, label })
  measurementLabels.push(label)
  setAppState({
    measureStart: null,
    actionStatus: `Measured ${formatDistance(distanceValue)}`,
  })
}

function createCustomMarkerAt(position) {
  customMarkerCount += 1
  const point = {
    id: `custom-${Date.now()}`,
    label: `Custom Marker ${customMarkerCount} - Warning`,
    position: [position.x, position.y, position.z],
    severity: 'Warning',
    riskScore: 50,
    recommendation: 'New marker placed manually. Add inspection notes and verify severity.',
  }
  const marker = addWeakPoint(point)
  historyStack.push({ type: 'create-marker', point, marker })
  redoStack.length = 0
  updateSelection(marker)
  setActionStatus('Marker added')
}

function collectMeshInstances(entity, list) {
  if (entity.render?.meshInstances) {
    list.push(...entity.render.meshInstances)
  }

  for (const child of entity.children) {
    collectMeshInstances(child, list)
  }
}

function frameEntity(entity, animate = false) {
  const meshInstances = []
  collectMeshInstances(entity, meshInstances)

  if (!meshInstances.length) {
    return
  }

  const bounds = meshInstances[0].aabb.clone()
  for (let index = 1; index < meshInstances.length; index += 1) {
    bounds.add(meshInstances[index].aabb)
  }

  orbitTarget.copy(bounds.center)
  const nextTarget = bounds.center.clone()
  nextTarget.y = bounds.center.y + bounds.halfExtents.y * 0.2
  const radius = Math.max(bounds.halfExtents.length(), 1.5)
  const nextDistance = Math.max(4, Math.min(90, radius * 2.6))

  if (animate) {
    animateCameraTo(nextTarget, nextDistance)
    return
  }

  orbitTarget.copy(nextTarget)
  distance = nextDistance
}

function createFallbackTunnel() {
  modelLoadAttempt += 1
  removeCurrentModelAsset()
  clearModelRoot()
  clearMarkerLabels()

  const tunnel = new pc.Entity('fallbackTunnel')
  tunnel.addComponent('render', { type: 'cylinder' })
  tunnel.setLocalScale(4.5, 12, 4.5)
  tunnel.setLocalEulerAngles(0, 0, 90)

  const tunnelMaterial = new pc.StandardMaterial()
  tunnelMaterial.diffuse = new pc.Color(0.15, 0.2, 0.26)
  tunnelMaterial.emissive = new pc.Color(0.03, 0.04, 0.05)
  tunnelMaterial.metalness = 0.08
  tunnelMaterial.gloss = 0.2
  tunnelMaterial.update()
  tunnel.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = tunnelMaterial
  })

  const floor = new pc.Entity('fallbackFloor')
  floor.addComponent('render', { type: 'box' })
  floor.setLocalScale(12, 0.15, 3.5)
  floor.setLocalPosition(0, -2.15, 0)

  const floorMaterial = new pc.StandardMaterial()
  floorMaterial.diffuse = new pc.Color(0.22, 0.24, 0.28)
  floorMaterial.emissive = new pc.Color(0.02, 0.02, 0.025)
  floorMaterial.update()
  floor.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = floorMaterial
  })

  const beacon = new pc.Entity('fallbackBeacon')
  beacon.addComponent('render', { type: 'box' })
  beacon.setLocalScale(1.1, 1.1, 1.1)
  beacon.setLocalPosition(0, 0.2, 0)

  const beaconMaterial = new pc.StandardMaterial()
  beaconMaterial.diffuse = new pc.Color(1, 0.25, 0.75)
  beaconMaterial.emissive = new pc.Color(0.75, 0.05, 0.45)
  beaconMaterial.emissiveIntensity = 1.8
  beaconMaterial.update()
  beacon.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = beaconMaterial
  })

  modelRoot.addChild(tunnel)
  modelRoot.addChild(floor)
  modelRoot.addChild(beacon)
  seedInspectionMarkers()
  frameEntity(modelRoot)
  setModelLoadState('fallback', 'Fallback tunnel scene is active.')
}

function resetView() {
  yaw = 28
  pitch = -14
  if (!modelRoot.children.length) {
    distance = 18
    orbitTarget.set(0, 0.5, 0)
  } else {
    frameEntity(modelRoot)
  }
}

function createLineMaterial(color, opacity) {
  const material = new pc.StandardMaterial()
  material.diffuse = color.clone()
  material.emissive = color.clone().mulScalar(0.72)
  material.opacity = opacity
  material.blendType = opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE
  material.useLighting = false
  material.depthWrite = false
  material.update()
  return material
}

function createGridLine(name, scaleX, scaleZ, posX, posZ, material) {
  const line = new pc.Entity(name)
  line.addComponent('render', { type: 'box' })
  line.setLocalScale(scaleX, 0.002, scaleZ)
  line.setPosition(posX, 0.001, posZ)
  line.render.castShadows = false
  line.render.receiveShadows = false
  line.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = material
  })
  return line
}

function createGrid() {
  const gridRoot = new pc.Entity('editorGrid')
  const extent = 36
  const majorEvery = 5

  const floor = new pc.Entity('gridFloor')
  floor.addComponent('render', { type: 'box' })
  floor.setLocalScale(extent * 2, 0.001, extent * 2)
  floor.setPosition(0, -0.002, 0)

  const floorMaterial = new pc.StandardMaterial()
  floorMaterial.diffuse = new pc.Color(0.04, 0.06, 0.09)
  floorMaterial.emissive = new pc.Color(0.012, 0.016, 0.022)
  floorMaterial.opacity = 0.94
  floorMaterial.update()
  floor.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = floorMaterial
  })
  gridRoot.addChild(floor)

  const minorMaterial = createLineMaterial(new pc.Color(0.17, 0.21, 0.27), 0.24)
  const majorMaterial = createLineMaterial(new pc.Color(0.27, 0.33, 0.43), 0.5)
  const xAxisMaterial = createLineMaterial(new pc.Color(0.72, 0.33, 0.33), 0.78)
  const zAxisMaterial = createLineMaterial(new pc.Color(0.36, 0.58, 0.94), 0.78)

  for (let position = -extent; position <= extent; position += 1) {
    let horizontalMaterial = minorMaterial
    let verticalMaterial = minorMaterial
    let thickness = 0.006

    if (position % majorEvery === 0) {
      horizontalMaterial = majorMaterial
      verticalMaterial = majorMaterial
      thickness = 0.012
    }

    if (position === 0) {
      horizontalMaterial = xAxisMaterial
      verticalMaterial = zAxisMaterial
      thickness = 0.018
    }

    gridRoot.addChild(createGridLine(`grid-x-${position}`, extent * 2, thickness, 0, position, horizontalMaterial))
    gridRoot.addChild(createGridLine(`grid-z-${position}`, thickness, extent * 2, position, 0, verticalMaterial))
  }

  app.root.addChild(gridRoot)
}

createGrid()

function removeCurrentModelAsset() {
  if (!currentModelAsset) {
    return
  }

  currentModelAsset.off('progress')
  currentModelAsset.off('load')
  currentModelAsset.off('error')
  currentModelAsset.unload()
  app.assets.remove(currentModelAsset)
  currentModelAsset = null
}

function loadPrimaryModel() {
  modelLoadAttempt += 1
  const attempt = modelLoadAttempt

  clearModelRoot()
  clearMarkerLabels()
  removeCurrentModelAsset()
  setAppState({
    modelLoadState: 'loading',
    modelLoadProgress: 0,
    modelLoadMessage: `Loading ${MODEL_URL}`,
    actionStatus: 'Loading model',
  })

  const asset = new pc.Asset('positanos_tunnel', 'container', {
    url: MODEL_URL,
    filename: MODEL_FILENAME,
  })

  currentModelAsset = asset

  asset.on('progress', (receivedBytes, totalBytes) => {
    if (attempt === modelLoadAttempt) {
      setModelLoadProgress(receivedBytes, totalBytes)
    }
  })

  asset.once('load', (loadedAsset) => {
    if (attempt !== modelLoadAttempt) {
      loadedAsset.unload()
      return
    }

    const instantiated = loadedAsset.resource.instantiateRenderEntity()
    instantiated.setLocalScale(1, 1, 1)
    modelRoot.addChild(instantiated)
    seedInspectionMarkers()
    frameEntity(instantiated)
    updateLabelsVisibility()
    setAppState({
      modelLoadState: 'ready',
      modelLoadProgress: 100,
      modelLoadMessage: `Loaded ${MODEL_URL}`,
      actionStatus: 'Model ready',
    })
  })

  asset.once('error', (err) => {
    if (attempt !== modelLoadAttempt) {
      return
    }

    console.error('Failed to load GLB:', err)
    setAppState({
      modelLoadState: 'error',
      modelLoadProgress: 0,
      modelLoadMessage: `Could not load ${MODEL_URL}. Retry the model or use the fallback scene.`,
      actionStatus: 'Model load failed',
    })
  })

  app.assets.add(asset)
  app.assets.load(asset)
}

loadPrimaryModel()

canvas.addEventListener('click', (event) => {
  if (pointerDragged) {
    return
  }

  if (appState.mode === 'measure' && appState.modelLoadState !== 'loading') {
    handleMeasureClick(event)
    return
  }

  const closest = findClosestMarker(event, 22)
  if (closest) {
    updateSelection(closest)
    return
  }

  if (appState.mode === 'marker' && appState.modelLoadState !== 'loading') {
    createCustomMarkerAt(getPlacementPoint(event))
  }
})

canvas.addEventListener('dblclick', (event) => {
  const closest = findClosestMarker(event, 28)
  if (closest) {
    updateSelection(closest)
    if (ROTATE_CAMERA_MODES.has(appState.mode)) {
      animateCameraTo(closest.getPosition(), Math.max(4, Math.min(distance, 12)))
    }
  }
})

document.querySelectorAll('.status-tab').forEach((button) => {
  button.addEventListener('click', () => {
    const activeStatusTab = button.textContent.trim()
    setAppState({
      activeStatusTab,
      actionStatus: `${activeStatusTab} active`,
    })
  })
})

document.querySelectorAll('[data-mode-target]').forEach((button) => {
  button.addEventListener('click', () => {
    setMode(button.dataset.modeTarget)
  })
})

document.querySelectorAll('[data-ui-panel]').forEach((button) => {
  button.addEventListener('click', () => {
    showPanel(button.dataset.uiPanel)
  })
})

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    runAction(button.dataset.action)
  })
})

closeCommandPanelButton?.addEventListener('click', () => {
  clearPanel()
})

retryModelLoadButton?.addEventListener('click', () => {
  loadPrimaryModel()
})

useFallbackSceneButton?.addEventListener('click', () => {
  createFallbackTunnel()
  setActionStatus('Fallback scene loaded')
})

actionOrbitResetButton?.addEventListener('click', () => {
  resetView()
  setActionStatus('Orbit reset')
})

actionFocusTargetButton?.addEventListener('click', () => {
  focusModel()
})

actionFitViewButton?.addEventListener('click', () => {
  focusModel()
})

actionLoadFallbackButton?.addEventListener('click', () => {
  createFallbackTunnel()
  setActionStatus('Fallback scene loaded')
})

app.on('update', (dt) => {
  if (cameraMove.active) {
    cameraMove.elapsed += dt
    const progress = Math.min(cameraMove.elapsed / cameraMove.duration, 1)
    const eased = easeInOutCubic(progress)

    orbitTarget.lerp(cameraMove.startTarget, cameraMove.endTarget, eased)
    distance = cameraMove.startDistance + ((cameraMove.endDistance - cameraMove.startDistance) * eased)

    if (progress >= 1) {
      cameraMove.active = false
    }
  }

  const radYaw = (yaw * Math.PI) / 180
  const radPitch = (pitch * Math.PI) / 180

  const x = distance * Math.sin(radYaw) * Math.cos(radPitch)
  const y = distance * Math.sin(radPitch)
  const z = distance * Math.cos(radYaw) * Math.cos(radPitch)

  camera.setPosition(x + orbitTarget.x, y + orbitTarget.y, z + orbitTarget.z)
  camera.lookAt(orbitTarget)

  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index]
    const anchor = labelAnchors[index]
    marker.rotate(0, 60 * dt, 0)

    const screenPos = camera.camera.worldToScreen(marker.getPosition())
    anchor.style.left = `${screenPos.x}px`
    anchor.style.top = `${screenPos.y - 18}px`
  }

  for (const measurement of measurements) {
    app.drawLine(measurement.start, measurement.end, new pc.Color(0.35, 0.7, 1), false)
    const midpoint = measurement.start.clone().add(measurement.end).mulScalar(0.5)
    const screenPos = camera.camera.worldToScreen(midpoint)
    measurement.label.style.left = `${screenPos.x}px`
    measurement.label.style.top = `${screenPos.y}px`
  }

  updateLabelsVisibility()
})
