const loadingOverlay = document.getElementById("loading-overlay");

export function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
  }
}

export function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }
}
