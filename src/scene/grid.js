export function createLineMaterial(pc, color, opacity) {
  const material = new pc.StandardMaterial()
  material.diffuse = color.clone()
  material.emissive = color.clone().mulScalar(0.72)
  material.opacity = opacity
  material.blendType = opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE
  material.useLighting = false
  material.depthWrite = false
  material.update()
  return material
}

function createGridLine(pc, name, scaleX, scaleZ, posX, posZ, material) {
  const line = new pc.Entity(name)
  line.addComponent('render', { type: 'box' })
  line.setLocalScale(scaleX, 0.002, scaleZ)
  line.setPosition(posX, 0.001, posZ)
  line.render.castShadows = false
  line.render.receiveShadows = false
  line.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = material
  })
  return line
}

export function createGrid({ pc, app }) {
  const gridRoot = new pc.Entity('editorGrid')
  const extent = 36
  const majorEvery = 5

  const floor = new pc.Entity('gridFloor')
  floor.addComponent('render', { type: 'box' })
  floor.setLocalScale(extent * 2, 0.001, extent * 2)
  floor.setPosition(0, -0.002, 0)

  const floorMaterial = new pc.StandardMaterial()
  floorMaterial.diffuse = new pc.Color(0.04, 0.06, 0.09)
  floorMaterial.emissive = new pc.Color(0.012, 0.016, 0.022)
  floorMaterial.opacity = 0.94
  floorMaterial.update()
  floor.render.meshInstances.forEach((meshInstance) => {
    meshInstance.material = floorMaterial
  })
  gridRoot.addChild(floor)

  const minorMaterial = createLineMaterial(pc, new pc.Color(0.17, 0.21, 0.27), 0.24)
  const majorMaterial = createLineMaterial(pc, new pc.Color(0.27, 0.33, 0.43), 0.5)
  const xAxisMaterial = createLineMaterial(pc, new pc.Color(0.72, 0.33, 0.33), 0.78)
  const zAxisMaterial = createLineMaterial(pc, new pc.Color(0.36, 0.58, 0.94), 0.78)

  for (let position = -extent; position <= extent; position += 1) {
    let horizontalMaterial = minorMaterial
    let verticalMaterial = minorMaterial
    let thickness = 0.006

    if (position % majorEvery === 0) {
      horizontalMaterial = majorMaterial
      verticalMaterial = majorMaterial
      thickness = 0.012
    }

    if (position === 0) {
      horizontalMaterial = xAxisMaterial
      verticalMaterial = zAxisMaterial
      thickness = 0.018
    }

    gridRoot.addChild(createGridLine(pc, `grid-x-${position}`, extent * 2, thickness, 0, position, horizontalMaterial))
    gridRoot.addChild(createGridLine(pc, `grid-z-${position}`, thickness, extent * 2, position, 0, verticalMaterial))
  }

  app.root.addChild(gridRoot)
  return gridRoot
}
