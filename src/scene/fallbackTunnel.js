export function createFallbackTunnel({
  pc,
  modelRoot,
  clearModelRoot,
  markerManager,
  measurementTool,
  modelLoader,
  frameEntity,
  setModelLoadState,
}) {
  modelLoader.invalidateModelLoad()
  modelLoader.removeCurrentModelAsset()
  clearModelRoot()
  markerManager.clearMarkerLabels(measurementTool.clearMeasurements)

  const tunnel = new pc.Entity('fallbackTunnel')
  tunnel.addComponent('render', { type: 'cylinder' })
  tunnel.setLocalScale(4.5, 12, 4.5)
  tunnel.setLocalEulerAngles(0, 0, 90)

  const tunnelMaterial = new pc.StandardMaterial()
  tunnelMaterial.diffuse = new pc.Color(0.15, 0.2, 0.26)
  tunnelMaterial.emissive = new pc.Color(0.03, 0.04, 0.05)
  tunnelMaterial.metalness = 0.08
  tunnelMaterial.gloss = 0.2
  tunnelMaterial.update()
  tunnel.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = tunnelMaterial
  })

  const floor = new pc.Entity('fallbackFloor')
  floor.addComponent('render', { type: 'box' })
  floor.setLocalScale(12, 0.15, 3.5)
  floor.setLocalPosition(0, -2.15, 0)

  const floorMaterial = new pc.StandardMaterial()
  floorMaterial.diffuse = new pc.Color(0.22, 0.24, 0.28)
  floorMaterial.emissive = new pc.Color(0.02, 0.02, 0.025)
  floorMaterial.update()
  floor.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = floorMaterial
  })

  const beacon = new pc.Entity('fallbackBeacon')
  beacon.addComponent('render', { type: 'box' })
  beacon.setLocalScale(1.1, 1.1, 1.1)
  beacon.setLocalPosition(0, 0.2, 0)

  const beaconMaterial = new pc.StandardMaterial()
  beaconMaterial.diffuse = new pc.Color(1, 0.25, 0.75)
  beaconMaterial.emissive = new pc.Color(0.75, 0.05, 0.45)
  beaconMaterial.emissiveIntensity = 1.8
  beaconMaterial.update()
  beacon.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = beaconMaterial
  })

  modelRoot.addChild(tunnel)
  modelRoot.addChild(floor)
  modelRoot.addChild(beacon)
  markerManager.seedInspectionMarkers()
  frameEntity(modelRoot)
  setModelLoadState('fallback', 'Fallback tunnel scene is active.')
}
