import Card from "./Card";
import cardArt from "../cardArt.json";

export default class Deck {
  constructor() {
    this.cards = [];

    cardArt.forEach(card => this.cards.push(new Card(card.value, card.suit, card.art)));
  }

  shuffle(iter = 1) {
    for (var i = 0; i < iter; i++) {
      this.cards.sort((a, b) => Math.random() <= 0.5);
    }
  }

  draw() {
    if (this.cards.length === 0) {
      throw new Error("Empty Deck!");
    }
    return this.cards.shift();
  }

  discard(card) {
    this.cards.push(card);
  }

  print() {
    this.cards.forEach(card => {
      console.log(card.print());
    });
  }
}
