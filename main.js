document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const popupBox = popup.querySelector(".popup-box");
  const popupMessage = document.getElementById("popup-message");
  const closeBtn = document.getElementById("close-popup");

  document.querySelectorAll(".flower").forEach((flower) => {
    flower.addEventListener("click", () => {
      popupMessage.textContent = flower.dataset.message;

      // Flower position
      const rect = flower.getBoundingClientRect();
      // console.log(rect);
      // NEW POSITIONING LOGIC
      const left = rect.left - rect.width * 0.2; // center of flower
      const top = rect.top; // a bit above flower

      // Apply directly
      popupBox.style.left = left + "px";
      popupBox.style.top = top + "px";

      popup.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.add("hidden");
    }
  });
});
