import * as pc from 'playcanvas'

export const MODEL_URL = '/models/positanos_tunnel.glb'
export const MODEL_FILENAME = 'positanos_tunnel.glb'
export const WORKSPACE_QUOTA_BYTES = 512 * 1024 * 1024

export const DEFAULT_MODELS = [
  {
    id: 'positanos',
    name: 'Positanos Tunnel',
    url: '/models/positanos_tunnel.glb',
    filename: 'positanos_tunnel.glb',
  },
  {
    id: 'sample',
    name: 'Sample Tunnel',
    url: '/models/sample-tunnel.glb',
    filename: 'sample-tunnel.glb',
  },
  {
    id: 'tunnel',
    name: 'Tunnel Model',
    url: '/models/tunnel.glb',
    filename: 'tunnel.glb',
  },
]

export const INSPECTION_POINTS = [
  {
    id: 'crown-spall',
    label: 'Crown Spalling - High',
    position: [-2.8, 1.8, -1.2],
    severity: 'High',
    riskScore: 91,
    recommendation: 'Restrict access and schedule immediate structural review.',
  },
  {
    id: 'wall-seepage',
    label: 'Wall Seepage - Medium',
    position: [1.6, 0.8, 2.4],
    severity: 'Medium',
    riskScore: 67,
    recommendation: 'Increase monitoring frequency and verify support integrity.',
  },
  {
    id: 'floor-crack',
    label: 'Invert Crack - Warning',
    position: [3.2, -1.4, -2.2],
    severity: 'Warning',
    riskScore: 54,
    recommendation: 'Run close-range inspection and confirm material stability before access.',
  },
]

export const SEVERITY_COLORS = {
  High: new pc.Color(1, 0.22, 0.18),
  Medium: new pc.Color(1, 0.64, 0.16),
  Warning: new pc.Color(0.35, 0.7, 1),
}

export const ROTATE_CAMERA_MODES = new Set(['inspect', 'orbit', 'rotate', 'scene'])

export const MODE_LABELS = {
  inspect: 'Inspect Mode',
  analysis: 'Analysis Mode',
  scene: 'Scene Mode',
  measure: 'Measurement Mode',
  select: 'Selection Mode',
  orbit: 'Orbit Mode',
  pan: 'Pan Mode',
  annotate: 'Annotation Mode',
  marker: 'Marker Mode',
  highlight: 'Highlight Mode',
  boxSelect: 'Box Select Mode',
  lasso: 'Lasso Mode',
  rotate: 'Rotate Mode',
}

export const MODEL_LOAD_LABELS = {
  idle: 'Idle',
  loading: 'Loading',
  ready: 'Ready',
  fallback: 'Fallback',
  error: 'Error',
}
