"use strict";

import { cashInBank } from './check-score.mjs';
import { startGame, playerHit, dealerHit } from './start-game.mjs';

export let playerCards = document.querySelector(".player-cards");
export let dealerCards = document.querySelector(".dealer-cards");
export let displayPlayerScore = document.querySelector(".player-score");
export let displayDealerScore = document.querySelector(".dealer-score");
export let scoreOutput = document.querySelector(".score-output p");
export let bank = document.querySelector(".bank-amount");
export let playOn = document.querySelector(".play-on");
export let chips = document.querySelector(".chips");
export const errorMsg = document.querySelector('.table-markings'); // Fallback

export let doubled = false;
export let cashOnTable = 0;

// Custom Casino Toast Notifications
const showToast = (message, type = 'error') => {
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
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const start = () => {
  if (cashOnTable > 0) {
    // Hide betting controls, show game controls
    document.querySelector(".betting-controls").classList.add("hide-toggle");
    document.querySelector(".game-controls").classList.remove("hide-toggle");
    document.querySelector(".dealer-score-badge").classList.remove("hide-toggle");
    document.querySelector(".player-score-badge").classList.remove("hide-toggle");

    startGame();
  } else {
    showToast('Please place a bet in the circle first!', 'warning');
  }
};

const allIn = () => {
  if (cashInBank === 0) {
    showToast('Bank is empty!', 'error');
    return;
  }
  cashOnTable = cashInBank;
  bank.textContent = `Bank: $${cashInBank - cashOnTable}`;
  playOn.textContent = `$${cashOnTable}`;
};

const clear = () => {
  cashOnTable = 0;
  bank.textContent = `Bank: $${cashInBank}`;
  playOn.textContent = ``;
};

const rules = () => {
  document.querySelector(".popup").classList.toggle("rulesPop");
};

const playeAgain = () => {
  location.reload();
};

const double = () => {
  if (cashOnTable * 2 <= cashInBank) {
    cashOnTable = cashOnTable * 2;
    bank.textContent = `Bank: $${cashInBank - cashOnTable}`;
    playOn.textContent = `$${cashOnTable}`;
    doubled = true;
    playerHit();
  } else {
    showToast('Not enough cash to double!', 'error');
  }
};

const restart = () => {
  // Reset back to betting phase
  document.querySelector(".betting-controls").classList.remove("hide-toggle");
  document.querySelector(".game-controls").classList.add("hide-toggle");
  document.querySelector(".dealer-score-badge").classList.add("hide-toggle");
  document.querySelector(".player-score-badge").classList.add("hide-toggle");

  // Re-show Hit/Stand/Double buttons for next round
  document.querySelector(".double").classList.remove("hide-toggle");
  document.querySelector(".hit").classList.remove("hide-toggle");
  document.querySelector(".stand").classList.remove("hide-toggle");

  // Hide results banner
  document.querySelector(".score-output").classList.add("hide-toggle");
  document.querySelector(".restart").classList.add("hide-toggle");

  doubled = false;
  cashOnTable = 0;
  playerCards.innerHTML = '';
  dealerCards.innerHTML = '';
  scoreOutput.textContent = '';
  displayPlayerScore.textContent = '';
  displayDealerScore.textContent = '';
  bank.textContent = `Bank: $${cashInBank}`;
  playOn.textContent = ``;

  buildChips();
};

// Called by check-score.mjs when a round resolves
export const toggleAction = () => {
  document.querySelector(".score-output").classList.remove("hide-toggle");
  document.querySelector(".restart").classList.remove("hide-toggle");

  // Hide playing actions
  document.querySelector(".double").classList.add("hide-toggle");
  document.querySelector(".stand").classList.add("hide-toggle");
  document.querySelector(".hit").classList.add("hide-toggle");
};

document.querySelector(".deal").addEventListener("click", start);
document.querySelector(".all-in").addEventListener("click", allIn);
document.querySelector(".clear").addEventListener("click", clear);
document.querySelector(".openRules").addEventListener("click", rules);
document.querySelector(".closeRules").addEventListener("click", rules);
document.querySelector(".hit").addEventListener("click", playerHit);
document.querySelector(".double").addEventListener("click", double);
document.querySelector(".stand").addEventListener("click", dealerHit);
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
    bank.textContent = `Bank: $${cashInBank}`;
    playOn.textContent = cashOnTable > 0 ? `$${cashOnTable}` : ``;

    for (let i = 100; i <= cashInBank; i += 100) {
      if (i <= 1000) {
        chips.innerHTML += `<img class="chip" src='assets/images/chip-${i}.png' alt='chip-${i}'>`;
      }
    }

    document.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener("click", () => {
        const cashOnHand = Number(btn.alt.split('-')[1]);
        if (cashOnTable + cashOnHand <= cashInBank) {
          cashOnTable += cashOnHand;
          bank.textContent = `Bank: $${cashInBank - cashOnTable}`;
          playOn.textContent = `$${cashOnTable}`;
        } else {
          showToast('Not enough cash in the bank!', 'error');
        }
      });
    });
  }
};

buildChips();