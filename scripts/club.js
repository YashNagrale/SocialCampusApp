import {
  db,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  auth,
} from "./firebase.js";
import { showLoading, hideLoading } from "./loading.js";
import { showAlert, showConfirm } from "./alert.js";
import { showClubCreationPopup } from "./clubcreation.js";

const createClubBtn = document.getElementById("createClubBtn");
const clubListContainer = document.getElementById("clubList");
const chatArea = document.getElementById("chatArea");
const chatTitle = document.getElementById("chatTitle");
const memberCount = document.getElementById("memberCount");
const joinBtn = document.getElementById("joinBtn");
const messagesArea = document.getElementById("messagesArea");
const messageInputArea = document.getElementById("messageInputArea");
const messageInput = document.getElementById("messageInput");

let currentClubId = null;

createClubBtn.addEventListener("click", () => {
  showClubCreationPopup(fetchAndDisplayClubs);
});

// async function fetchAndDisplayClubs() {
//   showLoading();
//   clubListContainer.innerHTML = `<p class="text-gray-400 text-center">Loading clubs...</p>`;

//   try {
//     const querySnapshot = await getDocs(collection(db, "clubs"));
//     clubListContainer.innerHTML = "";

//     if (querySnapshot.empty) {
//       clubListContainer.innerHTML = `<p class="text-gray-400 text-center">No clubs available</p>`;
//     } else {
//       querySnapshot.forEach((doc) => {
//         const clubData = doc.data();

//         const clubElement = document.createElement("div");
//         clubElement.className =
//           "flex items-center justify-between p-2 cursor-pointer hover:bg-[#111111] rounded-md ";

//         clubElement.innerHTML = `
//           <div class="flex items-center">
//             <img src="${
//               clubData.imageUrl || "../assets/dummy-img.jpg"
//             }" class="w-10 h-10 rounded-full object-cover" />
//             <div class="ml-3">
//               <p class="text-white">${clubData.name}</p>
//               <p class="text-gray-400 text-sm">Creator: @${clubData.creator}</p>
//             </div>
//           </div>
//           <button class="text-white hover:text-red-500 delete-btn"><i class="fa-solid fa-trash"></i></button>
//         `;

//         clubElement
//           .querySelector(".delete-btn")
//           .addEventListener("click", (e) => {
//             e.stopPropagation(); // Prevent event bubbling
//             deleteClub(doc.id);
//           });

//         clubElement.addEventListener("click", () => openClubChat(doc.id));
//         clubListContainer.appendChild(clubElement);
//       });
//     }
//   } catch (error) {
//     showAlert("Failed to load clubs!");
//     console.error("Error fetching clubs:", error);
//   } finally {
//     hideLoading();
//   }
// }

async function fetchAndDisplayClubs() {
  showLoading();
  clubListContainer.innerHTML = `<p class="text-gray-400 text-center">Loading clubs...</p>`;

  try {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    clubListContainer.innerHTML = "";

    if (querySnapshot.empty) {
      clubListContainer.innerHTML = `<p class="text-gray-400 text-center">No clubs available</p>`;
    } else {
      const user = auth.currentUser;
      if (!user) return; // Ensure user is logged in

      querySnapshot.forEach((doc) => {
        const clubData = doc.data();
        const isOwner = clubData.createdBy === user.uid;

        const clubElement = document.createElement("div");
        clubElement.className =
          "flex items-center justify-between p-2 cursor-pointer hover:bg-[#111111] rounded-md ";

        clubElement.innerHTML = `
          <div class="flex items-center">
            <img src="${clubData.imageUrl || "../assets/dummy-img.jpg"}" 
                 class="w-10 h-10 rounded-full object-cover" />
            <div class="ml-3">
              <p class="text-white">${clubData.name}</p>
              <p class="text-gray-400 text-sm">Creator: @${clubData.creator}</p>
            </div>
          </div>
          ${
            isOwner
              ? `<button class="text-white hover:text-red-500 delete-btn">
            <i class="fa-solid fa-trash"></i>
          </button>`
              : ""
          }
        `;

        if (isOwner) {
          clubElement
            .querySelector(".delete-btn")
            .addEventListener("click", (e) => {
              e.stopPropagation(); // Prevent event bubbling
              deleteClub(doc.id);
            });
        }

        clubElement.addEventListener("click", () => openClubChat(doc.id));
        clubListContainer.appendChild(clubElement);
      });
    }
  } catch (error) {
    showAlert("Failed to load clubs!");
    console.error("Error fetching clubs:", error);
  } finally {
    hideLoading();
  }
}

async function openClubChat(clubId) {
  showLoading();
  try {
    const clubDoc = await getDoc(doc(db, "clubs", clubId));
    if (!clubDoc.exists()) {
      showAlert("Club not found!");
      return;
    }

    currentClubId = clubId;
    const clubData = clubDoc.data();
    chatTitle.textContent = clubData.name;
    memberCount.textContent = `Members: ${
      clubData.members ? clubData.members.length : 0
    }`;
    chatArea.classList.remove("hidden");

    // Hide "Click on a club to view messages"
    const noChatMessage = document.getElementById("chatArea");
    if (noChatMessage) noChatMessage.style.display = "none";

    const user = auth.currentUser;
    if (!user) {
      showAlert("You need to log in first!");
      return;
    }

    // Ensure `ownerId` exists in Firestore document
    const isOwner = clubData.createdBy && clubData.createdBy === user.uid;

    if (isOwner) {
      joinBtn.classList.add("hidden");
      messageInputArea.classList.remove("hidden"); // Owner can send messages
    } else {
      joinBtn.classList.remove("hidden");

      const isMember = clubData.members && clubData.members.includes(user.uid);
      if (isMember) {
        joinBtn.textContent = "Leave Club";
        joinBtn.onclick = () => leaveClub(clubId);
        messageInputArea.classList.remove("hidden");
      } else {
        joinBtn.textContent = "Join Club";
        joinBtn.onclick = () => joinClub(clubId);
        messageInputArea.classList.add("hidden");
      }
    }

    fetchMessages(clubId);
  } catch (error) {
    showAlert("Failed to open club chat!");
    console.error("Error opening club chat:", error);
  } finally {
    hideLoading();
  }
}

function resetChatView() {
  chatArea.classList.add("hidden");
  const noChatMessage = document.getElementById("no-chat-message");
  if (noChatMessage) noChatMessage.style.display = "block"; // Show it again
}

async function joinClub(clubId) {
  showLoading();
  try {
    const user = auth.currentUser;
    if (!user) {
      showAlert("You need to log in first!");
      return;
    }

    const clubRef = doc(db, "clubs", clubId);
    const clubDoc = await getDoc(clubRef);

    if (!clubDoc.exists()) {
      showAlert("Club not found!");
      return;
    }

    let clubData = clubDoc.data();
    let updatedMembers = clubData.members
      ? [...clubData.members, user.uid]
      : [user.uid];

    await updateDoc(clubRef, { members: updatedMembers });

    // ✅ Update UI instantly
    joinBtn.textContent = "Leave Club";
    joinBtn.onclick = () => leaveClub(clubId);
    memberCount.textContent = `Members: ${updatedMembers.length}`;
    messageInputArea.classList.remove("hidden");
    messageInput.disabled = false;
    sendBtn.disabled = false;
  } catch (error) {
    showAlert("Failed to join the club!");
    console.error("Error joining club:", error);
  } finally {
    hideLoading();
  }
}

async function leaveClub(clubId) {
  showLoading();
  try {
    const user = auth.currentUser;
    if (!user) {
      showAlert("You need to log in first!");
      return;
    }

    const clubRef = doc(db, "clubs", clubId);
    const clubDoc = await getDoc(clubRef);

    if (!clubDoc.exists()) {
      showAlert("Club not found!");
      return;
    }

    let clubData = clubDoc.data();
    let updatedMembers = clubData.members.filter((id) => id !== user.uid);

    await updateDoc(clubRef, { members: updatedMembers });

    // ✅ Update UI instantly
    joinBtn.textContent = "Join Club";
    joinBtn.onclick = () => joinClub(clubId);
    memberCount.textContent = `Members: ${updatedMembers.length}`;
    messageInputArea.classList.add("hidden");
    messageInput.disabled = true;
    sendBtn.disabled = true;
  } catch (error) {
    showAlert("Failed to leave the club!");
    console.error("Error leaving club:", error);
  } finally {
    hideLoading();
  }
}

// Delete Club

async function deleteClub(clubId) {
  showConfirm(
    "Are you sure you want to delete this club?",
    async (confirmed) => {
      if (!confirmed) return;

      showLoading();
      try {
        await deleteDoc(doc(db, "clubs", clubId));
        showAlert("Club deleted successfully!");

        // Simply refresh the page after deletion
        location.reload();
      } catch (error) {
        showAlert("Failed to delete club!");
        console.error("Error deleting club:", error);
      } finally {
        hideLoading();
      }
    }
  );
}


let unsubscribeMessages = null; // Store listener to detach later

async function fetchMessages(clubId) {
  messagesArea.innerHTML =
    '<p class="text-gray-400 text-center">Loading messages...</p>';

  // If there's an active listener, unsubscribe before attaching a new one
  if (unsubscribeMessages) unsubscribeMessages();

  try {
    const messagesRef = collection(db, "clubs", clubId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      messagesArea.innerHTML = ""; // Clear UI before updating

      if (snapshot.empty) {
        messagesArea.innerHTML =
          '<p class="text-gray-400 text-center">No messages yet</p>';
        return;
      }

      snapshot.forEach((doc) => {
        appendMessageToUI({ id: doc.id, ...doc.data() });
      });

      messagesArea.scrollTop = messagesArea.scrollHeight; // Auto-scroll to latest message
    });
  } catch (error) {
    showAlert("Failed to load messages!");
    console.error("Error fetching messages:", error);
  }
}



let isSending = false; // Prevent duplicate sends

async function sendMessage() {
  if (isSending) return; // Prevent multiple calls
  isSending = true;
  sendBtn.disabled = true; // Disable button while sending

  const messageText = messageInput.value.trim();
  if (!messageText) {
    isSending = false;
    sendBtn.disabled = false;
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showAlert("You need to log in first!");
    isSending = false;
    sendBtn.disabled = false;
    return;
  }

  if (!currentClubId) {
    showAlert("Error: No club selected.");
    isSending = false;
    sendBtn.disabled = false;
    return;
  }

  
  const tempMessage = {
    text: messageText,
    sender: user.displayName || "User",
    timestamp: "Sending...", // Placeholder text
    id: `temp-${Date.now()}`, // Temporary ID
  };

  appendMessageToUI(tempMessage);
  messageInput.value = ""; // Clear input

  try {
    const docRef = await addDoc(collection(db, "clubs", currentClubId, "messages"), {
      text: messageText,
      sender: user.displayName || "User",
      timestamp: serverTimestamp(),
    });

    // ✅ Listen for Firestore update and replace "Sending..." with actual time
    const messageDoc = doc(db, "clubs", currentClubId, "messages", docRef.id);
    const unsubscribe = onSnapshot(messageDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.timestamp?.seconds) {
          const updatedMessage = {
            id: docRef.id,
            text: data.text,
            sender: data.sender,
            timestamp: new Date(data.timestamp.seconds * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };

          replaceMessageInUI(tempMessage.id, updatedMessage);
          unsubscribe(); // Stop listening after update
        }
      }
    });

  } catch (error) {
    showAlert("Failed to send message. Try again!");
    console.error("Error sending message:", error);
  }

  isSending = false;
  sendBtn.disabled = false; // Re-enable button
}

// ✅ Replace "Sending..." with real timestamp once Firestore updates
function replaceMessageInUI(tempId, realMessage) {
  const tempMessageElement = document.getElementById(tempId);
  if (tempMessageElement) {
    tempMessageElement.id = realMessage.id; // Update ID
    tempMessageElement.querySelector(".message-time").textContent = realMessage.timestamp;
  }
}

// Prevent multiple event listener attachments
sendBtn.removeEventListener("click", sendMessage);
sendBtn.addEventListener("click", sendMessage);

messageInput.removeEventListener("keypress", handleKeyPress);
messageInput.addEventListener("keypress", handleKeyPress);

function handleKeyPress(e) {
  if (e.key === "Enter") sendMessage();
}




function getAvatarColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
}

function appendMessageToUI(message) {
  const isCurrentUser =
    auth.currentUser && message.sender === auth.currentUser.displayName;
  const avatarColor = getAvatarColor(message.sender);

  const messageContainer = document.createElement("div");
  messageContainer.className = `flex items-start ${
    isCurrentUser ? "justify-end" : ""
  }`;
  messageContainer.id = message.id;

  messageContainer.innerHTML = `
    ${
      !isCurrentUser
        ? `<div class="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold mr-2" style="background-color: ${avatarColor};">${message.sender
            .charAt(0)
            .toUpperCase()}</div>`
        : ""
    }
    
    <div class="max-w-72 min-w-32 ${
      isCurrentUser ? "bg-white" : "bg-[#121315]"
    } px-2 rounded-lg relative group">
      <p class="text-sm font-semibold text-left" style="color: ${avatarColor};">@${
    message.sender
  }</p>
      <p class="text-md ${isCurrentUser ? "text-black" : "text-white"}">${
    message.text
  }</p>
      <p class="text-xs text-gray-500 text-right">${new Date(
        message.timestamp?.seconds * 1000
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}</p>
      ${
        isCurrentUser
          ? `<button class="absolute top-0 right-0 hidden group-hover:block text-red-500 text-xs p-1 rounded" onclick="deleteMessage('${message.id}')"><i class="fa-solid fa-trash"></i></button>`
          : ""
      }
    </div>

    ${
      isCurrentUser
        ? `<div class="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ml-2" style="background-color: ${avatarColor};">${message.sender
            .charAt(0)
            .toUpperCase()}</div>`
        : ""
    }
  `;

  messagesArea.appendChild(messageContainer);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

async function deleteMessage(messageId) {
  try {
    const messageElement = document.getElementById(messageId);
    if (!messageElement) return;

    messageElement.style.opacity = "0.5";
    await deleteDoc(doc(db, "clubs", currentClubId, "messages", messageId));
    messageElement.remove();
  } catch (error) {
    showAlert("Failed to delete message!");
    console.error("Error deleting message:", error);
  }
}

window.deleteMessage = deleteMessage;
fetchAndDisplayClubs();
