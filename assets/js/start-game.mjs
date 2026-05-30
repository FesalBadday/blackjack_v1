"use strict";

import { cardsArray, runGame } from './build-game.mjs';
import { resolveGame, cashInBank, setCashInBank } from './check-score.mjs';
import { cashOnTable, showToast, toggleAction, updateBankDisplay } from './client.js';

export let gameState = {
  hands: [],
  currentHandIndex: 0,
  dealer: { cards: [], score: 0, hiddenCard: null },
  insuranceBet: 0
};

const getCardValue = (val) => {
  if (val === 'ACE') return 11;
  if (['KING', 'QUEEN', 'JACK'].includes(val)) return 10;
  return Number(val);
};

export const calculateScore = (cards) => {
  let score = 0;
  let aces = 0;

  cards.forEach(card => {
    let val = getCardValue(card.value);
    if (val === 11) aces += 1;
    score += val;
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

// Modify drawCard to attach an 'isNew' flag
const drawCard = () => {
  let card = cardsArray[Math.floor(Math.random() * cardsArray.length)];
  return { ...card, isNew: true };
};

export const startGame = () => {
  do { runGame(); } while (cardsArray.length === 0);

  gameState = {
    hands: [{ cards: [], score: 0, bet: cashOnTable, status: 'playing' }],
    currentHandIndex: 0,
    dealer: { cards: [], score: 0, hiddenCard: null },
    insuranceBet: 0
  };

  gameState.hands[0].cards.push(drawCard());
  gameState.dealer.hiddenCard = drawCard();
  gameState.hands[0].cards.push(drawCard());
  gameState.dealer.cards.push(drawCard());

  gameState.hands[0].score = calculateScore(gameState.hands[0].cards);
  gameState.dealer.score = calculateScore(gameState.dealer.cards);

  renderBoard();

  if (gameState.dealer.cards[0].value === 'ACE') {
    document.querySelector(".insurance-prompt").classList.remove("hide-toggle");
    document.querySelector(".game-controls").classList.add("hide-toggle");
  } else {
    checkInitialState();
  }
};

export const checkInitialState = () => {
  const hand = gameState.hands[0];

  // Make standard actions visible
  document.querySelector(".hit").classList.remove("hide-toggle");
  document.querySelector(".stand").classList.remove("hide-toggle");

  if (hand.score === 21) {
    dealerPlay();
    return;
  }

  // Double verification: Check against actual remaining cash
  if (cashInBank >= hand.bet) {
    document.querySelector(".double").classList.remove("hide-toggle");
  } else {
    document.querySelector(".double").classList.add("hide-toggle");
  }

  // Split verification
  const val1 = getCardValue(hand.cards[0].value);
  const val2 = getCardValue(hand.cards[1].value);
  if (val1 === val2 && cashInBank >= hand.bet) {
    document.querySelector(".split").classList.remove("hide-toggle");
  } else {
    document.querySelector(".split").classList.add("hide-toggle");
  }
};

export const handleInsurance = (buy) => {
  document.querySelector(".insurance-prompt").classList.add("hide-toggle");
  document.querySelector(".game-controls").classList.remove("hide-toggle");

  if (buy) {
    let cost = gameState.hands[0].bet / 2;
    if (cashInBank >= cost) {
      setCashInBank(cashInBank - cost);
      gameState.insuranceBet = cost;
      updateBankDisplay();
      showToast(`Insurance bought for $${cost}`, 'warning');
    } else {
      showToast('Not enough cash for insurance.', 'error');
      checkInitialState();
      return;
    }
  }

  let hiddenVal = getCardValue(gameState.dealer.hiddenCard.value);
  if (gameState.dealer.score + hiddenVal === 21) {
    dealerPlay();
  } else {
    if (buy) showToast('Dealer does not have Blackjack. Insurance lost.', 'error');
    gameState.insuranceBet = 0;
    checkInitialState();
  }
};

export const playerDouble = () => {
  let hand = gameState.hands[gameState.currentHandIndex];
  if (cashInBank >= hand.bet) {
    setCashInBank(cashInBank - hand.bet);
    hand.bet *= 2;
    updateBankDisplay();

    document.querySelector(".split").classList.add("hide-toggle");
    document.querySelector(".double").classList.add("hide-toggle");

    hand.cards.push(drawCard());
    hand.score = calculateScore(hand.cards);

    renderBoard();
    advanceHand();
  } else {
    showToast('Not enough cash to double!', 'error');
  }
};

export const splitHand = () => {
  let hand = gameState.hands[0];
  setCashInBank(cashInBank - hand.bet);

  let card1 = hand.cards[0];
  let card2 = hand.cards[1];

  gameState.hands = [
    { cards: [card1, drawCard()], score: 0, bet: hand.bet, status: 'playing' },
    { cards: [card2, drawCard()], score: 0, bet: hand.bet, status: 'playing' }
  ];

  gameState.hands[0].score = calculateScore(gameState.hands[0].cards);
  gameState.hands[1].score = calculateScore(gameState.hands[1].cards);

  updateBankDisplay();
  document.querySelector(".split").classList.add("hide-toggle");
  document.querySelector(".double").classList.add("hide-toggle");
  renderBoard();
};

export const playerHit = () => {
  document.querySelector(".split").classList.add("hide-toggle");
  document.querySelector(".double").classList.add("hide-toggle");

  let hand = gameState.hands[gameState.currentHandIndex];
  hand.cards.push(drawCard());
  hand.score = calculateScore(hand.cards);

  renderBoard();

  if (hand.score >= 21) {
    advanceHand();
  }
};

export const playerStand = () => {
  document.querySelector(".split").classList.add("hide-toggle");
  document.querySelector(".double").classList.add("hide-toggle");
  advanceHand();
};

const advanceHand = () => {
  gameState.currentHandIndex++;
  if (gameState.currentHandIndex >= gameState.hands.length) {
    dealerPlay();
  } else {
    renderBoard();
  }
};

export const dealerPlay = () => {
  gameState.dealer.cards.unshift(gameState.dealer.hiddenCard);
  gameState.dealer.score = calculateScore(gameState.dealer.cards);
  renderBoard();

  const processDealerHit = () => {
    if (gameState.dealer.score < 18) {
      setTimeout(() => {
        gameState.dealer.cards.push(drawCard());
        gameState.dealer.score = calculateScore(gameState.dealer.cards);
        renderBoard();
        processDealerHit();
      }, 500);
    } else {
      resolveGame();
    }
  };
  processDealerHit();
};

export const renderBoard = () => {
  // Render Dealer
  let dCardsHtml = '';
  if (gameState.dealer.cards.length === 1) {
    // Hidden card gets the animation class if it's new
    let animClass = gameState.dealer.cards[0].isNew ? 'deal-anim' : '';
    dCardsHtml += `<img src='assets/images/hide.png' alt='secret' class='${animClass}'>`;
  } else {
    gameState.dealer.cards.forEach(c => {
      let animClass = c.isNew ? 'deal-anim' : '';
      dCardsHtml += `<img src='${c.image}' alt='${c.suit}' class='${animClass}'>`;
    });
  }
  document.querySelector(".dealer-cards").innerHTML = dCardsHtml;
  document.querySelector(".dealer-score").textContent = gameState.dealer.score;

  // Render Player Hands
  let pHandsContainer = document.querySelector(".player-hands-container");
  pHandsContainer.innerHTML = '';

  gameState.hands.forEach((hand, index) => {
    let isActive = index === gameState.currentHandIndex ? 'active-hand' : '';

    // Check for the isNew flag to apply the animation class
    let cardsHtml = hand.cards.map(c => {
      let animClass = c.isNew ? 'deal-anim' : '';
      return `<img src='${c.image}' alt='${c.suit}' class='${animClass}'>`;
    }).join('');

    pHandsContainer.innerHTML += `
      <div class="hand-wrapper ${isActive}">
        <div class="card-rack">${cardsHtml}</div>
        <div class="score-badge"><span class="player-score">${hand.score}</span></div>
      </div>
    `;
  });

  // Clear the 'isNew' flags after the CSS animation completes (500ms)
  // This ensures the next time renderBoard runs, old cards stay perfectly still
  setTimeout(() => {
    if (gameState.dealer && gameState.dealer.cards) {
      gameState.dealer.cards.forEach(c => c.isNew = false);
    }
    if (gameState.hands) {
      gameState.hands.forEach(h => h.cards.forEach(c => c.isNew = false));
    }
  }, 500);
};