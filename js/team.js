// js/team.js
import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc,
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Get team number from URL
const params = new URLSearchParams(window.location.search);
const teamNumber = params.get("team");

// References
const teamRef = doc(db, "teams", teamNumber);

// Elements
const teamTitle = document.getElementById("teamTitle");
const teamHeader = document.getElementById("teamHeader");
const robotNotesInput = document.getElementById("robotNotes");
const matchesDiv = document.getElementById("matches");
const averagesP = document.getElementById("averages");

// Set header and title
teamTitle.innerText = `Team ${teamNumber}`;
teamHeader.innerText = `Team ${teamNumber}`;

// Auto-resize for cross-browser
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

robotNotesInput.addEventListener('input', () => autoResizeTextarea(robotNotesInput));

// Load team and matches
async function loadTeam() {
  const snap = await getDoc(teamRef);

  if (!snap.exists()) {
    await setDoc(teamRef, {
      teamName: `Team ${teamNumber}`,
      robotNotes: ""
    });
  } else {
    robotNotesInput.value = snap.data().robotNotes || "";
  }
  robotNotesInput.value = snap.data().robotNotes || "";
  autoResizeTextarea(robotNotesInput); // adjust height on load

  loadMatches();
}

// Save robot notes
window.saveRobotNotes = async function () {
  await setDoc(teamRef, {
    robotNotes: robotNotesInput.value
  }, { merge: true });
};

// Load matches
async function loadMatches() {
  const q = query(
    collection(db, "matches"),
    where("teamNumber", "==", teamNumber)
  );

  const snap = await getDocs(q);
  matchesDiv.innerHTML = "";

  const matches = [];
  let autoSum = 0;
  let teleopSum = 0;

  snap.forEach(d => matches.push(d.data()));

  // Sort by match number
  matches.sort((a, b) => a.matchNumber - b.matchNumber);

  matches.forEach(m => {
    autoSum += Number(m.autoScore);
    teleopSum += Number(m.teleopScore);

    matchesDiv.innerHTML += `
      <div>
        <b>Match ${m.matchNumber}</b> —
        Auto: ${m.autoScore},
        Teleop: ${m.teleopScore}
        <br>${m.notes}
      </div>
    `;
  });

  if (matches.length > 0) {
    averagesP.innerText = `Avg Auto: ${(autoSum/matches.length).toFixed(1)} | Avg Teleop: ${(teleopSum/matches.length).toFixed(1)}`;
  } else {
    averagesP.innerText = "";
  }
}

// Add or overwrite match
window.addMatch = async function () {
  if (typeof(document.getElementById("matchNumber")) == "number" && typeof(document.getElementById("autoScore")) == "number" && typeof(document.getElementById("teleopScore")) == "number") {
    const matchNumber = document.getElementById("matchNumber").value.trim();
    if (!matchNumber) return;

    const matchId = `${teamNumber}_${matchNumber}`;

    await setDoc(doc(db, "matches", matchId), {
      teamNumber,
      matchNumber,
      autoScore: Number(document.getElementById("autoScore").value),
      teleopScore: Number(document.getElementById("teleopScore").value),
      notes: document.getElementById("matchNotes").value
    });

    // Clear input fields after saving
    document.getElementById("matchNumber").value = "";
    document.getElementById("autoScore").value = "";
    document.getElementById("teleopScore").value = "";
    document.getElementById("matchNotes").value = "";

    loadMatches();
  }
};

// Initialize
loadTeam();
