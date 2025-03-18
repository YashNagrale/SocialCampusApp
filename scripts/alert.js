export function showAlert(message, type = "info", callback = null) {
    // Remove existing alert if any
    const existingAlert = document.getElementById("custom-alert");
    if (existingAlert) {
      existingAlert.remove();
    }
    // Create alert container
    const alertContainer = document.createElement("div");
    alertContainer.id = "custom-alert";
    alertContainer.className = `fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50`;
  
    // Alert content
    alertContainer.innerHTML = `
      <div class="bg-black space-y-2 border-2 border-[#111112] text-white px-6 py-4 rounded-lg shadow-lg max-w-md w-full text-center">
        <p class="font-semibold text-lg text-start">${message}</p>
        <p class=" text-[#9c9ca4] text-md text-start">Click Continue to proceed.</p>
        <div class="mt-4 flex justify-end gap-4">
          <button id="alert-ok-btn" class="bg-white text-black hover:bg-gray-200 px-4 py-1 rounded-md font-semibold">Continue</button>
        </div>
      </div>
    `;
  
    // Append to body
    document.body.appendChild(alertContainer);
  
    // Handle OK button
    document.getElementById("alert-ok-btn").addEventListener("click", () => {
      alertContainer.remove();
      if (callback) callback(true); // Call callback if provided
    });
  }
  
  // Confirmation popup with two buttons
  export function showConfirm(message, callback) {
    // Remove existing alert if any
    const existingAlert = document.getElementById("custom-alert");
    if (existingAlert) {
      existingAlert.remove();
    }
  
    // Create alert container
    const alertContainer = document.createElement("div");
    alertContainer.id = "custom-alert";
    alertContainer.className = `fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50`;
  
    // Alert content
    alertContainer.innerHTML = `
      <div class="bg-black space-y-2 border-2 border-[#111112] text-white px-6 py-4 rounded-lg shadow-lg max-w-md w-full text-center">
        <p class="font-semibold text-lg text-start">${message}</p>
        <p class=" text-[#9c9ca4] text-md text-start">This action cannot be undone. Are you sure you want to proceed?</p>
        <div class="mt-3 flex justify-end gap-2">
        <button id="alert-cancel-btn" class="border-2 border-[#111112] hover:bg-[#111112] px-4 py-1 rounded-md font-semibold">Cancel</button>
          <button id="alert-confirm-btn" class="bg-white hover:bg-gray-300 px-4 py-1 rounded-md font-semibold text-black">Confirm</button>
        </div>
      </div>
    `;
  
    // Append to body
    document.body.appendChild(alertContainer);
  
    // Handle Confirm button
    document.getElementById("alert-confirm-btn").addEventListener("click", () => {
      alertContainer.remove();
      callback(true);
    });
  
    // Handle Cancel button
    document.getElementById("alert-cancel-btn").addEventListener("click", () => {
      alertContainer.remove();
      callback(false);
    });
  }