import { ROTATE_CAMERA_MODES } from '../config/viewerConfig.js'
import { createOrbitCameraControls } from '../controls/orbitCamera.js'
import { createPlayCanvasApp } from '../scene/playcanvasApp.js'
import { createGrid } from '../scene/grid.js'
import { frameEntity as frameSceneEntity } from '../scene/framing.js'
import { createModelLoader } from '../scene/modelLoader.js'
import { createMarkerManager } from '../tools/markerManager.js'
import { createMeasurementTool } from '../tools/measurementTool.js'
import { createSelectionBox } from '../tools/selectionBox.js'
import { downloadScreenshot } from '../tools/screenshot.js'
import { createFileManager } from '../ui/fileManager.js'
import { createViewState } from '../ui/viewState.js'

const TOGGLE_MODE_TARGETS = new Set(['select', 'boxSelect', 'lasso', 'measure', 'marker', 'annotate', 'highlight', 'walk'])

function clearModelRoot(modelRoot) {
  for (let index = modelRoot.children.length - 1; index >= 0; index -= 1) {
    modelRoot.children[index].destroy()
  }
}

export function createTunnelSightApp(dom) {
  const { pc, app, camera, light, modelRoot } = createPlayCanvasApp(dom.canvas)
  createGrid({ pc, app })
  let labelsVisible = true

  let markerManager
  const viewState = createViewState({
    dom,
    getMarkers: () => markerManager?.markers ?? [],
  })
  const {
    appState,
    renderAppState,
    setAppState,
    setMode,
    setModelLoadProgress,
    showPanel,
    clearPanel,
    setActionStatus,
  } = viewState

  const cameraControls = createOrbitCameraControls({ app, camera })

  const frameEntity = (entity, animate = false) => frameSceneEntity(entity, cameraControls, animate)

  markerManager = createMarkerManager({
    pc,
    modelRoot,
    labelLayerEl: dom.labelLayerEl,
    dom,
    appState,
    setAppState,
    renderAppState,
    setActionStatus,
  })

  const measurementTool = createMeasurementTool({
    app,
    pc,
    camera,
    modelRoot,
    labelLayerEl: dom.labelLayerEl,
    appState,
    setAppState,
    markerManager,
    cameraControls,
  })

  const selectionBox = createSelectionBox({
    labelLayerEl: dom.labelLayerEl,
    camera,
    markerManager,
    getViewSnapshot: cameraControls.getSnapshot,
  })

  const modelLoader = createModelLoader({
    pc,
    app,
    modelRoot,
    clearModelRoot: () => clearModelRoot(modelRoot),
    markerManager,
    measurementTool,
    frameEntity,
    setAppState,
    setModelLoadProgress,
  })

  const fileManager = createFileManager({
    dom,
    modelLoader,
    setActionStatus,
    clearPanel,
  })

  function focusModel() {
    if (modelRoot.children.length) {
      frameEntity(modelRoot, true)
      setActionStatus('Model framed')
      return
    }

    setActionStatus('No model to frame')
  }

  function resetView() {
    cameraControls.resetAngles()
    if (!modelRoot.children.length) {
      cameraControls.setDistance(18)
      cameraControls.orbitTarget.set(0, 0.5, 0)
    } else {
      frameEntity(modelRoot)
    }
  }

  function enterWalkthrough() {
    const target = modelRoot.children.length
      ? new pc.Vec3(0, 0.85, -3.5)
      : new pc.Vec3(0, 0.85, 0)
    cameraControls.setView({
      target,
      nextDistance: 2.6,
      nextYaw: 0,
      nextPitch: -4,
      animate: true,
    })
    setMode('walk')
    setActionStatus('Walk-through active')
  }

  function applyRenderPreset(preset) {
    const presets = {
      immersive: {
        fov: 66,
        ambient: new pc.Color(0.18, 0.22, 0.28),
        clear: new pc.Color(0.015, 0.025, 0.04),
        lightIntensity: 2.2,
      },
      balanced: {
        fov: 58,
        ambient: new pc.Color(0.25, 0.25, 0.3),
        clear: new pc.Color(0.03, 0.07, 0.12),
        lightIntensity: 1.6,
      },
      fast: {
        fov: 54,
        ambient: new pc.Color(0.34, 0.34, 0.36),
        clear: new pc.Color(0.045, 0.055, 0.065),
        lightIntensity: 1.15,
      },
    }
    const nextPreset = presets[preset] ?? presets.balanced
    camera.camera.fov = nextPreset.fov
    camera.camera.clearColor = nextPreset.clear
    app.scene.ambientLight = nextPreset.ambient
    if (light?.light) {
      light.light.intensity = nextPreset.lightIntensity
      light.light.castShadows = preset !== 'fast'
    }
    setActionStatus(`${preset[0].toUpperCase()}${preset.slice(1)} render active`)
  }

  function toggleLabels() {
    labelsVisible = !labelsVisible
    markerManager.setLabelsVisible(labelsVisible)
  }

  function exportReport() {
    const payload = markerManager.getReportData()
    payload.view = cameraControls.getSnapshot()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `tunnelsight-inspection-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setActionStatus('Inspection report exported')
  }

  async function copyViewState() {
    const payload = JSON.stringify({
      view: cameraControls.getSnapshot(),
      selectedMarkerIds: appState.selectedMarkers.map((marker) => marker.riskId),
    }, null, 2)
    try {
      await navigator.clipboard.writeText(payload)
      setActionStatus('View state copied')
    } catch (err) {
      console.warn('Clipboard unavailable:', err)
      setActionStatus('Clipboard blocked')
    }
  }

  function startVr() {
    if (!app.xr || !camera.camera?.startXr) {
      setActionStatus('WebXR unavailable in this browser')
      return
    }

    if (!app.xr.isAvailable(pc.XRTYPE_VR)) {
      setActionStatus('VR headset/browser support not detected')
      return
    }

    camera.camera.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCALFLOOR, {
      callback: (err) => {
        if (err) {
          console.warn('WebXR start failed:', err)
          setActionStatus('VR start blocked')
          return
        }
        setActionStatus('VR session active')
      },
    })
  }

  function createNoteFromPanel() {
    const input = document.getElementById('inspectionNoteInput')
    const point = measurementTool.getPlacementPoint({
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
    })
    markerManager.createNoteMarkerAt(point, cameraControls.getSnapshot(), input?.value ?? '')
    if (input) {
      input.value = ''
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
      case 'enter-walk':
        enterWalkthrough()
        break
      case 'start-vr':
        startVr()
        break
      case 'export-report':
        exportReport()
        break
      case 'capture-screenshot':
        downloadScreenshot({ canvas: dom.canvas, setAppState })
        break
      case 'open-file-manager':
        fileManager.open()
        break
      case 'toggle-layout':
        setAppState({
          compactLayout: !appState.compactLayout,
          actionStatus: appState.compactLayout ? 'Expanded layout' : 'Compact layout',
        })
        break
      case 'undo':
        markerManager.undoLastAction()
        break
      case 'redo':
        markerManager.redoLastAction()
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

  function runPanelAction(action) {
    switch (action) {
      case 'focus-model':
        focusModel()
        break
      case 'reset-view':
        resetView()
        setActionStatus('View reset')
        break
      case 'mode-select':
        setMode('select')
        break
      case 'mode-box-select':
        setMode('boxSelect')
        break
      case 'select-high':
        markerManager.selectBySeverity('High')
        break
      case 'select-visible':
        markerManager.selectVisibleMarkers()
        break
      case 'isolate-selection':
        markerManager.isolateSelection()
        break
      case 'clear-selection':
        markerManager.clearSelection()
        setActionStatus('Selection cleared')
        break
      case 'filter-all':
        markerManager.setSeverityFilter(null)
        break
      case 'filter-high':
        markerManager.setSeverityFilter('High')
        break
      case 'filter-medium':
        markerManager.setSeverityFilter('Medium')
        break
      case 'filter-warning':
        markerManager.setSeverityFilter('Warning')
        break
      case 'hide-selected':
        markerManager.hideSelectedMarkers()
        break
      case 'reveal-all':
        markerManager.revealAllMarkers()
        break
      case 'render-immersive':
        applyRenderPreset('immersive')
        break
      case 'render-balanced':
        applyRenderPreset('balanced')
        break
      case 'render-fast':
        applyRenderPreset('fast')
        break
      case 'toggle-labels':
        toggleLabels()
        break
      case 'save-note':
        createNoteFromPanel()
        break
      case 'copy-view-state':
        copyViewState()
        break
      default:
        runAction(action)
        break
    }
  }

  function bindPointerEvents() {
    dom.canvas.addEventListener('mousedown', (event) => {
      if (appState.modelLoadState === 'loading') {
        return
      }

      if (appState.mode === 'boxSelect' || appState.mode === 'lasso') {
        selectionBox.begin(event, appState.mode)
        cameraControls.setPointerDragged(false)
        return
      }

      if (!ROTATE_CAMERA_MODES.has(appState.mode) && appState.mode !== 'pan') {
        return
      }

      cameraControls.beginDrag(event)
    })

    window.addEventListener('mouseup', () => {
      selectionBox.finish()
      cameraControls.endDrag()
    })

    window.addEventListener('mousemove', (event) => {
      if (selectionBox.isActive()) {
        selectionBox.update(event)
        if (selectionBox.wasPointerDragged()) {
          cameraControls.setPointerDragged(true)
        }
        return
      }

      cameraControls.updateDrag(event, appState.mode)
    })

    dom.canvas.addEventListener('wheel', (event) => {
      event.preventDefault()
      cameraControls.zoom(event.deltaY)
    }, { passive: false })

    dom.canvas.addEventListener('click', (event) => {
      if (cameraControls.wasPointerDragged()) {
        return
      }

      if (appState.mode === 'measure' && appState.modelLoadState !== 'loading') {
        measurementTool.handleMeasureClick(event)
        return
      }

      const closest = markerManager.findClosestMarker(event, camera, 22)
      if (closest) {
        markerManager.updateSelection(closest)
        if (appState.mode === 'highlight') {
          cameraControls.animateTo(closest.getPosition(), Math.max(3.5, Math.min(cameraControls.getDistance(), 9)))
          setActionStatus(`${closest.label} highlighted`)
        }
        return
      }

      if ((appState.mode === 'marker' || appState.mode === 'annotate') && appState.modelLoadState !== 'loading') {
        const point = measurementTool.getPlacementPoint(event)
        if (appState.mode === 'annotate') {
          markerManager.createNoteMarkerAt(point, cameraControls.getSnapshot())
        } else {
          markerManager.createCustomMarkerAt(point, cameraControls.getSnapshot())
        }
      }
    })

    dom.canvas.addEventListener('dblclick', (event) => {
      const closest = markerManager.findClosestMarker(event, camera, 28)
      if (closest) {
        markerManager.updateSelection(closest)
        if (ROTATE_CAMERA_MODES.has(appState.mode) || appState.mode === 'highlight') {
          cameraControls.animateTo(closest.getPosition(), Math.max(4, Math.min(cameraControls.getDistance(), 12)))
        }
      }
    })
  }

  function bindUiEvents() {
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
        const nextMode = button.dataset.modeTarget
        if (appState.mode === nextMode && TOGGLE_MODE_TARGETS.has(nextMode)) {
          setMode('inspect')
          markerManager.clearSelection()
          setActionStatus('Navigation active')
          return
        }

        setMode(nextMode)
        if (nextMode === 'analysis') {
          showPanel('filters')
        } else if (nextMode === 'scene') {
          showPanel('render')
        }
      })
    })

    document.querySelectorAll('[data-ui-panel]').forEach((button) => {
      button.addEventListener('click', () => {
        fileManager.close()
        showPanel(button.dataset.uiPanel)
      })
    })

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        runAction(button.dataset.action)
      })
    })

    dom.commandPanelEl?.addEventListener('click', (event) => {
      const button = event.target instanceof Element
        ? event.target.closest('[data-panel-action]')
        : null
      if (!button) {
        return
      }
      runPanelAction(button.dataset.panelAction)
    })

    window.addEventListener('keydown', (event) => {
      if (event.target instanceof Element && event.target.closest('input, textarea, select')) {
        return
      }
      if (event.key === 'Escape') {
        setMode('inspect')
        setActionStatus('Navigation active')
        return
      }
      cameraControls.handleKeyDown(event)
    })

    window.addEventListener('keyup', (event) => {
      cameraControls.handleKeyUp(event)
    })

    dom.closeCommandPanelButton?.addEventListener('click', () => {
      clearPanel()
    })

    dom.retryModelLoadButton?.addEventListener('click', () => {
      modelLoader.loadPrimaryModel()
    })

    dom.actionOrbitResetButton?.addEventListener('click', () => {
      resetView()
      setActionStatus('Orbit reset')
    })

    dom.actionFocusTargetButton?.addEventListener('click', () => {
      focusModel()
    })

    dom.actionFitViewButton?.addEventListener('click', () => {
      focusModel()
    })

  }

  function bindUpdateLoop() {
    app.on('update', (dt) => {
      cameraControls.update(dt, appState.mode)
      markerManager.updateMarkerLabels(camera, dt, cameraControls)
      measurementTool.updateMeasurementLabels()
    })
  }

  renderAppState()
  bindPointerEvents()
  bindUiEvents()
  bindUpdateLoop()
  modelLoader.loadPrimaryModel()

  return {
    app,
    camera,
    modelRoot,
    appState,
    markerManager,
    measurementTool,
    focusModel,
    resetView,
    loadPrimaryModel: modelLoader.loadPrimaryModel,
  }
}
