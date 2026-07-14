const INTRO_STORAGE_KEY = 'tunnelsight:guest-intro-accepted'
const DESKTOP_MIN_WIDTH = 960

function hasMobileUserAgent() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)
}

function hasCoarsePrimaryPointer() {
  return window.matchMedia?.('(pointer: coarse)').matches ?? false
}

function isSmallViewport() {
  return Math.min(window.innerWidth, window.innerHeight) < 640 || window.innerWidth < DESKTOP_MIN_WIDTH
}

export function isDesktopWorkspaceDevice() {
  return !hasMobileUserAgent() && !hasCoarsePrimaryPointer() && !isSmallViewport()
}

export function createAccessGate({ dom, onDesktopApproved }) {
  let appStarted = false

  function hideAll() {
    dom.deviceGateEl.hidden = true
    dom.guestOnboardingEl.hidden = true
    document.body.classList.remove('is-access-blocked', 'is-onboarding-visible')
  }

  function showMobileGate() {
    dom.deviceGateEl.hidden = false
    dom.guestOnboardingEl.hidden = true
    document.body.classList.add('is-access-blocked')
    document.body.classList.remove('is-onboarding-visible')
  }

  function showGuestOnboarding() {
    dom.deviceGateEl.hidden = true
    dom.guestOnboardingEl.hidden = false
    document.body.classList.add('is-onboarding-visible')
    document.body.classList.remove('is-access-blocked')
  }

  function startDesktopApp() {
    if (appStarted) {
      hideAll()
      return
    }

    appStarted = true
    hideAll()
    onDesktopApproved()
  }

  function evaluateAccess() {
    if (!isDesktopWorkspaceDevice()) {
      showMobileGate()
      return
    }

    if (appStarted || sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true') {
      startDesktopApp()
      return
    }

    showGuestOnboarding()
  }

  dom.continueAsGuestButton?.addEventListener('click', () => {
    if (dom.rememberGuestIntroInput?.checked) {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true')
    }
    startDesktopApp()
  })

  window.addEventListener('resize', evaluateAccess)
  evaluateAccess()
}
