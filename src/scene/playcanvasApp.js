import * as pc from 'playcanvas'

export function createPlayCanvasApp(canvas) {
  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    graphicsDeviceOptions: {
      preserveDrawingBuffer: true,
    },
  })

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW)
  app.setCanvasResolution(pc.RESOLUTION_AUTO)
  window.addEventListener('resize', () => app.resizeCanvas())
  app.start()

  app.scene.ambientLight = new pc.Color(0.25, 0.25, 0.3)

  const camera = new pc.Entity('camera')
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.03, 0.07, 0.12),
    fov: 58,
  })
  camera.setPosition(0, 2, 8)
  app.root.addChild(camera)

  const light = new pc.Entity('light')
  light.addComponent('light', {
    type: 'directional',
    intensity: 1.6,
    castShadows: true,
  })
  light.setEulerAngles(45, 30, 0)
  app.root.addChild(light)

  const modelRoot = new pc.Entity('modelRoot')
  app.root.addChild(modelRoot)

  return { pc, app, camera, light, modelRoot }
}
