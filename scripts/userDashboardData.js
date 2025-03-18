import {
  db,
  auth,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  onAuthStateChanged,
  query,
  where 
} from "./firebase.js";
import { showLoading, hideLoading } from "./loading.js";
import { showConfirm } from "./alert.js";

const eventsSection = document.getElementById("dashboard_events");
const eventsTableBody = document.querySelector("#events_data tbody");
const totalEventsCount = document.querySelector("#total_events_count")

// Fetch and display events created by the logged-in user
async function fetchUserEvents(user) {
  if (!user) {
    eventsTableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-gray-400">User not logged in</td></tr>`;
    hideLoading();
    return;
  }


  showLoading();

  try {
    const q = collection(db, "events");
    const querySnapshot = await getDocs(q);

    

    let userEvents = querySnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));


    // Filter events by logged-in user
    userEvents = userEvents.filter(
      (event) => event.createdBy === user.displayName
    );


    hideLoading();

    if (userEvents.length === 0) {
      eventsSection.innerHTML = `<span
              id="upload-text"
              class="text-gray-400 text-3xl font-bold text-center"
              >No Events Created</span
            >`
            eventsSection.classList.add("flex", "items-center", "justify-center")
      eventsTableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-gray-400">No events found</td></tr>`;
      return;
    }
    eventsSection.classList.remove("flex", "items-center", "justify-center")

    eventsSection.innerHTML = "";
    eventsTableBody.innerHTML = "";

    userEvents.forEach(
      ({ id, name, description, createdAt, image, clickCount }) => {
        // Create Event Card
        const eventCard = document.createElement("div");
        eventCard.className = "event-card border-b-2 border-[#27272a] p-4";
        eventCard.innerHTML = `
                <div class="flex w-full justify-start items-end gap-x-3">
                    <img src="${
                      image || "/assets/dummy-img.jpg"
                    }" alt="Event Image"
                        class="rounded-xl" style="object-fit: cover; width: 100px; height: 100px">
                    <div class="flex w-full items-end justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-1">Title: ${name}</h3>

                            <p class="text-md text-gray-500">Created At: ${new Date(
                              createdAt
                            )
                              .toLocaleDateString("en-GB")
                              .replace(/\//g, "-")}</p>
                        </div>
                        <button class="bg-red-600 text-white font-semibold py-1 px-3 rounded hover:bg-red-700"
                            onclick="deleteEvent('${id}')">Delete</button>
                    </div>
                </div>
                <p class="event-desc text-md text-gray-400 pt-2">
                    <span style="color: white">Description: </span>${description}
                </p>
            `;
        eventsSection.appendChild(eventCard);
        totalEventsCount.textContent = document.querySelectorAll(".event-card").length

        // Add Event to Table
        const tableRow = document.createElement("tr");
        tableRow.classList.add("border-b", "border-gray-700", "text-ellipsis")
        tableRow.innerHTML = `
    <td class="py-2 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis">${name}</td>
    <td class="py-2 text-end">${clickCount || 0}</td>
`;

        eventsTableBody.appendChild(tableRow);
      }
    );

  } catch (error) {
    hideLoading();
    eventsTableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-red-500">Error loading events</td></tr>`;
  }
}


// Delete Event
window.deleteEvent = async function (eventId) {
  showConfirm("Are you sure you want to delete this event?", async (confirmed) => {
    if (confirmed) {
      showLoading();
      try {
        await deleteDoc(doc(db, "events", eventId));
        fetchUserEvents(auth.currentUser); // Refresh UI after deletion
      } catch (error) {
        console.error("Error deleting event:", error);
      } finally {
        hideLoading();
      }
    }
  });
};



async function fetchClubDetails(clubId, totalClubs) {
  if (!clubId) return;

  try {
    const clubRef = doc(db, "clubs", clubId);
    const clubDoc = await getDoc(clubRef);

    if (clubDoc.exists()) {
      const clubData = clubDoc.data();
      const memberCount = Array.isArray(clubData.members) ? clubData.members.length : 0;

      updateClubTable(clubData.name, memberCount, totalClubs);
    }
  } catch (error) {
    console.error("Error fetching club details:", error);
  }
}

// ✅ Function to update the UI (club table)
function updateClubTable(clubName, memberCount, totalClubs) {
  const tableBody = document.getElementById("club_table_body");
  const noDataRow = document.getElementById("no_club_data_row");
  const totalClubsCount = document.getElementById("total_clubs_count");

  if (!tableBody) return;
  if (noDataRow) noDataRow.remove();

  // ✅ Update total clubs count
  if (totalClubsCount) totalClubsCount.textContent = totalClubs;

  // ✅ Create a new row for the club
  const newRow = document.createElement("tr");
  newRow.classList.add("border-b", "border-gray-700", "text-ellipsis");
  newRow.innerHTML = `
    <td class="py-2 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis">${clubName}</td>
    <td class="text-end py-2">${memberCount}</td>
  `;

  tableBody.appendChild(newRow);
}



function fetchUserClubs() {

  // ✅ Ensure Firebase Auth has loaded
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.error("❌ No user logged in!");
      return;
    }

    const userId = user.uid; // ✅ Get logged-in user UID

    try {
      // ✅ Query only clubs created by this user
      const clubsRef = collection(db, "clubs");
      const querySnapshot = await getDocs(query(clubsRef, where("createdBy", "==", userId)));

      const totalClubs = querySnapshot.size; // ✅ Count total clubs

      querySnapshot.forEach((doc) => fetchClubDetails(doc.id, totalClubs));
    } catch (error) {
      console.error("❌ Error fetching user clubs:", error);
    }
  });
}

// ✅ Call function to fetch user-created clubs
fetchUserClubs();


onAuthStateChanged(auth, (user) => {
  fetchUserEvents(user);
});
  