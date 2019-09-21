export default class Card {
  constructor(value, suit, asciiFront) {
    this.value = value;
    this.faceUp = false;
    this.location = "deck";
    this.backImage = "cardback.png";
    this.suit = suit;
    this.frontImage = suit + "-" + value + ".png";
    this.asciiFront = asciiFront;
    this.asciiBack = " _____ \n| ~ //|\n|}}:{{|\n|}}:{{|\n|}}:{{|\n|/_~_\\|";

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
    this.description = this.displayValue + " of " + this.suit + "s";
  }

  flip() {
    this.faceUp = !this.faceUp;
    return this.faceUp ? this.asciiFront : this.asciiBack;
  }

  print() {
    return this.faceUp ? this.asciiFront : this.asciiBack;
  }
}
