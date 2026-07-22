export const PANEL_CONTENT = {
  overview: {
    title: 'TunnelSight',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="enter-walk">Enter tunnel view</button>
        <button class="panel-command" type="button" data-panel-action="focus-model">Fit full model</button>
        <button class="panel-command" type="button" data-panel-action="start-vr">Start VR</button>
      </div>
      <p class="panel-note">Use orbit for review, walk mode for close inspection, and measurement mode for point-to-point distances.</p>
    `,
  },
  file: {
    title: 'File',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="open-file-manager">Open file manager</button>
        <button class="panel-command" type="button" data-panel-action="capture-screenshot">Capture screenshot</button>
        <button class="panel-command" type="button" data-panel-action="export-report">Export inspection report</button>
      </div>
    `,
  },
  select: {
    title: 'Select',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="mode-select">Pointer selection</button>
        <button class="panel-command" type="button" data-panel-action="mode-box-select">Box select</button>
        <button class="panel-command" type="button" data-panel-action="select-high">Select high risk</button>
        <button class="panel-command" type="button" data-panel-action="select-visible">Select visible markers</button>
        <button class="panel-command" type="button" data-panel-action="isolate-selection">Isolate selected</button>
        <button class="panel-command" type="button" data-panel-action="clear-selection">Clear selection</button>
      </div>
    `,
  },
  render: {
    title: 'Render',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="render-immersive">Immersive quality</button>
        <button class="panel-command" type="button" data-panel-action="render-balanced">Balanced quality</button>
        <button class="panel-command" type="button" data-panel-action="render-fast">Fast quality</button>
        <button class="panel-command" type="button" data-panel-action="toggle-labels">Toggle labels</button>
        <button class="panel-command" type="button" data-panel-action="capture-screenshot">Capture screenshot</button>
      </div>
    `,
  },
  help: {
    title: 'Help',
    html: `
      <div class="shortcut-grid">
        <span><strong>Mouse drag</strong>Orbit or look around</span>
        <span><strong>Wheel</strong>Zoom in/out</span>
        <span><strong>W A S D</strong>Move in walk mode</span>
        <span><strong>Q / E</strong>Move down/up in walk mode</span>
        <span><strong>Esc</strong>Return to inspect mode</span>
      </div>
    `,
  },
  notes: {
    title: 'Notes',
    html: `
      <textarea id="inspectionNoteInput" class="editor-input panel-textarea" placeholder="Write an inspection note for the selected marker or current view."></textarea>
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="save-note">Save note marker</button>
        <button class="panel-command" type="button" data-panel-action="export-report">Export report</button>
      </div>
    `,
  },
  collaboration: {
    title: 'Collaboration',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command" type="button" data-panel-action="copy-view-state">Copy view state</button>
        <button class="panel-command" type="button" data-panel-action="export-report">Export review package</button>
      </div>
      <p class="panel-note">Guest mode keeps collaboration local to this browser until account roles are connected.</p>
    `,
  },
  filters: {
    title: 'Filters',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="filter-all">Show all severities</button>
        <button class="panel-command danger" type="button" data-panel-action="filter-high">High only</button>
        <button class="panel-command warning" type="button" data-panel-action="filter-medium">Medium only</button>
        <button class="panel-command info" type="button" data-panel-action="filter-warning">Warning only</button>
        <button class="panel-command" type="button" data-panel-action="hide-selected">Hide selected</button>
        <button class="panel-command" type="button" data-panel-action="reveal-all">Reveal all markers</button>
      </div>
    `,
  },
  settings: {
    title: 'Settings',
    html: `
      <div class="panel-control-grid">
        <button class="panel-command primary" type="button" data-panel-action="enter-walk">Walk-through mode</button>
        <button class="panel-command" type="button" data-panel-action="reset-view">Reset view</button>
        <button class="panel-command" type="button" data-panel-action="toggle-layout">Toggle compact layout</button>
        <button class="panel-command" type="button" data-panel-action="toggle-fullscreen">Fullscreen</button>
      </div>
    `,
  },
}
