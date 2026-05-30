"use strict";

import { cashInBank, setCashInBank } from './check-score.mjs';
import { startGame, playerHit, playerStand, splitHand, handleInsurance, playerDouble } from './start-game.mjs';

export let scoreOutput = document.querySelector(".score-output p");
export let bank = document.querySelector(".bank-amount");
export let playOn = document.querySelector(".play-on");
export let chips = document.querySelector(".chips");

export let cashOnTable = 0;

export const showToast = (message, type = 'error') => {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add("show"); });
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export const updateBankDisplay = () => {
  const isPlaying = document.querySelector(".betting-controls").classList.contains("hide-toggle");
  // If playing, display the exact cashInBank. If betting, display Bank minus what's on the table.
  if (isPlaying) {
    bank.textContent = `Bank: $${cashInBank}`;
  } else {
    bank.textContent = `Bank: $${cashInBank - cashOnTable}`;
  }
};

const start = () => {
  if (cashOnTable > 0) {
    // Officially deduct the bet from the internal bank logic
    setCashInBank(cashInBank - cashOnTable);

    document.querySelector(".betting-controls").classList.add("hide-toggle");
    document.querySelector(".game-controls").classList.remove("hide-toggle");
    document.querySelector(".dealer-score-badge").classList.remove("hide-toggle");

    updateBankDisplay();
    startGame();
  } else {
    showToast('Please place a bet in the circle first!', 'warning');
  }
};

const allIn = () => {
  if (cashInBank === 0) { showToast('Bank is empty!', 'error'); return; }
  cashOnTable = cashInBank;
  updateBankDisplay();
  playOn.textContent = `$${cashOnTable}`;
};

const clear = () => {
  cashOnTable = 0;
  updateBankDisplay();
  playOn.textContent = ``;
};

const rules = () => document.querySelector(".popup").classList.toggle("rulesPop");
const playeAgain = () => location.reload();

const restart = () => {
  document.querySelector(".betting-controls").classList.remove("hide-toggle");
  document.querySelector(".game-controls").classList.add("hide-toggle");
  document.querySelector(".dealer-score-badge").classList.add("hide-toggle");

  // Reset all buttons to hidden to prevent flicker
  document.querySelector(".hit").classList.add("hide-toggle");
  document.querySelector(".stand").classList.add("hide-toggle");
  document.querySelector(".double").classList.add("hide-toggle");
  document.querySelector(".split").classList.add("hide-toggle");

  document.querySelector(".score-output").classList.add("hide-toggle");
  document.querySelector(".restart").classList.add("hide-toggle");

  cashOnTable = 0;
  document.querySelector(".player-hands-container").innerHTML = '';
  document.querySelector(".dealer-cards").innerHTML = '';
  scoreOutput.innerHTML = '';
  playOn.textContent = ``;
  updateBankDisplay();
  buildChips();
};

export const toggleAction = () => {
  document.querySelector(".score-output").classList.remove("hide-toggle");
  document.querySelector(".restart").classList.remove("hide-toggle");
  document.querySelector(".double").classList.add("hide-toggle");
  document.querySelector(".stand").classList.add("hide-toggle");
  document.querySelector(".hit").classList.add("hide-toggle");
  document.querySelector(".split").classList.add("hide-toggle");
};

// Event Listeners
document.querySelector(".deal").addEventListener("click", start);
document.querySelector(".all-in").addEventListener("click", allIn);
document.querySelector(".clear").addEventListener("click", clear);
document.querySelector(".openRules").addEventListener("click", rules);
document.querySelector(".closeRules").addEventListener("click", rules);
document.querySelector(".hit").addEventListener("click", playerHit);
document.querySelector(".stand").addEventListener("click", playerStand);
document.querySelector(".double").addEventListener("click", playerDouble);
document.querySelector(".split").addEventListener("click", splitHand);
document.querySelector(".insure-yes").addEventListener("click", () => handleInsurance(true));
document.querySelector(".insure-no").addEventListener("click", () => handleInsurance(false));
document.querySelector(".restart").addEventListener("click", restart);
document.querySelector(".play-again").addEventListener("click", playeAgain);

const buildChips = () => {
  if (cashInBank <= 0) {
    bank.textContent = 'Bankrupt!';
    playOn.textContent = '';
    document.querySelector(".chips-rack").classList.add("hide-toggle");
    document.querySelector(".action-buttons").classList.add("hide-toggle");
    showToast("You're broke! Here is another $1000 on the house.", "warning");
    document.querySelector(".play-again").classList.remove("hide-toggle");
  } else {
    chips.innerHTML = '';
    updateBankDisplay();
    playOn.textContent = cashOnTable > 0 ? `$${cashOnTable}` : ``;

    for (let i = 100; i <= cashInBank; i += 100) {
      if (i <= 1000) chips.innerHTML += `<img class="chip" src='assets/images/chip-${i}.png' alt='chip-${i}'>`;
    }

    document.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener("click", () => {
        const cashOnHand = Number(btn.alt.split('-')[1]);
        if (cashOnTable + cashOnHand <= cashInBank) {
          cashOnTable += cashOnHand;
          updateBankDisplay();
          playOn.textContent = `$${cashOnTable}`;
        } else {
          showToast('Not enough cash in the bank!', 'error');
        }
      });
    });
  }
};

buildChips();