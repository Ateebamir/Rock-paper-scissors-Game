// ======= State =======
let player1Choice = null;
let player2Choice = null;
let userScore = 0;
let compScore = 0;
let currentPlayer = 1;
let gameMode = "human-vs-human";
let player1Name = "";
let player2Name = "";
let gameOver = false;
let targetWins = 3; // for "best of 5" by default
let history = [];

// ======= DOM =======
const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");

const userScorePara = document.querySelector("#user-score");
const compScorePara = document.querySelector("#comp-score");

const player1Label = document.querySelector("#player1-label");
const player2Label = document.querySelector("#player2-label");

const startGameButton = document.querySelector("#start-game");
const player1Input = document.querySelector("#player1-name");
const player2Input = document.querySelector("#player2-name");
const gameModeSelect = document.querySelector("#game-mode");
const roundsSelect = document.querySelector("#rounds");
const bestofLabel = document.querySelector("#bestof-label");

const soundToggle = document.querySelector("#sound-toggle");
const delayToggle = document.querySelector("#delay-toggle");

const scoreBoard = document.querySelector(".score-board");
const choicesWrap = document.querySelector(".choices");
const historyWrap = document.querySelector(".history");
const historyList = document.querySelector("#history-list");
const clearHistoryBtn = document.querySelector("#clear-history");

const resetRoundBtn = document.querySelector("#reset-round");
const newMatchBtn = document.querySelector("#new-match");
const controlsWrap = document.querySelector(".controls");

// ======= Utils =======
const setActiveTurn = () => {
  player1Label.classList.toggle("active", currentPlayer === 1);
  player2Label.classList.toggle("active", currentPlayer === 2);
};

const calcTargetWins = (bestOf) => Math.ceil(bestOf / 2);

const playTone = (type = "click") => {
  if (!soundToggle.checked) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.type = type === "win" ? "triangle" : type === "lose" ? "sawtooth" : "square";
  o.frequency.value = type === "win" ? 880 : type === "lose" ? 140 : 320;
  g.gain.value = 0.04;
  o.start();
  setTimeout(() => { g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18); o.stop(ctx.currentTime + 0.2); }, 120);
};

const launchConfetti = () => {
  if (typeof confetti !== "function") return;
  const duration = 900;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 9, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 9, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

const updateBestOfUI = () => {
  const best = Number(roundsSelect.value);
  targetWins = calcTargetWins(best);
  bestofLabel.textContent = `Best of ${best} • First to ${targetWins}`;
};

// Add to history (keep last 6)
const pushHistory = (text, result) => {
  history.unshift({ text, result }); // latest on top
  if (history.length > 6) history.pop();
  renderHistory();
};
const renderHistory = () => {
  historyList.innerHTML = "";
  history.forEach((h) => {
    const li = document.createElement("li");
    const badge = document.createElement("span");
    badge.className = `badge ${h.result}`;
    badge.textContent = h.result.toUpperCase();
    li.innerHTML = `<span>${h.text}</span>`;
    li.appendChild(badge);
    historyList.appendChild(li);
  });
};

// ======= Setup =======
const setupGame = () => {
  // names & mode
  player1Name = player1Input.value.trim() || "Player 1";
  const rawP2 = player2Input.value.trim() || "Player 2";
  gameMode = gameModeSelect.value;
  player2Name = gameMode === "human-vs-computer" ? "Computer" : rawP2;

  // labels
  player1Label.textContent = player1Name;
  player2Label.textContent = player2Name;

  // rounds target
  updateBestOfUI();

  // reset match
  userScore = 0; compScore = 0;
  userScorePara.textContent = userScore;
  compScorePara.textContent = compScore;
  history = []; renderHistory();

  // show UI
  document.querySelector(".player-setup").style.display = "none";
  scoreBoard.style.display = "grid";
  choicesWrap.style.display = "flex";
  historyWrap.style.display = "block";
  controlsWrap.style.display = "flex";

  // state
  gameOver = false;
  currentPlayer = 1;
  msg.className = "";
  msg.textContent = `${player1Name}'s turn (Rock, Paper, Scissors)`;

  setActiveTurn();
};

// ======= Core Logic =======
const genCompChoice = () => {
  const options = ["rock", "paper", "scissors"];
  return options[Math.floor(Math.random() * 3)];
};

const clearSelection = () => {
  choices.forEach((c) => c.classList.remove("selected"));
};

const drawGame = (p1, p2) => {
  msg.className = "draw";
  msg.classList.add("draw");
  msg.textContent = `Draw 🤝\nBoth chose ${p1}`;
  pushHistory(`Draw • Both ${p1}`, "draw");
  playTone("click");
};

const checkMatchOver = () => {
  if (userScore >= targetWins || compScore >= targetWins) {
    gameOver = true;
    const winner =
      userScore > compScore ? player1Name : player2Name;

    msg.className = "win";
    msg.textContent = `🏆 ${winner} wins the match!\nFinal Score ${userScore} - ${compScore}`;
    launchConfetti();
    playTone("win");
  }
};

const showWinner = (userWin, userChoice, compChoice) => {
  msg.className = ""; // reset classes

  if (userWin) {
    userScore++;
    userScorePara.textContent = userScore;
    msg.classList.add("win");
    msg.textContent = `${currentPlayer === 1 ? player1Name : player2Name} wins! 🎉\n${userChoice} beats ${compChoice}`;
    pushHistory(`${userChoice} beats ${compChoice}`, "win");
    playTone("win");
  } else {
    compScore++;
    compScorePara.textContent = compScore;
    // If currentPlayer=1 and he lost vs comp, still show lose
    msg.classList.add("lose");
    msg.textContent = `${currentPlayer === 1 ? player1Name : player2Name} loses 💀\n${compChoice} beats ${userChoice}`;
    pushHistory(`${compChoice} beats ${userChoice}`, "lose");
    playTone("lose");
  }

  checkMatchOver();

  if (!gameOver) {
    msg.textContent += `\n${player1Name}'s turn (Rock, Paper, Scissors)`;
    currentPlayer = 1; // next round starts with player1
    setActiveTurn();
  } else {
    // lock choices
    choicesWrap.style.pointerEvents = "none";
    choicesWrap.style.opacity = 0.7;
  }
};

const playGame = (choice) => {
  if (gameOver) return;
  clearSelection();
  document.getElementById(choice).classList.add("selected");
  playTone("click");

  if (gameMode === "human-vs-computer") {
    msg.textContent = "Computer is thinking... 🤔";
    const delay = delayToggle.checked ? 700 : 0;

    setTimeout(() => {
      const compChoice = genCompChoice();
      document.getElementById(compChoice).classList.add("selected");

      if (choice === compChoice) {
        drawGame(choice, compChoice);
      } else {
        const userWin =
          (choice === "rock" && compChoice === "scissors") ||
          (choice === "paper" && compChoice === "rock") ||
          (choice === "scissors" && compChoice === "paper");
        showWinner(userWin, choice, compChoice);
      }
    }, delay);

  } else {
    // Human vs Human
    if (currentPlayer === 1) {
      player1Choice = choice;
      currentPlayer = 2;
      setActiveTurn();
      msg.textContent = `${player2Name}'s turn (Rock, Paper, Scissors)`;
    } else {
      player2Choice = choice;

      if (player1Choice === player2Choice) {
        drawGame(player1Choice, player2Choice);
      } else {
        const p1Wins =
          (player1Choice === "rock" && player2Choice === "scissors") ||
          (player1Choice === "paper" && player2Choice === "rock") ||
          (player1Choice === "scissors" && player2Choice === "paper");

        if (p1Wins) {
          showWinner(true, player1Choice, player2Choice);
        } else {
          showWinner(false, player1Choice, player2Choice);
        }
      }

      // reset for next turn
      player1Choice = null;
      player2Choice = null;
    }
  }
};

// ======= Events =======
choices.forEach((choice) => {
  choice.addEventListener("click", () => playGame(choice.dataset.choice));
});

startGameButton.addEventListener("click", setupGame);

roundsSelect.addEventListener("change", () => {
  updateBestOfUI();
});

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

resetRoundBtn.addEventListener("click", () => {
  if (document.querySelector(".player-setup").style.display !== "none") return;
  userScore = 0; compScore = 0;
  userScorePara.textContent = userScore;
  compScorePara.textContent = compScore;
  msg.className = "";
  msg.textContent = "Scores reset! Continue playing 🎮";
  clearSelection();
  playTone("click");
});

newMatchBtn.addEventListener("click", () => {
  // Reset full match but keep setup values
  userScore = 0; compScore = 0; history = [];
  userScorePara.textContent = userScore;
  compScorePara.textContent = compScore;
  renderHistory();
  gameOver = false;
  currentPlayer = 1;
  msg.className = "";
  msg.textContent = `${player1Name}'s turn (Rock, Paper, Scissors)`;
  choicesWrap.style.pointerEvents = "auto";
  choicesWrap.style.opacity = 1;
  clearSelection();
  playTone("click");
});
