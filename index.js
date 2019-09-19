var _ = require("lodash");
import Table from "./classes/Table";
import Player from "./classes/Player";
import inquirer from "inquirer";

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
  var player = await welcome();
  if (!player) {
    return;
  }
  console.log("Great!");
};

play();
