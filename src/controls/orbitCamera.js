import * as pc from 'playcanvas'

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - ((-2 * value + 2) ** 3) / 2
}

export function createOrbitCameraControls({ app, camera }) {
  let yaw = 24
  let pitch = -12
  let distance = 12
  let dragging = false
  let pointerDragged = false
  let lastX = 0
  let lastY = 0

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

  function beginDrag(event) {
    dragging = true
    pointerDragged = false
    lastX = event.clientX
    lastY = event.clientY
  }

  function endDrag() {
    dragging = false
  }

  function updateDrag(event, mode) {
    if (!dragging) {
      return
    }

    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      pointerDragged = true
    }
    if (mode === 'pan') {
      orbitTarget.x -= dx * 0.015
      orbitTarget.y += dy * 0.015
    } else {
      yaw -= dx * 0.2
      pitch -= dy * 0.2
      pitch = Math.max(-80, Math.min(80, pitch))
    }
    lastX = event.clientX
    lastY = event.clientY
  }

  function zoom(deltaY) {
    distance += deltaY * 0.02
    distance = Math.max(1.5, Math.min(80, distance))
  }

  function animateTo(target, nextDistance) {
    cameraMove.active = true
    cameraMove.elapsed = 0
    cameraMove.startTarget.copy(orbitTarget)
    cameraMove.endTarget.copy(target)
    cameraMove.startDistance = distance
    cameraMove.endDistance = nextDistance
  }

  function resetAngles() {
    yaw = 28
    pitch = -14
  }

  function update(dt) {
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
  }

  return {
    orbitTarget,
    beginDrag,
    endDrag,
    updateDrag,
    zoom,
    animateTo,
    resetAngles,
    update,
    wasPointerDragged: () => pointerDragged,
    setPointerDragged: (value) => {
      pointerDragged = value
    },
    getDistance: () => distance,
    setDistance: (value) => {
      distance = value
    },
    setTarget: (target) => {
      orbitTarget.copy(target)
    },
  }
}
