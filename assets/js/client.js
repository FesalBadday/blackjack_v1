"use strict";

import { cashInBank } from './check-score.mjs';
import { startGame, playerHit, dealerHit } from './start-game.mjs';

export let playerCards = document.querySelector(".player-cards");
export let dealerCards = document.querySelector(".dealer-cards");
export let displayPlayerScore = document.querySelector(".player-score");
export let displayDealerScore = document.querySelector(".dealer-score");
export let scoreOutput = document.querySelector(".score-output p");
export let bank = document.querySelector(".bank span");
export let playOn = document.querySelector(".play-on");
export let chips = document.querySelector(".chips");
// errorMsg variable
export const errorMsg = document.querySelector('.start-section')

export let doubled = false;
export let cashOnTable = 0;

const start = () => {
  if (cashOnTable > 0) {
    if (screen.width <= 600) {
      document.querySelector(".mydiv").style = "top: 120%;";
    } else {
      document.querySelector(".mydiv").style = "top: 79.6%;";
    }
    document.querySelector(".mydivheader").classList.toggle("wide");
    document.querySelector("h1").classList.toggle("hide-toggle");
    document.querySelector(".chips").classList.toggle("hide-toggle");
    document.querySelector(".deal").classList.toggle("hide-toggle");
    document.querySelector(".all-in").classList.toggle("hide-toggle");
    document.querySelector(".clear").classList.toggle("hide-toggle");
    document.querySelector(".openRules").classList.toggle("hide-toggle");
    document.querySelector(".game-section").classList.toggle("hide-toggle");

    startGame();

  } else {
    alert('Choose an amount to play with first')
  }
};

const allIn = () => {
  cashOnTable = cashInBank;
  bank.textContent = `Bank: ${cashInBank - cashOnTable}`;
  playOn.textContent = `Play on: ${cashOnTable}`;
};

const clear = () => {
  cashOnTable = 0;
  bank.textContent = `Bank: ${cashInBank}`;
  playOn.textContent = `Play on: ${cashOnTable}`;
};

const rules = () => {
  document.querySelector(".popup").classList.toggle("rulesPop");
  document.querySelector(".openRules").classList.toggle("hide-toggle");
};

const playeAgain = () => {
  location.reload();
};

const double = () => {
  if (cashOnTable * 2 <= cashInBank) {
    cashOnTable = cashOnTable * 2;
    bank.textContent = `Bank: ${cashInBank - cashOnTable}`;
    playOn.textContent = `Play on: ${cashOnTable}`;
    doubled = true;
    playerHit();
  } else {
    alert('Not enough cash')
  }
}

const restart = () => {
  document.querySelector(".mydiv").style = "top: 60%; left: 50%; transform: translate(-50%, -50%);";
  document.querySelector(".mydivheader").classList.toggle("wide");
  document.querySelector(".chips").classList.toggle("hide-toggle");
  document.querySelector(".deal").classList.toggle("hide-toggle");
  document.querySelector(".double").style.visibility = "visible";
  document.querySelector(".all-in").classList.toggle("hide-toggle");
  document.querySelector(".clear").classList.toggle("hide-toggle");
  document.querySelector(".openRules").classList.toggle("hide-toggle");

  document.querySelector("h1").classList.toggle("hide-toggle");
  document.querySelector(".game-section").classList.toggle("hide-toggle");

  doubled = false;
  cashOnTable = 0;
  playerCards.innerHTML = '';
  dealerCards.innerHTML = '';
  scoreOutput.textContent = '';
  displayPlayerScore.textContent = '';
  displayDealerScore.textContent = '';
  bank.textContent = `Bank: ${cashInBank}`;
  playOn.textContent = `Play on: ${cashOnTable}`;

  toggleAction();
  buildChips();
};

export const toggleAction = () => {
  document.querySelector(".score-output").classList.toggle("hide-toggle");
  document.querySelector(".restart").classList.toggle("hide-toggle");
  document.querySelector(".double").classList.toggle("hide-toggle");
  document.querySelector(".stand").classList.toggle("hide-toggle");
  document.querySelector(".hit").classList.toggle("hide-toggle");
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
    bank.textContent = 'You ran out of cash, but don’t worry because today is your LUCKY DAY!, here is another $1000 on us :)';
    playOn.textContent = '';
    document.querySelector(".chips").classList.toggle("hide-toggle");
    document.querySelector(".deal").classList.toggle("hide-toggle");
    document.querySelector(".all-in").classList.toggle("hide-toggle");
    document.querySelector(".clear").classList.toggle("hide-toggle");
    document.querySelector(".openRules").classList.toggle("hide-toggle");
    document.querySelector("h1").textContent = "Game Over!";
    document.querySelector(".play-again").classList.toggle("hide-toggle");
  } else {
    chips.innerHTML = '';
    bank.textContent = `Bank: ${cashInBank}`;
    playOn.textContent = `Play on: ${cashOnTable}`;

    for (let i = 100; i <= cashInBank; i += 100) {
      if (i <= 1000) {
        chips.innerHTML += `<img class="chip" src='assets/images/chip-${i}.png' alt='chip-${i}'>`;
      }
    }

    // select all btns and add click event
    document.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener("click", () => {
        const cashOnHand = Number(btn.alt.split('-')[1]);
        if (cashOnTable + cashOnHand <= cashInBank) {
          cashOnTable += cashOnHand;
          bank.textContent = `Bank: ${cashInBank - cashOnTable}`;
          playOn.textContent = `Play on: ${cashOnTable}`;
        } else {
          alert('Not enough cash')
        }
      });
    });
  }
}

buildChips();

// Make the DIV element draggable:
dragElement(document.querySelector(".mydiv"));

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}