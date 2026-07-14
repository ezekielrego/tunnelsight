import { INSPECTION_POINTS, SEVERITY_COLORS } from '../config/viewerConfig.js'
import { formatInspectionTimestamp } from '../utils/formatters.js'

export function createMarkerManager({ pc, modelRoot, labelLayerEl, dom, appState, setAppState, renderAppState, setActionStatus }) {
  const markers = []
  const labelAnchors = []
  const historyStack = []
  const redoStack = []
  let customMarkerCount = 0

  function clearSelection() {
    dom.zoneNameEl.textContent = 'No zone selected'
    dom.riskScoreEl.textContent = '-'
    dom.severityLevelEl.textContent = '-'
    dom.inspectionTimestampEl.textContent = '-'
    dom.recommendationTextEl.textContent = 'Select a risk marker in the viewport to review inspection guidance.'
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
    dom.hiddenCountEl.textContent = String(appState.hiddenMarkerCount)
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
    dom.zoneNameEl.textContent = marker.label
    dom.riskScoreEl.textContent = marker.riskScore
    dom.severityLevelEl.textContent = marker.severity
    dom.inspectionTimestampEl.textContent = formatInspectionTimestamp()
    dom.recommendationTextEl.textContent = marker.recommendation
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
    dom.zoneNameEl.textContent = `${selectedMarkers.length} markers selected`
    dom.riskScoreEl.textContent = highestRisk.riskScore
    dom.severityLevelEl.textContent = highestRisk.severity
    dom.inspectionTimestampEl.textContent = formatInspectionTimestamp()
    dom.recommendationTextEl.textContent = `Highest risk: ${highestRisk.label}. Review selected markers individually for details.`
  }

  function findClosestMarker(event, camera, maxDistance) {
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

  function clearMarkerLabels(clearMeasurements) {
    for (const anchor of labelAnchors) {
      anchor.remove()
    }

    markers.length = 0
    labelAnchors.length = 0
    clearMeasurements?.()
    clearSelection()
  }

  function updateMarkerLabels(camera, dt) {
    for (let index = 0; index < markers.length; index += 1) {
      const marker = markers[index]
      const anchor = labelAnchors[index]
      marker.rotate(0, 60 * dt, 0)

      const screenPos = camera.camera.worldToScreen(marker.getPosition())
      anchor.style.left = `${screenPos.x}px`
      anchor.style.top = `${screenPos.y - 18}px`
    }

    updateLabelsVisibility()
  }

  return {
    markers,
    labelAnchors,
    addWeakPoint,
    seedInspectionMarkers,
    updateSelection,
    updateMultiSelection,
    findClosestMarker,
    createCustomMarkerAt,
    clearMarkerLabels,
    clearSelection,
    updateLabelsVisibility,
    updateMarkerLabels,
    undoLastAction,
    redoLastAction,
  }
}
