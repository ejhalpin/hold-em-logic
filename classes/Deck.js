import Card from "./Card";

export default class Deck {
  constructor() {
    this.cards = [];
    this.suits = ["diamond", "heart", "club", "spade"];
    this.suits.forEach(suit => {
      for (var i = 2; i < 15; i++) {
        this.cards.push(new Card(i, suit));
      }
    });
  }

  shuffle(iter = 1) {
    for (var i = 0; i < iter; i++) {
      this.cards.sort((a, b) => Math.random() <= 0.5);
    }
  }

  draw() {
    return this.cards.shift();
  }

  discard(card) {
    this.cards.push(card);
  }

  print() {
    this.cards.forEach(card => {
      card.print();
    });
  }
}
