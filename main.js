document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const popupBox = popup.querySelector(".popup-box");
  const popupMessage = document.getElementById("popup-message");
  const closeBtn = document.getElementById("close-popup");
  let currentAudio = null;
  let lastFlowerRect = null;
  const cssMobileFlagName = '--is-mobile-portrait';
  const fallbackMobileQuery = '(max-width: 480px) and (orientation: portrait)';

  function isMobilePortraitFromCssOrFallback(cssFlag) {
    if (cssFlag) {
      return cssFlag === '1';
    }
    return !!(window.matchMedia && window.matchMedia(fallbackMobileQuery).matches);
  }

  function positionPopup(flowerRect, popupBox) {
      // Calculate position
      // Default: center of flower, slightly above
      let left = flowerRect.left + flowerRect.width / 2;
      let top = flowerRect.top;

      // Get popup dimensions (now that it's visible)
      // We need to briefly remove hidden to measure, but we already did above.
      const boxRect = popupBox.getBoundingClientRect();
      const boxWidth = boxRect.width;
      const boxHeight = boxRect.height;

      // Adjust to center the box horizontally relative to the point
      left -= boxWidth / 2;
      // Adjust to place box above the point
      top -= boxHeight + 20; // 20px padding
      console.log(left, top);

      // Constrain to Viewport
      const padding = 20;
      const viewportWidth = (window.visualViewport && window.visualViewport.width) || document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = (window.visualViewport && window.visualViewport.height) || document.documentElement.clientHeight || window.innerHeight;

      // Determine mobile-portrait from CSS variable single source of truth; fallback to media query
      const cssFlag = getComputedStyle(document.documentElement).getPropertyValue(cssMobileFlagName).trim();
      const isMobilePortrait = isMobilePortraitFromCssOrFallback(cssFlag);

      // Prevent overflow Right
      // If on a narrow mobile in portrait, make the popup full-width (viewport minus padding)
      // Set inline width first, then re-measure height to avoid stale measurements.
      if (isMobilePortrait) {
        const fullWidth = Math.max(0, viewportWidth - padding * 2);
        popupBox.style.width = fullWidth + "px";
        // Re-measure after forcing width
        const newRect = popupBox.getBoundingClientRect();
        const newBoxHeight = newRect.height;
        // pin to left padding (centered because width = viewport - 2*padding)
        left = padding;
        // center vertically in viewport while respecting top padding
        top = Math.max(padding, (viewportHeight - newBoxHeight) / 2);
        return {left, top};
      }
      if (left + boxWidth > viewportWidth - padding) {
        left = viewportWidth - boxWidth - padding;
      }
      // Prevent overflow Left
      if (left < padding) {
        left = padding;
      }
      // Prevent overflow Top
      if (top < padding) {
        // If it goes off top, maybe show it BELOW the flower instead?
        // Let's try to flip it below if top is negative
        const alternativeTop = flowerRect.bottom + 20;
        if (alternativeTop + boxHeight < viewportHeight - padding) {

        } else {
          // If both fail, just pin to top
          top = padding;
        }
      }

      return {left, top};
  }

  document.querySelectorAll(".flower").forEach((flower) => {
    flower.addEventListener("click", () => {
      // 1. Handle Audio - Stop old audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Play new song if data-song exists
      const songSrc = flower.dataset.song;
      if (songSrc) {
        if (!currentAudio) {
          currentAudio = new Audio();
        }
        currentAudio.src = songSrc;
        currentAudio.load();
      }

      // 2. Handle Popup
      popupMessage.textContent = flower.dataset.message;
      popup.classList.remove("hidden");

      // Flower position
      const rect = flower.getBoundingClientRect();
      lastFlowerRect = rect;

      const {left, top} = positionPopup(rect, popupBox);

      popupBox.style.left = left + "px";
      popupBox.style.top = top + "px";

      // Now play the audio
      if (songSrc) {
        currentAudio.play().catch(e => {
          popupMessage.textContent = "Unable to play audio: " + e.message;
        });
      }
    });
  });

  // Global click to pause audio
  document.addEventListener("click", (e) => {
    // If click is NOT on a flower AND NOT inside the popup
    if (!e.target.closest(".flower") && !e.target.closest(".popup-box")) {
      if (currentAudio) {
        currentAudio.pause();
        // Optional: reset time? user asked to "pause", implies resuming might be nice, 
        // but usually for this simple app, pause is just "stop noise".
        // keeping it simple: just pause.
      }
    }
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    if (currentAudio) {
      currentAudio.pause();
    }
    // Clear stored rect and any inline width when closed
    lastFlowerRect = null;
    popupBox.style.width = '';
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.add("hidden");
    }
  });

  // Recompute popup position and clear inline width when viewport changes
  function handleViewportChange() {
    // Clear any forced inline width so CSS rules can apply
    popupBox.style.width = '';
    if (lastFlowerRect && !popup.classList.contains('hidden')) {
      const {left, top} = positionPopup(lastFlowerRect, popupBox);
      popupBox.style.left = left + 'px';
      popupBox.style.top = top + 'px';
    }
  }

  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange);
  }
});
