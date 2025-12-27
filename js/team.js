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
  let param1Sum = 0;
  let param2Sum = 0;
  let team = "red";

  snap.forEach(d => matches.push(d.data()));

  // Sort by match number
  matches.sort((a, b) => a.matchNumber - b.matchNumber);

  matches.forEach(m => {
    param1Sum += Number(m.param1);
    param2Sum += Number(m.param2);
    team = m.team;

    matchesDiv.innerHTML += `
      <div>
        <b style="color: ${m.team}">Match ${m.matchNumber}</b> —
        Parameter 1: ${m.param1},
        Parameter 2: ${m.param2}
        <br>${m.notes}
        <p></p>
      </div>
    `;
  });

  if (matches.length > 0) {
    averagesP.innerText = `Avg Parameter 1: ${(param1Sum/matches.length).toFixed(1)} | Avg Parameter 2: ${(param2Sum/matches.length).toFixed(1)}`;
  } else {
    averagesP.innerText = "";
  }
}

// Add or overwrite match
window.addMatch = async function () {
  const matchNumber = document.getElementById("matchNumber").value.trim();
  const param1Val = document.getElementById("param1").value.trim();
  const param2Val = document.getElementById("param2").value.trim();
  const teamColor = document.getElementById("team").value;

  // Validate inputs
  if (!matchNumber || isNaN(param1Val) || isNaN(param2Val)) {
    alert("Please enter a valid match number, param1, and param2");
    return;
  }

  const matchId = `${teamNumber}_${matchNumber}`;

  await setDoc(doc(db, "matches", matchId), {
    teamNumber,
    matchNumber,
    param1: Number(param1Val),
    param2: Number(param2Val),
    team: String(teamColor),
    notes: document.getElementById("matchNotes").value
  });

  // Clear input fields after saving
  document.getElementById("matchNumber").value = "";
  document.getElementById("param1").value = "";
  document.getElementById("param2").value = "";
  document.getElementById("matchNotes").value = "";

  loadMatches();
};

// Initialize
loadTeam();
