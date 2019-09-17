export default class Player {
  constructor(name, chips) {
    this.name = name;
    this.chips = chips;
    this.cards = [];
    this.bets = 0;
    this.isBigBlind = false;
    this.isSmallBlind = false;
  }

  bet(chipValue) {
    if (chipValue > this.chips) {
      console.log("You don't have enough chips");
      return;
    } else {
      this.bets += chipValue;
      this.chips -= chipValue;
      console.log(this.name + " bets " + chipValue + "!");
    }
  }
}
