"use strict";

import { gameState, renderBoard } from './start-game.mjs';
import { toggleAction, scoreOutput, updateBankDisplay, showToast } from './client.js';

export let cashInBank = 1000;

export const setCashInBank = (val) => {
  cashInBank = val;
};

export const resolveGame = () => {
  toggleAction();
  let dScore = gameState.dealer.score;
  let finalMessage = [];
  let totalReturn = 0; // Total money returning to the player's bank

  // Resolve Insurance
  if (gameState.insuranceBet > 0) {
    if (dScore === 21 && gameState.dealer.cards.length === 2) {
      totalReturn += gameState.insuranceBet * 3; // Original bet returned + 2:1 profit
      showToast('Insurance Paid 2:1!', 'warning');
    }
  }

  // Resolve Hands
  gameState.hands.forEach((hand, i) => {
    let pScore = hand.score;
    let handName = gameState.hands.length > 1 ? `Hand ${i + 1}: ` : '';

    if (pScore > 21) {
      finalMessage.push(`${handName}Busted.`);
      // Bet was already deducted, returns 0.
    } else if (dScore > 21) {
      finalMessage.push(`${handName}Dealer Busts. You Win!`);
      totalReturn += hand.bet * 2;
    } else if (pScore === 21 && hand.cards.length === 2 && (dScore !== 21 || gameState.dealer.cards.length > 2)) {
      finalMessage.push(`${handName}Blackjack!`);
      totalReturn += hand.bet * 2.5; // 3:2 payout
    } else if (pScore > dScore) {
      finalMessage.push(`${handName}You Win!`);
      totalReturn += hand.bet * 2;
    } else if (pScore === dScore) {
      finalMessage.push(`${handName}Push.`);
      totalReturn += hand.bet; // Returns original bet
    } else {
      finalMessage.push(`${handName}Dealer Wins.`);
      // Returns 0.
    }
  });

  // Pay out total winnings to the true bank balance
  setCashInBank(cashInBank + totalReturn);
  updateBankDisplay();

  scoreOutput.innerHTML = finalMessage.join('<br>');
};