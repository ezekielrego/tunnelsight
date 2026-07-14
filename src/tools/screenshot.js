export function downloadScreenshot({ canvas, setAppState }) {
  setAppState({ screenshotStatus: 'capturing', actionStatus: 'Capturing screenshot' })

  requestAnimationFrame(() => {
    canvas.toBlob((blob) => {
      if (!blob) {
        setAppState({ screenshotStatus: 'error', actionStatus: 'Screenshot failed' })
        return
      }

      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      link.href = URL.createObjectURL(blob)
      link.download = `tunnelsight-${timestamp}.png`
      link.click()
      URL.revokeObjectURL(link.href)
      setAppState({ screenshotStatus: 'ready', actionStatus: 'Screenshot saved' })
    }, 'image/png')
  })
}
