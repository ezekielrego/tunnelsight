import { formatDistance } from '../utils/formatters.js'

export function createMeasurementTool({ app, pc, camera, modelRoot, labelLayerEl, appState, setAppState, markerManager, cameraControls }) {
  const measurements = []
  const measurementLabels = []
  const measurementLines = []
  let lineMaterial = null

  function getLineMaterial() {
    if (lineMaterial) {
      return lineMaterial
    }

    lineMaterial = new pc.StandardMaterial()
    lineMaterial.diffuse = new pc.Color(0.35, 0.7, 1)
    lineMaterial.emissive = new pc.Color(0.35, 0.7, 1)
    lineMaterial.emissiveIntensity = 1.6
    lineMaterial.update()
    return lineMaterial
  }

  function createMeasurementLine(start, end) {
    const length = start.distance(end)
    if (length < 0.001) {
      return null
    }

    const midpoint = start.clone().add(end).mulScalar(0.5)
    const lineEntity = new pc.Entity('measurement-line')
    lineEntity.addComponent('render', { type: 'box' })
    lineEntity.setLocalScale(0.045, 0.045, length)
    lineEntity.setPosition(midpoint)
    lineEntity.lookAt(end)

    lineEntity.render.meshInstances.forEach((meshInstance) => {
      meshInstance.material = getLineMaterial()
    })

    modelRoot.addChild(lineEntity)
    measurementLines.push(lineEntity)
    return lineEntity
  }

  function clearMeasurements() {
    for (const label of measurementLabels) {
      label.remove()
    }

    for (const line of measurementLines) {
      line.destroy()
    }

    measurements.length = 0
    measurementLabels.length = 0
    measurementLines.length = 0
    appState.measureStart = null
  }

  function getPlacementPoint(event) {
    const near = camera.camera.screenToWorld(event.clientX, event.clientY, camera.camera.nearClip)
    const far = camera.camera.screenToWorld(event.clientX, event.clientY, camera.camera.farClip)
    const direction = far.clone().sub(near)
    const targetY = 0

    if (Math.abs(direction.y) < 0.0001) {
      return cameraControls.orbitTarget.clone()
    }

    const t = (targetY - near.y) / direction.y
    if (t < 0) {
      return cameraControls.orbitTarget.clone()
    }

    return near.add(direction.mulScalar(t))
  }

  function getInteractionPoint(event) {
    const closest = markerManager.findClosestMarker(event, camera, 20)
    return closest ? closest.getPosition().clone() : getPlacementPoint(event)
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
    const line = createMeasurementLine(start, end)
    const label = document.createElement('div')
    label.className = 'measurement-label'
    label.textContent = formatDistance(distanceValue)
    labelLayerEl.appendChild(label)

    measurements.push({ start, end, distance: distanceValue, label, line })
    measurementLabels.push(label)
    setAppState({
      measureStart: null,
      actionStatus: `Measured ${formatDistance(distanceValue)}`,
    })
  }

  function updateMeasurementLabels() {
    for (const measurement of measurements) {
      app.drawLine(measurement.start, measurement.end, new pc.Color(0.35, 0.7, 1), false)
      const midpoint = measurement.start.clone().add(measurement.end).mulScalar(0.5)
      const screenPos = camera.camera.worldToScreen(midpoint)
      measurement.label.style.left = `${screenPos.x}px`
      measurement.label.style.top = `${screenPos.y}px`
    }
  }

  return {
    measurements,
    clearMeasurements,
    getPlacementPoint,
    getInteractionPoint,
    handleMeasureClick,
    updateMeasurementLabels,
  }
}
