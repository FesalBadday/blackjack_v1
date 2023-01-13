"use strict";

import { cardsArray, runGame } from './build-game.mjs';
import { checkScore, cashInBank } from './check-score.mjs';
import { playerCards, dealerCards, displayPlayerScore, displayDealerScore, doubled } from './client.js';

export let playerScore;
export let dealerScore;
export let dealerHiddenCard = [];

export const startGame = () => {
  // output variable
  let output = '';
  let score = 0;
  let playerOrDealer = '';
  let hideScore = 0;
  playerScore = 0;
  dealerScore = 0;

  do {
    runGame();
  }
  while (cardsArray.length === 0)
  for (let i = 0; i <= 3; i++) {
    const randomCard = Math.floor(Math.random() * cardsArray.length)

    let value = cardsArray[randomCard].value;

    if (value === 'ACE') {
      score = 11;
    } else if (value.length > 3) {
      score = 10;
    } else {
      score = Number(cardsArray[randomCard].value);
    }

    if (i % 2 === 0) {
      playerOrDealer = 'player';

      if (value === 'ACE' && playerScore > 10) {
        playerScore++;
      } else {
        playerScore += score;
      }
    } else {

      if (i === 1) {
        dealerHiddenCard = [];
        playerOrDealer = 'hidden-card';
        hideScore = score;
      } else {
        playerOrDealer = 'dealer';
      }

      if (value === 'ACE' && dealerScore > 10) {
        dealerScore++;
      } else {
        dealerScore += score;
      }
    }

    score = 0;

    if (playerOrDealer === 'hidden-card') {
      dealerHiddenCard.push(cardsArray[randomCard].image, cardsArray[randomCard].suit);
      output = `<img class='${playerOrDealer}' src='assets/images/hide.png' alt='secret'>`;
    } else {
      output = `<img class='${playerOrDealer}' src='${cardsArray[randomCard].image}' alt='${cardsArray[randomCard].suit}'>`;
    }

    if (playerOrDealer === 'player') {
      playerCards.innerHTML += output;
    } else {
      dealerCards.innerHTML += output;
    }
  }

  displayPlayerScore.textContent += playerScore;
  displayDealerScore.textContent += dealerScore - hideScore;
}

export const playerHit = () => {
  document.querySelector(".double").style.visibility = "hidden";
  if (cashInBank <= 0) {
    checkScore();
  } else {
    const randomCard = Math.floor(Math.random() * cardsArray.length)
    playerCards.innerHTML += `<img class='player' src='${cardsArray[randomCard].image}' alt='${cardsArray[randomCard].suit}'>`;

    if (cardsArray[randomCard].value === 'ACE' && playerScore > 10) {
      playerScore++;
    } else if (cardsArray[randomCard].value === 'ACE') {
      playerScore += 11;
    } else if (cardsArray[randomCard].value.length > 3) {
      playerScore += 10;
    } else {
      playerScore += Number(cardsArray[randomCard].value);
    }

    displayPlayerScore.textContent = playerScore;

    if (playerScore === 21) {
      dealerHit();
    } else if (playerScore > 21) {
      checkScore();
    } else if (doubled) {
      dealerHit();
    }
  }
};

export const dealerHit = () => {
  if (cashInBank <= 0) {
    checkScore();
  } else {
    do {
      if (dealerScore < 18) {
        const randomCard = Math.floor(Math.random() * cardsArray.length)
        dealerCards.innerHTML += `<img class='dealer' src='${cardsArray[randomCard].image}' alt='${cardsArray[randomCard].suit}'>`;

        if (cardsArray[randomCard].value === 'ACE' && dealerScore > 10) {
          dealerScore++;
        } else if (cardsArray[randomCard].value === 'ACE') {
          dealerScore += 11;
        } else if (cardsArray[randomCard].value.length > 3) {
          dealerScore += 10;
        } else {
          dealerScore += Number(cardsArray[randomCard].value);
        }
      }
    }
    while (dealerScore < 18)
    checkScore();
  }
};