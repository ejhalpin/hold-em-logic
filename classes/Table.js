import Deck from "./Deck";
var _ = require("lodash");
import { table } from "table";

export default class Table {
  constructor(buyIn = 200, bigBlind = 10, smallBlind = 12, autoIncrementBlinds = false, limit = true) {
    this.buyIn = buyIn;
    this.bigBlind = bigBlind;
    this.smallBlind = smallBlind;
    this.autoIncrementBlinds = autoIncrementBlinds;
    this.limit = limit;
    this.players = [];
    this.pool = [0];
    this.currentPool = 0;
    this.deck = new Deck();
    this.flop = [];
    this.turn;
    this.river;
    this.dealerIndex = 0;
    this.round = 0;
    this.currentBet = 0;
    this.position = 3;
    this.betsIn = false;
  }
  init() {
    //run this function after players have been added to the table.
    //It determines the dealer and blind positions, forces small and big blind bets,
    //and sets the table position to the player index after the big blind.
    //cyle past the dealer
    this.rotate();
    //collect the small blind
    this.players[0].bet(this.smallBlind, this.round);
    this.collect(this.smallBlind);
    this.players[0].didBet = false;
    this.rotate();
    //collect the big blind
    this.players[0].bet(this.bigBlind, this.round);
    this.players[0].didBet = false;
    this.rotate();
    this.currentBet = this.bigBlind;
  }

  rotate() {
    this.players.push(this.players.shift());
  }

  collect(chips) {
    this.pool[this.currentPool] += chips;
  }

  takeBets() {
    while (!this.betsIn) {
      if (this.players[0].didFold) {
        this.rotate();
        continue;
      }
      if (this.players[0].didBet && this.players[0].bets[this.round] === this.currentBet) {
        //the round of betting is over.
        //reset the didBet value for each player
        this.players.forEach(player => {
          player.didBet = false;
          if (this.round < 4) {
            player.bets.push(0);
          }
        });
        //reorder the players by their position and rotate past the dealer
        this.players.sort((a, b) => a.position - b.position);
        this.rotate();
        //increase the round
        this.round++;
        this.currentBet = 0;
        console.log("betting over for round " + this.round);
        break;
      }
      if (this.currentBet) {
        //action is on the player at position 0
        //the player must call, raise or fold. For now, lets just have everyone call
        if (this.getCurrentBet(0) === this.currentBet) {
          this.players[0].check();
        } else {
          this.collect(this.players[0].call(this.currentBet, this.round));
        }
      } else {
        //the player can check, bet, or fold
        //for now, just put in the big blind
        this.players[0].bet(this.bigBlind, this.round);
        this.currentBet = this.bigBlind;
        this.collect(this.bigBlind);
      }
      this.rotate();
    }
  }

  getCurrentBet(index) {
    //var name = this.players[0].name;
    var currentBet = this.players[0].bets[this.round];
    //console.log(name + " has bet " + currentBet);
    return currentBet;
  }

  addPlayer(player) {
    if (player.cash < this.buyIn) {
      console.log("you don't have enough chips to join this table");
      return;
    }
    player.cash -= this.buyIn;
    player.chips = this.buyIn;
    player.position = this.players.length;
    this.players.push(player);
  }

  bustPlayer(player) {
    var remainingPlayers = this.players.filter(function(val) {
      return val.id !== player.id;
    });
    this.players = remainingPlayers;
    if (this.players.length === 2) {
      this.buttons = [0, 0, 1];
    }
  }

  payOut(player, value) {
    player.chips(value);
  }

  deal(iter = 10) {
    this.deck.shuffle(iter);
    for (var i = 0; i < 2; i++) {
      this.players.forEach(player => {
        var card = this.deck.draw();
        if (!player.bot) {
          card.flip();
        }
        player.cards.push(card);
      });
    }
    this.players.forEach(player => {
      var row0 = [];
      var row1 = [];
      row0.push(player.name);
      row1.push(player.chips);
      player.cards.forEach(card => {
        row0.push(card.print());
        row1.push(card.faceUp ? card.description : "*******");
      });
      let data = [row0, row1];
      const output = table(data);
      console.log(output);
    });
  }

  doFlop() {
    //burn a card
    this.deck.draw();

    for (var i = 0; i < 3; i++) {
      this.flop.push(this.deck.draw());
    }
    var theFlop = "THE FLOP: \n";
    this.flop.forEach(card => {
      card.flip();
      theFlop += card.print() + "\n";
    });
    console.log(theFlop);
  }

  doTurn() {
    //burn a card
    this.deck.draw();
    this.turn = this.deck.draw();
    this.turn.flip();
    console.log("THE TURN: \n" + this.turn.print());
  }

  doRiver() {
    //burn a card
    this.deck.draw();
    this.river = this.deck.draw();
    this.river.flip();
    console.log("THE RIVER: \n" + this.river.print());
  }

  findBestHand() {
    var hands = [];
    //this method will throw an error if cards have not been dealt and the turn, flop, and river methods have not run.
    //loop over every player and make the best possible hand
    this.players.forEach(player => {
      var cards = [];
      cards.push.apply(cards, player.cards);
      cards.push.apply(cards, this.flop);
      cards.push(this.turn);
      cards.push(this.river);
      //sort the cards sequentially, smallest to largest
      cards.sort((a, b) => a.value - b.value);
      var hand = bestHand(cards);
      hand.player = player.name;
      hands.push(hand);
    });
    hands.sort((a, b) => {
      if (a.index !== b.index) {
        return b.index - a.index;
      }
      if (a.value !== b.value) {
        return b.value - a.value;
      }
      for (var i = 0; i < a.otherCards.length; i++) {
        if (a.otherCards[i].value !== b.otherCards[i].value) {
          return b.otherCards[i].value - a.otherCards[i].value;
        }
      }
      return 0;
    });
    for (var i = 0; i < hands.length; i++) {
      switch (i) {
        case 0:
          console.log("========== 1st Place ==========");
          break;
        case 1:
          console.log("========== 2nd Place ==========");
          break;
        case 2:
          console.log("========== 3rd Place ==========");
          break;
        default:
          console.log("========== " + (i + 1) + "th Place ==========");
      }
      console.log("Player: " + hands[i].player);
      console.log("Hand: " + hands[i].name);
      console.log("========== CARDS ==========");
      hands[i].cards.forEach(card => console.log(card.print()));
      hands[i].otherCards.forEach(card => console.log(card.print()));
      console.log("===========================");
    }
  }
}

const bestHand = (cards = []) => {
  cards.sort((a, b) => a.value - b.value);

  var straight = [];
  var flush = [];
  var groupings = 0;
  var groupsize = [];
  var groups = [];
  //find the largest straight
  var justPushed = false;
  for (var i = 0; i < 6; i++) {
    if (cards[i].value === cards[i + 1].value - 1) {
      straight.push(cards[i]);
      justPushed = true;
    } else {
      if (justPushed) {
        straight.push(cards[i]);
        justPushed = false;
      }
      if (straight.length < 5) {
        straight = [];
      }
    }
    if (i === 5 && justPushed) {
      straight.push(cards[6]);
    }
  }
  if (straight.length >= 5) {
    while (straight.length > 5) {
      straight.shift();
    }
  } else {
    straight = [];
  }
  //count up cards of the same suit
  //suitCount is an array that stores the number of cards that have eah suit and
  var suits = ["diamond", "heart", "club", "spade"];
  var suitCount = [0, 0, 0, 0];
  cards.forEach(card => {
    var suit = card.suit;
    suitCount[suits.indexOf(suit)]++;
  });
  //look for a flush
  for (var i = 0; i < suitCount.length; i++) {
    if (suitCount[i] >= 5) {
      cards.forEach(card => {
        if (card.suit === suits[i]) {
          flush.push(card);
        }
      });
    }
  }
  while (flush.length > 5) {
    flush.shift();
  }

  //look for groupings (pairs, 3ofakind, 4ofakind, full house)
  var clone = _.cloneDeep(cards);
  cards.forEach(card => {
    var group = clone.filter(val => val.value === card.value);
    if (group.length > 1) {
      groupsize.push(group.length);
      groups.push(group);
      groupings++;
    }
    clone = clone.filter(val => val.value !== card.value);
  });

  //figure out the wining hand
  var hand = {
    cards: [],
    otherCards: [],
    value: 0,
    name: ""
  };
  //begin checking the possible hands top down
  //check for royal flush
  if (straight.length === 5 && flush.length === 5 && _.isEqual(straight, flush) && _.sumBy(flush, "value") === 60) {
    hand.cards = flush;
    hand.value = 60;
    hand.name = "Royal Flush";
    hand.index = 9;
    return hand;
  }

  //check for straight flush
  if (straight.length === 5 && _.isEqual(straight, flush)) {
    hand.cards = flush;
    hand.value = _.sumBy(flush, "value");
    hand.name = "Straight Flush";
    hand.index = 8;
    return hand;
  }

  //check for 4 of a kind
  if (groupsize.includes(4)) {
    //find the highest card not in the group
    var cardstokeep = groups.filter(val => val.length === 4);
    hand.cards = cardstokeep[0];
    var groupvalue = hand.cards[0].value;
    hand.otherCards = cards.filter(val => val.value !== groupvalue).pop();
    hand.value = _.sumBy(hand.cards, "value");
    hand.name = "4 of a Kind";
    hand.index = 7;
    return hand;
  }

  //check for full house
  if (groupsize.includes(3) && groupings >= 2) {
    console.log(groupings);
    //examine the case where the player has two groups of 3 cards
    if (_.sum(groupsize) === 6) {
      //groupsize = [3,3]
      var group1 = groups[0];
      var group2 = groups[1];
      if (group1[0].value > group2[0].value) {
        group2.shift();
        hand.cards = group1.concat(group2);
      } else {
        group1.shift();
        hand.cards = group2.concat(group1);
      }
    } else if (_.sum(groupsize) === 7) {
      //groupsize = [3,2,2] or some permutation
      var cardstokeep = groups.filter(val => val.length === 3);
      hand.cards.push.apply(hand.cards, cardstokeep[0]);
      var twos = groups.filter(val => val.length === 2);
      var group2 = twos[0];
      var group3 = twos[1];
      if (group2[0].value > group3[0].value) {
        hand.cards.push.apply(hand.cards, group2);
      } else {
        hand.cards.push.apply(hand.cards, group3);
      }
    } else {
      //groupsize = [3,2] or [2,3]
      hand.cards.push.apply(hand.cards, groups[0]);
      hand.cards.push.apply(hand.cards, groups[1]);
    }

    hand.value = _.sumBy(hand.cards, "value");
    hand.name = "Full House";
    hand.index = 6;
    return hand;
  }

  //check for flush
  if (flush.length === 5) {
    hand.cards = flush;
    hand.value = _.sumBy(flush, "value");
    hand.name = "Flush";
    hand.index = 5;
    return hand;
  }

  //check for straight
  if (straight.length === 5) {
    hand.cards = straight;
    hand.value = _.sumBy(straight, "value");
    hand.name = "Straight";
    hand.index = 4;
    return hand;
  }

  //check for 3 of a kind
  if (groupsize.includes(3)) {
    hand.cards.push.apply(hand.cards, groups[0]);
    var othercards = cards.filter(val => val.value !== hand.cards[0].value);
    while (hand.otherCards.length < 2) {
      hand.otherCards.push(othercards.pop());
    }
    hand.value = _.sumBy(hand.cards, "value");
    hand.name = "3 of a Kind";
    hand.index = 3;
    return hand;
  }

  //check for 2 pair
  if (groupings >= 2) {
    if (_.sum(groupsize, "value") === 6) {
      //groupsize = [2,2,2]
      var cluster = [];
      cluster.push.apply(cluster, groups[0]);
      cluster.push.apply(cluster, groups[1]);
      cluster.push.apply(cluster, groups[2]);
      cluster.sort((a, b) => a.value - b.value);
      while (hand.cards.length < 4) {
        hand.cards.push(cluster.pop());
      }
      var othercards = cards.filter(val => val.value !== hand.cards[0].value && val.value !== hand.cards[2].value);
      othercards.sort((a, b) => a.value - b.value);
      hand.otherCards.push(othercards.pop());
      hand.value = _.sumBy(hand.cards, "value");
      hand.name = "2 Pair";
      hand.index = 2;
      return hand;
    } else {
      hand.cards.push.apply(hand.cards, groups[0]);
      hand.cards.push.apply(hand.cards, groups[1]);
      var othercards = cards.filter(val => val.value !== hand.cards[0].value && val.value !== hand.cards[2].value);
      othercards.sort((a, b) => a.value - b.value);
      hand.otherCards.push(othercards.pop());
      hand.value = _.sumBy(hand.cards, "value");
      hand.name = "2 Pair";
      hand.index = 2;
      return hand;
    }
  }

  //check for pair
  if (groupings === 1) {
    hand.cards = groups[0];
    var othercards = cards.filter(val => val.value !== hand.cards[0].value);
    othercards.sort((a, b) => a.value - b.value);

    while (hand.otherCards.length < 3) {
      hand.otherCards.push(othercards.pop());
    }
    hand.name = "Pair";
    hand.value = _.sumBy(hand.cards, "value");
    hand.index = 1;
    return hand;
  }

  //otherwise, get the high card
  hand.cards.push(cards.pop());
  hand.otherCards = cards.splice(2, 4);
  hand.name = "High Card";
  hand.value = hand.cards[0].value;
  hand.index = 0;
  return hand;
};
