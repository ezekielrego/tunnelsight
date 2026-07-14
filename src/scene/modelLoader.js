import { MODEL_FILENAME, MODEL_URL } from '../config/viewerConfig.js'

export function createModelLoader({
  pc,
  app,
  modelRoot,
  clearModelRoot,
  markerManager,
  measurementTool,
  frameEntity,
  setAppState,
  setModelLoadProgress,
}) {
  let currentModelAsset = null
  let currentObjectUrl = null
  let modelLoadAttempt = 0

  function removeCurrentModelAsset() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl)
      currentObjectUrl = null
    }

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

  function loadModelFromUrl({ url, filename = 'model.glb', label = filename, objectUrl = false }) {
    modelLoadAttempt += 1
    const attempt = modelLoadAttempt

    clearModelRoot()
    markerManager.clearMarkerLabels(measurementTool.clearMeasurements)
    removeCurrentModelAsset()
    if (objectUrl) {
      currentObjectUrl = url
    }
    setAppState({
      modelLoadState: 'loading',
      modelLoadProgress: 0,
      modelLoadMessage: `Loading ${label}`,
      actionStatus: 'Loading model',
    })

    const asset = new pc.Asset(label.replace(/[^a-zA-Z0-9_.-]/g, '-'), 'container', {
      url,
      filename,
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
      markerManager.seedInspectionMarkers()
      frameEntity(instantiated)
      markerManager.updateLabelsVisibility()
      setAppState({
        modelLoadState: 'ready',
        modelLoadProgress: 100,
        modelLoadMessage: `Loaded ${label}`,
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
      modelLoadMessage: `Could not load ${label}. Retry the model or use the fallback scene.`,
      actionStatus: 'Model load failed',
    })
    })

    app.assets.add(asset)
    app.assets.load(asset)
  }

  function loadPrimaryModel() {
    loadModelFromUrl({
      url: MODEL_URL,
      filename: MODEL_FILENAME,
      label: 'Positanos Tunnel',
    })
  }

  function invalidateModelLoad() {
    modelLoadAttempt += 1
  }

  return {
    loadPrimaryModel,
    loadModelFromUrl,
    removeCurrentModelAsset,
    invalidateModelLoad,
  }
}
