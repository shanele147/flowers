document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const popupBox = popup.querySelector(".popup-box");
  const popupMessage = document.getElementById("popup-message");
  const closeBtn = document.getElementById("close-popup");
  let currentAudio = null;

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
        currentAudio = new Audio(songSrc);
        currentAudio.play().catch(e => console.log("Audio play failed (user interaction needed?):", e));
      }

      // 2. Handle Popup
      popupMessage.textContent = flower.dataset.message;
      popup.classList.remove("hidden");

      // Flower position
      const rect = flower.getBoundingClientRect();

      // Calculate position
      // Default: center of flower, slightly above
      let left = rect.left + rect.width / 2;
      let top = rect.top;

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
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Prevent overflow Right
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
        const alternativeTop = rect.bottom + 20;
        if (alternativeTop + boxHeight < viewportHeight - padding) {
          top = alternativeTop;
        } else {
          // If both fail, just pin to top
          top = padding;
        }
      }

      // Apply directly
      popupBox.style.left = left + "px";
      popupBox.style.top = top + "px";
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
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.add("hidden");
    }
  });
});
