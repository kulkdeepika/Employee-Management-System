// This is the entry point to this application. It welcomes the user and call the prompt function which will
//then communicate with the user

const figlet = require("figlet");
const boxen = require("boxen");
const queries = require("./queries.js");

welcomeUser();

function welcomeUser(){
    figlet("Employee\n\n\nManagement\n\n\nSystem", function(err,data){
        if (err){

            throw err;
        }
        console.log(boxen(data, {padding:1, borderStyle: 'bold', backgroundColor: 'gray'}));
        queries.promptUser();
    })
}