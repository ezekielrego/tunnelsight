import { ROTATE_CAMERA_MODES } from '../config/viewerConfig.js'
import { createOrbitCameraControls } from '../controls/orbitCamera.js'
import { createPlayCanvasApp } from '../scene/playcanvasApp.js'
import { createGrid } from '../scene/grid.js'
import { frameEntity as frameSceneEntity } from '../scene/framing.js'
import { createFallbackTunnel as buildFallbackTunnel } from '../scene/fallbackTunnel.js'
import { createModelLoader } from '../scene/modelLoader.js'
import { createMarkerManager } from '../tools/markerManager.js'
import { createMeasurementTool } from '../tools/measurementTool.js'
import { createSelectionBox } from '../tools/selectionBox.js'
import { downloadScreenshot } from '../tools/screenshot.js'
import { createViewState } from '../ui/viewState.js'

function clearModelRoot(modelRoot) {
  for (let index = modelRoot.children.length - 1; index >= 0; index -= 1) {
    modelRoot.children[index].destroy()
  }
}

export function createTunnelSightApp(dom) {
  const { pc, app, camera, modelRoot } = createPlayCanvasApp(dom.canvas)
  createGrid({ pc, app })

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
    setModelLoadState,
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

  function focusModel() {
    if (modelRoot.children.length) {
      frameEntity(modelRoot, true)
      setActionStatus('Model framed')
      return
    }

    setActionStatus('No model to frame')
  }

  function createFallbackTunnel() {
    buildFallbackTunnel({
      pc,
      modelRoot,
      clearModelRoot: () => clearModelRoot(modelRoot),
      markerManager,
      measurementTool,
      modelLoader,
      frameEntity,
      setModelLoadState,
    })
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
        downloadScreenshot({ canvas: dom.canvas, setAppState })
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

  function bindPointerEvents() {
    dom.canvas.addEventListener('mousedown', (event) => {
      if (appState.modelLoadState === 'loading') {
        return
      }

      if (appState.mode === 'boxSelect' || appState.mode === 'lasso') {
        selectionBox.begin(event)
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
        return
      }

      if (appState.mode === 'marker' && appState.modelLoadState !== 'loading') {
        markerManager.createCustomMarkerAt(measurementTool.getPlacementPoint(event))
      }
    })

    dom.canvas.addEventListener('dblclick', (event) => {
      const closest = markerManager.findClosestMarker(event, camera, 28)
      if (closest) {
        markerManager.updateSelection(closest)
        if (ROTATE_CAMERA_MODES.has(appState.mode)) {
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

    dom.closeCommandPanelButton?.addEventListener('click', () => {
      clearPanel()
    })

    dom.retryModelLoadButton?.addEventListener('click', () => {
      modelLoader.loadPrimaryModel()
    })

    dom.useFallbackSceneButton?.addEventListener('click', () => {
      createFallbackTunnel()
      setActionStatus('Fallback scene loaded')
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

    dom.actionLoadFallbackButton?.addEventListener('click', () => {
      createFallbackTunnel()
      setActionStatus('Fallback scene loaded')
    })
  }

  function bindUpdateLoop() {
    app.on('update', (dt) => {
      cameraControls.update(dt)
      markerManager.updateMarkerLabels(camera, dt)
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
    createFallbackTunnel,
  }
}
