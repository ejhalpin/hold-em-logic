var _ = require("lodash");
import Table from "./classes/Table";
import Player from "./classes/Player";
import inquirer from "inquirer";
var players = [];
var botNames = ["Garyll", "Twinnifer", "Geofard", "Magnus"];
botNames.sort((a, b) => Math.random() - 0.5);
const welcome = () => {
  return new Promise(resolve => {
    inquirer
      .prompt({
        type: "input",
        message: "What's your call sign, maverick?",
        name: "name"
      })
      .then(resp1 => {
        inquirer
          .prompt({
            type: "confirm",
            message: `Welcome to Terminal Casino, ${resp1.name}! 
            Based on your fine outfit and winning smile you have at least $100.
            There's a place open at a table playing Limit Texas Hold'em.
            The buy-in is $100. Care to join?`,
            name: "play"
          })
          .then(resps2 => {
            if (resps2.play) {
              resolve(new Player(resp1.name, 100));
            } else {
              console.log("Okay. Maybe next time.");
              resolve(false);
            }
          });
      });
  });
};

const play = async () => {
  //Greet the user and create a player through the welcome function
  var player = await welcome();
  if (!player) {
    return;
  }
  //Store the returned player in the players array
  players.push(player);
  //Make some bots for the table. Current Dev is for a four player game
  for (var i = 0; i < 3; i++) {
    players.push(new Player(botNames[i], 100, true));
  }
  //Randomize the player order for purposes of table position
  players.sort((a, b) => Math.random() - 0.5);
  //Create a Table
  var table = new Table(100, 20, 10, false, true);
  //Add the players to the table
  players.forEach(player => {
    table.addPlayer(player);
  });
  //Begin the first round. Ultimately, this will be wrapped in a while(table.players.length > 2) loop
  table.init();
  //deal out the cards
  table.deal();
  //pre-flop bets
  table.takeBets();
  //deal the flop
  table.doFlop();
  //take the flop bets
  table.takeBets();
  //deal the turn
  table.doTurn();
  //take the turn bets
  table.takeBets();
  //deal the river
  table.doRiver();
  //take the river bets
  table.takeBets();
  //compare hands and find the best one
  table.findBestHand();
};

play();
