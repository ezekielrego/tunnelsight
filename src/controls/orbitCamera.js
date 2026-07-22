import * as pc from 'playcanvas'

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - ((-2 * value + 2) ** 3) / 2
}

function getAngleDelta(a, b) {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180)
}

export function createOrbitCameraControls({ app, camera }) {
  let yaw = 24
  let pitch = -12
  let distance = 12
  let dragging = false
  let pointerDragged = false
  let lastX = 0
  let lastY = 0
  const pressedKeys = new Set()

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
      const lookSpeed = mode === 'walk' ? 0.14 : 0.2
      yaw -= dx * lookSpeed
      pitch -= dy * lookSpeed
      pitch = Math.max(mode === 'walk' ? -45 : -80, Math.min(mode === 'walk' ? 45 : 80, pitch))
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

  function setView({ target, nextDistance = distance, nextYaw = yaw, nextPitch = pitch, animate = true }) {
    yaw = nextYaw
    pitch = nextPitch

    if (animate) {
      animateTo(target, nextDistance)
      return
    }

    orbitTarget.copy(target)
    distance = nextDistance
  }

  function resetAngles() {
    yaw = 28
    pitch = -14
  }

  function getSnapshot() {
    return {
      target: [orbitTarget.x, orbitTarget.y, orbitTarget.z],
      distance,
      yaw,
      pitch,
    }
  }

  function isNearSnapshot(snapshot, targetThreshold = 5) {
    if (!snapshot?.target) {
      return false
    }

    const dx = orbitTarget.x - snapshot.target[0]
    const dy = orbitTarget.y - snapshot.target[1]
    const dz = orbitTarget.z - snapshot.target[2]
    const targetDistance = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz))
    const zoomThreshold = Math.max(4, (snapshot.distance ?? distance) * 0.45)
    const yawDelta = getAngleDelta(yaw, snapshot.yaw ?? yaw)
    const pitchDelta = Math.abs(pitch - (snapshot.pitch ?? pitch))

    return targetDistance <= targetThreshold
      && Math.abs(distance - (snapshot.distance ?? distance)) <= zoomThreshold
      && yawDelta <= 45
      && pitchDelta <= 35
  }

  function handleKeyDown(event) {
    pressedKeys.add(event.key.toLowerCase())
  }

  function handleKeyUp(event) {
    pressedKeys.delete(event.key.toLowerCase())
  }

  function updateWalkMovement(dt) {
    const forwardInput = Number(pressedKeys.has('w')) - Number(pressedKeys.has('s'))
    const sideInput = Number(pressedKeys.has('d')) - Number(pressedKeys.has('a'))
    const verticalInput = Number(pressedKeys.has('e')) - Number(pressedKeys.has('q'))

    if (!forwardInput && !sideInput && !verticalInput) {
      return
    }

    const radYaw = (yaw * Math.PI) / 180
    const forward = new pc.Vec3(Math.sin(radYaw), 0, Math.cos(radYaw))
    const right = new pc.Vec3(Math.cos(radYaw), 0, -Math.sin(radYaw))
    const movement = forward.mulScalar(forwardInput).add(right.mulScalar(sideInput))
    movement.y += verticalInput

    if (movement.lengthSq() > 0) {
      movement.normalize().mulScalar(4.2 * dt)
      orbitTarget.add(movement)
    }
  }

  function update(dt, mode = 'inspect') {
    if (mode === 'walk') {
      distance += (2.6 - distance) * Math.min(1, dt * 3)
      updateWalkMovement(dt)
    }

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
    setView,
    resetAngles,
    update,
    handleKeyDown,
    handleKeyUp,
    wasPointerDragged: () => pointerDragged,
    setPointerDragged: (value) => {
      pointerDragged = value
    },
    getDistance: () => distance,
    getSnapshot,
    isNearSnapshot,
    setDistance: (value) => {
      distance = value
    },
    setTarget: (target) => {
      orbitTarget.copy(target)
    },
  }
}
