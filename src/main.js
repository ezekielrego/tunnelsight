import './style.css'
import { createTunnelSightApp } from './app/tunnelSightApp.js'
import { getDomRefs } from './ui/domRefs.js'

const dom = getDomRefs()

if (!dom.canvas) {
  throw new Error('TunnelSight canvas element #application was not found.')
}

window.tunnelSight = createTunnelSightApp(dom)
window.tunnelSightState = window.tunnelSight.appState
