import crypto from "crypto";
import moment from "moment";

export default class Player {
  constructor(name, cash, bot = false) {
    this.name = name;
    this.chips = 0;
    this.cash = cash;
    this.cards = [];
    this.bets = [0];
    this.didFold = false;
    this.didBet = false;
    this.isAllIn = false;
    this.position = 0;
    this.bot = bot;
    this.id = crypto.pbkdf2Sync(name, moment().toString(), 100000, 16, "sha512").toString("hex");
  }

  bet(chipValue, index) {
    if (chipValue >= this.chips) {
      this.bets[index] += this.chips;

      console.log(this.name + " is all in!");
    } else {
      this.bets[index] += chipValue;
      //console.log(this.name + " has bet a total of " + this.bets[index]);
      this.chips -= chipValue;
      console.log(this.name + " bets " + chipValue + "!");
    }
    this.didBet = true;
  }

  call(currentBet, index) {
    //match the current bet by betting the difference between the current bet and your most recent bet
    var amount = currentBet - this.bets[this.bets.length - 1];
    this.bets[index] += amount;
    this.didBet = true;
    console.log(this.name + " calls.");
    return amount;
  }

  check() {
    this.didBet = true;
    console.log(this.name + "checks.");
  }

  fold() {
    this.didFold = true;
    this.bets.push(-1);
    console.log(this.name + " folds.");
  }
}
