let userScore = 0;
let compScore = 0;
let currentPlayer = 1;
let player1Name = "";
let player2Name = "";
let gameMode = "human-vs-human";

const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");

const userScorePara = document.querySelector("#user-score");
const compScorePara = document.querySelector("#comp-score");
const startGameButton = document.querySelector("#start-game");
const player1Input = document.querySelector("#player1-name");
const player2Input = document.querySelector("#player2-name");
const gameModeSelect = document.querySelector("#game-mode");

// Function to set player names and game mode
const setupGame = () => {
  player1Name = player1Input.value || "Player 1";
  player2Name = player2Input.value || "Player 2";
  gameMode = gameModeSelect.value;
  
  // Hide player setup and show game choices
  document.querySelector(".player-setup").style.display = "none";
  document.querySelector(".choices").style.display = "flex";
  document.querySelector(".score-board").style.display = "flex";
  
  // Display the current player's name
  msg.innerText = `${player1Name}'s turn (Rock, Paper, Scissors)`;
};

// Function to generate the computer's choice
const genCompChoice = () => {
  const options = ["rock", "paper", "scissors"];
  const randIdx = Math.floor(Math.random() * 3);
  return options[randIdx];
};

// Draw game
const drawGame = () => {
  msg.innerText = "Game was Draw. Play again.";
  msg.style.backgroundColor = "white";
};

// Show winner and update score
const showWinner = (userWin, userChoice, compChoice) => {
  if (userWin) {
    userScore++;
    userScorePara.innerText = userScore;
    msg.innerText = `${currentPlayer === 1 ? player1Name : player2Name} wins! Your ${userChoice} beats ${compChoice}`;
    msg.style.backgroundColor = "green";
  } else {
    compScore++;
    compScorePara.innerText = compScore;
    msg.innerText = `${currentPlayer === 1 ? player1Name : player2Name} lost. ${compChoice} beats your ${userChoice}`;
    msg.style.backgroundColor = "red";
  }
};

// Function to play the game
const playGame = (userChoice) => {
  const compChoice = gameMode === "human-vs-computer" ? genCompChoice() : userChoice;

  if (userChoice === compChoice) {
    drawGame();
  } else {
    let userWin = true;
    if (userChoice === "rock") {
      userWin = compChoice === "paper" ? false : true;
    } else if (userChoice === "paper") {
      userWin = compChoice === "scissors" ? false : true;
    } else {
      userWin = compChoice === "rock" ? false : true;
    }
    showWinner(userWin, userChoice, compChoice);
  }

  // Switch players in Human vs Human mode
  if (gameMode === "human-vs-human") {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    msg.innerText = `${currentPlayer === 1 ? player1Name : player2Name}'s turn (Rock, Paper, Scissors)`;
  }
};

// Add event listeners to choices
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    const userChoice = choice.getAttribute("id");
    playGame(userChoice);
  });
});

// Start game after player setup
startGameButton.addEventListener("click", setupGame);