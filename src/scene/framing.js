export function collectMeshInstances(entity, list = []) {
  if (entity.render?.meshInstances) {
    list.push(...entity.render.meshInstances)
  }

  for (const child of entity.children) {
    collectMeshInstances(child, list)
  }

  return list
}

export function getFrameForEntity(entity) {
  const meshInstances = collectMeshInstances(entity)

  if (!meshInstances.length) {
    return null
  }

  const bounds = meshInstances[0].aabb.clone()
  for (let index = 1; index < meshInstances.length; index += 1) {
    bounds.add(meshInstances[index].aabb)
  }

  const target = bounds.center.clone()
  target.y = bounds.center.y + bounds.halfExtents.y * 0.2
  const radius = Math.max(bounds.halfExtents.length(), 1.5)
  const distance = Math.max(4, Math.min(90, radius * 2.6))

  return { target, distance }
}

export function frameEntity(entity, cameraControls, animate = false) {
  const frame = getFrameForEntity(entity)

  if (!frame) {
    return false
  }

  if (animate) {
    cameraControls.animateTo(frame.target, frame.distance)
  } else {
    cameraControls.setTarget(frame.target)
    cameraControls.setDistance(frame.distance)
  }

  return true
}
