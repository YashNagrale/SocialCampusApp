import {
  auth,
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  increment,
} from "./firebase.js";
import { showLoading, hideLoading } from "./loading.js";
import { showAlert, showConfirm } from "./alert.js";
// Function to upload image to Cloudinary
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "events_image_uploads");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dq2my5wtw/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) throw new Error("Image upload failed.");

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

// Handle Event Posting
const postForm = document.getElementById("post-event-form");
const eventError = document.getElementById("eventError");
const previewDescp = document.getElementById("preview-description");
const previewTitle = document.getElementById("preview-title");
const imagePreview = document.getElementById("image-preview");

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading();

    const eventTitle = document.getElementById("event-title").value.trim();
    const eventDescription = document
      .getElementById("event-description")
      .value.trim();
    const eventImage = document.getElementById("event-image").files[0];

    if (!eventTitle || !eventDescription) {
      eventError.textContent = "Please fill all fields.";
      hideLoading();
      return;
    }

    try {
      let imageUrl = "../assets/dummy-img.jpg"; // Default image

      if (eventImage) {
        imageUrl = await uploadImageToCloudinary(eventImage);
      }

      const user = auth.currentUser;
      if (!user) {
        eventError.textContent = "You must be logged in to post an event.";
        hideLoading();
        return;
      }

      await addDoc(collection(db, "events"), {
        name: eventTitle,
        description: eventDescription,
        image: imageUrl,
        createdBy: user.displayName || "Unknown User",
        createdAt: new Date().toISOString(),
        clickCount: 0,
      });

      showAlert("Event posted successfully!");
      postForm.reset();
      previewTitle.textContent = "Event Title";
      previewDescp.textContent = "Event Description";
      imagePreview.src = "../assets/dummy-img.jpg";
      eventError.textContent = "";
    } catch (error) {
      console.error("Error posting event:", error);
      eventError.textContent = `Failed to post event. Try again. ${error.message}`;
    }

    hideLoading();
  });
}

// Fetch and Display Events
const eventSection = document.getElementById("event-section");

if (eventSection) {
  document.addEventListener("DOMContentLoaded", async () => {
    if (!eventSection) {
      console.error("Error: #event-section not found!");
      return;
    }

    showLoading();
    async function fetchPostedEvents() {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        let eventHTML = "";

        querySnapshot.forEach((doc) => {
          const eventData = doc.data();

          const createdAt = eventData.createdAt
            ? new Date(eventData.createdAt)
                .toLocaleDateString("en-GB")
                .replace(/\//g, "-")
            : "Unknown Date";

          eventHTML += `
        <div class="event-card border-2 border-[#27272a] rounded-xl p-4">
                  <div
                    class="flex w-full justify-start items-end px-0 transition-all duration-300 gap-x-3"
                  >
                    <img style="object-fit:cover; width:150px; height:150px;" class="rounded-xl" src="${
                      eventData.image || "../assets/dummy-img.jpg"
                    }" alt="Event Image">

                    <div class="flex w-full items-end justify-between">
                    <div>
                      <h3 class="text-3xl font-semibold text-white mb-1">Title:  ${
                        eventData.name
                      }</h3>
                      <p class="text-md text-gray-500">Posted by: @${
                        eventData.createdBy || "Unknown User"
                      }</p>
                      <p class="text-md text-gray-500">Created At: ${createdAt}</p>
                    </div>

                    <a href="../pages/registerForm.html">
                    <button class="register-btn bg-white text-black font-semibold py-1 px-3 rounded hover:bg-gray-200" 
                    data-event-id="${doc.id}" 
                    data-created-by="${eventData.createdBy}">
                    Register
                    </button>
                    </a>
                    </div>
                  </div>
                          <p class="event-desc text-md text-gray-400 pt-2"><span style="color:white;">Description: </span> ${
                            eventData.description
                          }</p>

                         
        </div>          
          `;
        });
        

        document.getElementById("event-section").innerHTML += eventHTML;
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      hideLoading();
    }

    fetchPostedEvents();
  });
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("register-btn")) {
    const eventId = e.target.getAttribute("data-event-id");
    const eventCreator = e.target.getAttribute("data-created-by");

    const user = auth.currentUser;
    if (!user) {
      showAlert("You must be logged in to register.");
      return;
    }

    if (user.displayName === eventCreator) {
      // alert("You cannot register for your own event.");
      showAlert("You cannot register for your own event.", "warning");
      return;
    }

    showLoading(); // Start loading

    try {
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        showAlert("Event not found!");
        return;
      }

      const eventData = eventSnap.data();
      const registeredUsers = eventData.registeredUsers || [];

      if (registeredUsers.includes(user.uid)) {
        showAlert("You have already registered for this event.");
      } else {
        await updateDoc(eventRef, {
          clickCount: increment(1),
          registeredUsers: [...registeredUsers, user.uid], // Add user UID to the array
        });
        showAlert("Registered successfully!");
        // try {
        //   const querySnapshot = await getDocs(collection(db, "events"));
          
        //   querySnapshot.forEach(doc => {
        //     // if (doc.id === "gWxzIctTTwCYslJOfqib") {
        //       showConfirm("Click to confirm to register.", (confirmed) => {
        //         if (confirmed) {
        //           location.href = "../pages/registerForm.html";
        //         } else {
        //           console.log("User cancelled: false");
        //         }
        //       });
        //     // }
        //   });
        
        // } catch (error) {
        //   showAlert("Some error occurred");
        // }
        
        
      }
    } catch (error) {
      console.error("Error updating click count:", error);
    } finally {
      hideLoading(); // Stop loading
    }
  }
});
