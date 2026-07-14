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

  function begin(event) {
    boxSelecting = true
    pointerDragged = false
    selectionStartX = event.clientX
    selectionStartY = event.clientY
    lastX = event.clientX
    lastY = event.clientY
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
    updateSelectionBox(selectionStartX, selectionStartY, event.clientX, event.clientY)
  }

  function finish() {
    if (!boxSelecting) {
      return
    }

    boxSelecting = false
    selectionBoxEl.hidden = true

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
