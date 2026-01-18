    /* =========================
    TRESOR
  ========================= */
function openQuiz(event) {
  event.stopPropagation();
  document.getElementById("quiz").style.display = "block";
}

function closeQuiz(event) {
  if (event.target.id === "quiz") {
    document.getElementById("quiz").style.display = "none";
  }
}

function checkAnswer() {
  const answer = document.getElementById("answer").value.trim();

  if (answer === "42") {
    document.getElementById("quiz").style.display = "none";
    openVault();
  } else {
    document.getElementById("feedback").innerText = "❌ Falsche Antwort";
  }
}

function openVault() {
  document.getElementById("vault").classList.add("open");
  document.getElementById("secretOverlay").style.display = "flex";
}

function closeSecret(event) {
  if (event.target.id === "secretOverlay") {
    document.getElementById("secretOverlay").style.display = "none";
    document.getElementById("vault").classList.remove("open");
  }
}

