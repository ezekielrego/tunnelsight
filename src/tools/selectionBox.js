export function createSelectionBox({ labelLayerEl, camera, markerManager, getViewSnapshot }) {
  const selectionBoxEl = document.createElement('div')
  selectionBoxEl.className = 'selection-box'
  selectionBoxEl.hidden = true
  labelLayerEl.appendChild(selectionBoxEl)

  let boxSelecting = false
  let pointerDragged = false
  let selectionStartX = 0
  let selectionStartY = 0
  let lastX = 0
  let lastY = 0
  let selectionMode = 'boxSelect'
  let lassoPoints = []

  function getViewportPoint(event) {
    return {
      x: event.clientX,
      y: event.clientY,
    }
  }

  function isPointInsidePolygon(point, polygon) {
    let inside = false
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
      const currentPoint = polygon[index]
      const previousPoint = polygon[previous]
      const intersects = ((currentPoint.y > point.y) !== (previousPoint.y > point.y))
        && (point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x)
      if (intersects) {
        inside = !inside
      }
    }
    return inside
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

  function updateLassoPath() {
    const xs = lassoPoints.map((point) => point.x)
    const ys = lassoPoints.map((point) => point.y)
    const left = Math.min(...xs)
    const top = Math.min(...ys)
    const width = Math.max(1, Math.max(...xs) - left)
    const height = Math.max(1, Math.max(...ys) - top)
    const polygon = lassoPoints
      .map((point) => `${((point.x - left) / width) * 100}% ${((point.y - top) / height) * 100}%`)
      .join(', ')

    selectionBoxEl.hidden = false
    selectionBoxEl.style.left = `${left}px`
    selectionBoxEl.style.top = `${top}px`
    selectionBoxEl.style.width = `${width}px`
    selectionBoxEl.style.height = `${height}px`
    selectionBoxEl.style.clipPath = `polygon(${polygon})`
  }

  function begin(event, mode = 'boxSelect') {
    boxSelecting = true
    pointerDragged = false
    selectionMode = mode
    lassoPoints = [getViewportPoint(event)]
    selectionStartX = event.clientX
    selectionStartY = event.clientY
    lastX = event.clientX
    lastY = event.clientY
    selectionBoxEl.classList.toggle('selection-box-lasso', selectionMode === 'lasso')
    selectionBoxEl.style.clipPath = ''
    updateSelectionBox(selectionStartX, selectionStartY, selectionStartX, selectionStartY)
  }

  function update(event) {
    if (!boxSelecting) {
      return
    }

    if (Math.abs(event.clientX - selectionStartX) > 2 || Math.abs(event.clientY - selectionStartY) > 2) {
      pointerDragged = true
    }
    lastX = event.clientX
    lastY = event.clientY
    if (selectionMode === 'lasso') {
      lassoPoints.push(getViewportPoint(event))
      updateLassoPath()
      return
    }

    updateSelectionBox(selectionStartX, selectionStartY, event.clientX, event.clientY)
  }

  function finish() {
    if (!boxSelecting) {
      return
    }

    boxSelecting = false
    selectionBoxEl.hidden = true
    selectionBoxEl.style.clipPath = ''

    const rect = {
      left: Math.min(selectionStartX, lastX),
      right: Math.max(selectionStartX, lastX),
      top: Math.min(selectionStartY, lastY),
      bottom: Math.max(selectionStartY, lastY),
    }

    const selectedMarkers = markerManager.markers.filter((marker) => {
      if (!marker.enabled) {
        return false
      }

      const screenPos = camera.camera.worldToScreen(marker.getPosition())
      if (selectionMode === 'lasso' && lassoPoints.length > 2) {
        return isPointInsidePolygon({ x: screenPos.x, y: screenPos.y }, lassoPoints)
      }

      return screenPos.x >= rect.left
        && screenPos.x <= rect.right
        && screenPos.y >= rect.top
        && screenPos.y <= rect.bottom
    })

    markerManager.updateMultiSelection(selectedMarkers)
    markerManager.saveSelectionSnapshot({
      rect,
      selectedMarkers,
      viewSnapshot: getViewSnapshot?.(),
    })
  }

  return {
    begin,
    update,
    finish,
    isActive: () => boxSelecting,
    wasPointerDragged: () => pointerDragged,
  }
}
