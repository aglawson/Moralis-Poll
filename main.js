Moralis.initialize("IAdhaE7rhTCWkQ9m4Y7OqA6uDRFLexDf1AHl6xOD");
Moralis.serverURL = "https://nxjr5nsntm4w.usemoralis.com:2053/server";
var web3 = new Web3(web3.currentProvider);

const contractAddress = '0x8995a7ff27663B7208Bc5D6EcCD84B1832349076';
$(document).ready(function () {
  window.ethereum.enable().then(function(accounts) {
      contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
      init();
      $("#createPollButton").click(createPoll);
      $("#voteButton").click(vote);
      $("#endPollButton").click(endPoll);
      $("#loginButton").click(login);
      $("#logoutButton").click(logout);
      $("#seeResultsButton").click(seeResults);
  });
});

async function endPoll() {
  const poll = document.getElementById("topic").value;
  const endPoll = await contractInstance.methods.endPoll(poll).send({from: web3.eth.accounts[0]});
  console.log(endPoll);
}

async function seeResults() {
  var que = new Moralis.Query("Polls");
  que.equalTo('topic', document.getElementById("topic").value);
  var res = await que.find();
  var choices = res[0].attributes.choices;

  for(var i = 0; i < choices.length; i++) {
    var query = new Moralis.Query("Votes");
    query.equalTo('topic', document.getElementById("topic").value);
    query.equalTo('choice', choices[i]);
    query.descending('createdAt');
    var result = await query.find();
    if(result.length > 0){
      document.getElementsByTagName("p")[i].innerHTML = 'Choice: ' + result[0].attributes.choice + ' Count: ' + result[0].attributes.choiceTotal;
    }
  }
}

async function vote() {
  const topic = document.getElementById("voteTopic").value;
  const choice = document.getElementById("choice").value;
  const vote = await contractInstance.methods.vote(topic, choice).send({from: web3.eth.accounts[0]});
  console.log(vote.events.voteSubmitted.returnValues.choiceTotal);
}

async function createPoll() {
  const pollTopic = document.getElementById("topic").value;
  var choices = [];
  if(document.getElementById("choice1").value != '') {
    choices.push(document.getElementById("choice1").value);
  }
  if(document.getElementById("choice2").value != '') {
    choices.push(document.getElementById("choice2").value);
  }
  if(document.getElementById("choice3").value != '') {
    choices.push(document.getElementById("choice3").value);
  }
  if(document.getElementById("choice4").value != '') {
    choices.push(document.getElementById("choice4").value);
  }
  if(document.getElementById("choice5").value != '') {
    choices.push(document.getElementById("choice5").value);
  }
  if(document.getElementById("choice6").value != '') {
    choices.push(document.getElementById("choice6").value);
  }

  const pollCreation = await contractInstance.methods.createPoll(pollTopic, choices).send({from: web3.eth.accounts[0]});

  console.log(pollCreation);
}

init = async () => {
  window.web3 = await Moralis.Web3.enable();
  user = await Moralis.User.current();
}

logout = async () => await Moralis.User.logOut();

async function login() {
    try{
        user = await Moralis.Web3.authenticate();
    } catch(error) {
        console.log(error);
    }
}

