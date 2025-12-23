function goToTeam() {
  const team = document.getElementById("teamInput").value.trim();
  if (team) {
    window.location.href = `team.html?team=${team}`;
  }
}
