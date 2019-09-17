export default class Card {
  constructor(value, suit) {
    this.value = value;
    this.faceUp = false;
    this.location = "deck";
    this.backImage = "cardback.png";
    this.suit = suit;
    this.frontImage = suit + "-" + value + ".png";

    switch (this.value) {
      case 11:
        this.displayValue = "Jack";
        break;
      case 12:
        this.displayValue = "Queen";
        break;
      case 13:
        this.displayValue = "King";
        break;
      case 14:
        this.displayValue = "Ace";
        break;
      default:
        this.displayValue = value.toString();
    }
  }

  flip() {
    this.faceUp = !this.faceUp;
  }

  print() {
    return this.displayValue + " of " + this.suit + "s";
  }
}
