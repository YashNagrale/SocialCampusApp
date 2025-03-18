import { db, addDoc, collection, auth } from "./firebase.js";
import { showLoading, hideLoading } from "./loading.js";
import { showAlert } from "./alert.js";

export function showClubCreationPopup(callback = null) {
  // Remove existing popup if any
  const existingPopup = document.getElementById("club-popup");
  if (existingPopup) existingPopup.remove();

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.id = "club-popup";
  popupContainer.className = `fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50`;

  // Popup content
  popupContainer.innerHTML = `
      <div class="bg-black border-2 border-[#27272a] px-5 py-3 rounded-xl w-[90%] max-w-md shadow-lg">
        <h2 class="text-2xl font-semibold text-white mb-4 text-center">Create a Club</h2>

        <!-- Club Image Upload -->
        <label class="block text-lg text-[#5b6768c4] font-medium text-start mb-0.5">Club Image:</label>
        <div id="club-drop-zone" class="relative w-full h-40 bg-[#181818c4] rounded-xl flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-white transition-all duration-300 cursor-pointer">
          <span id="club-upload-text" class="text-gray-400 text-2xl font-semibold text-center">Drag and drop or click to upload</span>
        </div>
        <input type="file" id="club-image" accept="image/*" class="hidden" />

        <!-- Club Name -->
        <div class="mt-4">
          <label class="block text-lg font-medium mb-0.5 text-[#5b6768c4]">Club Name:</label>
          <input type="text" id="club-name" placeholder="Enter club name" class="w-full p-2 bg-black border border-[#27272a] rounded text-white focus:outline-none focus:border-white" required />
        </div>

        <!-- Buttons -->
        <div class="mt-4 flex justify-end gap-4">
          <button id="cancel-club-btn" class="border-2 border-[#111112] hover:bg-[#111112] px-4 py-1 rounded-md font-semibold">Cancel</button>
          <button id="create-club-btn" class="bg-white hover:bg-gray-300 px-4 py-1 rounded-md font-semibold text-black">Create</button>
        </div>
      </div>
    `;

  // Append to body
  document.body.appendChild(popupContainer);

  // Handle cancel button
  document.getElementById("cancel-club-btn").addEventListener("click", () => {
    popupContainer.remove();
  });

  // Handle create button
  document
    .getElementById("create-club-btn")
    .addEventListener("click", async () => {
      const clubName = document.getElementById("club-name").value.trim();
      const clubImage = document.getElementById("club-image").files[0];
      const user = auth.currentUser;

      if (!clubName) {
        showAlert("Club name is required!");
        return;
      }

      try {
        popupContainer.remove();
        showLoading();

        let imageUrl = "";
        if (clubImage) {
          imageUrl = await uploadImageToCloudinary(clubImage);
        }

        // Prepare club data
        const clubData = {
          name: clubName,
          createdAt: new Date(),
          creator: user.displayName,
          createdBy: user.uid,
        };
        if (imageUrl) {
          clubData.imageUrl = imageUrl;
        }

        // Save to Firestore
        await addDoc(collection(db, "clubs"), clubData);

        hideLoading();
        showAlert("Club created successfully!");
        popupContainer.remove();

        // if (callback) callback(clubName, imageUrl);
        if (callback) callback();

      } catch (error) {
        hideLoading();
        console.error("Error creating club:", error);
        showAlert("Failed to create club. Please try again.");
      }
    });

  // Handle drag-and-drop image upload
  const dropZone = document.getElementById("club-drop-zone");
  const fileInput = document.getElementById("club-image");

  dropZone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    document.getElementById("club-upload-text").innerText =
      fileInput.files[0]?.name || "Drag and drop or click to upload";
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-white");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-white");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    document.getElementById("club-upload-text").innerText =
      fileInput.files[0]?.name || "Drag and drop or click to upload";
  });
}

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(file) {
  const cloudinaryUrl =
    "https://api.cloudinary.com/v1_1/dq2my5wtw/image/upload";
  const uploadPreset = "events_image_uploads"; 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error("Image upload failed");
  }
}
