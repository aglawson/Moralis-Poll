
Moralis.initialize("IAdhaE7rhTCWkQ9m4Y7OqA6uDRFLexDf1AHl6xOD");
Moralis.serverURL = "https://nxjr5nsntm4w.usemoralis.com:2053/server";
var web3 = new Web3(web3.currentProvider);

$(document).ready(function () {
  window.ethereum.enable().then(function(accounts) {
      //contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
      init();
      $("#createPollButton").click(createPoll);
      $("#voteButton").click(vote);
      $("#endPollButton").click(endPoll);
      $("#loginButton").click(login);
      $("#logoutButton").click(logout);
      $("#seeResultsButton").click(getResults);
      $("#submitVoteButton").click(submitVote);
      $("#addChoiceButton").click(loadChoices);
  });
});

var choices = [];

async function endPoll() {
  const poll = document.getElementById("topic").value;
  //const endPoll = await contractInstance.methods.endPoll(poll).send({from: web3.eth.accounts[0]});
  //console.log(endPoll);
}

async function getResults() {
  seeResults(document.getElementById("voteTopic").value);
  const que = new Moralis.Query('Votes');
  let subscription = await que.subscribe();
  subscription.on('create', (object) => {
    if(object.attributes.topic == document.getElementById("voteTopic").value){
    seeResults(object.attributes.topic);
    }
  });
}

async function seeResults(topicId) {
  var que = new Moralis.Query("Polls");
  que.equalTo('objectId', topicId);
  var res = await que.find();
  var choices = res[0].attributes.choices;
  var choiceCounts = [0,0,0,0,0,0,0,0,0,0];
  document.getElementById("topicTitle").innerHTML = res[0].attributes.topic;
  for(var i = 0; i < choices.length; i++) {
    var query = new Moralis.Query("Votes");
    query.equalTo('topic', topicId);
    query.equalTo('choice', i.toString());
    var result = await query.find();
    if(result.length > 0){
      choiceCounts[i] += result.length;
      document.getElementsByTagName("p")[i].innerHTML = choiceCounts[i] + " votes for " + choices[i];
    } else {
      document.getElementsByTagName("p")[i].innerHTML = "0 votes for " + choices[i];
    }
  }

}

async function vote() {
  const topic = document.getElementById("voteTopic").value;
  const query = new Moralis.Query('Polls');
  query.equalTo('objectId', topic);
  const result = await query.find();
  document.getElementById("topicTitle").innerHTML = result[0].attributes.topic;
  //console.log(result);
  for(var i = 0; i < result[0].attributes.choices.length; i++){
    document.getElementsByTagName("p")[i].innerHTML = i + ": " + result[0].attributes.choices[i];
  }
}

async function submitVote() {
  if(Moralis.User.current() == null) {
    login();
  } else {
  const query = new Moralis.Query('Votes');
  query.equalTo('voter', Moralis.User.current().get('ethAddress') + document.getElementById("voteTopic").value);
  const res = await query.find();

  const que = new Moralis.Query('Votes');
  let subscription = await que.subscribe();
  subscription.on('create', (object) => {
    if(object.attributes.topic == document.getElementById("voteTopic").value){
    seeResults(object.attributes.topic);
    }
  });

  if(res.length == 0) {
    const VoteObj = Moralis.Object.extend('Votes');
    const voteobj = new VoteObj();
    voteobj.set('topic', document.getElementById("voteTopic").value);
    voteobj.set('choice', document.getElementById("choice").value);
    voteobj.set('voter', Moralis.User.current().get('ethAddress') + document.getElementById("voteTopic").value);
    voteobj.save();
    seeResults(document.getElementById("voteTopic").value);
    } else {
      alert("You've alredy voted in this poll");
    }
  }

}
function loadChoices() {
  choices.push(document.getElementById("choice1").value);
  document.getElementById("choicesSoFar").innerHTML = choices;
  document.getElementById("choice1").value = '';
}
async function createPoll() {
  if(Moralis.User.current() == null) {
    login();
  } else {
    const PollObj = Moralis.Object.extend('Polls');
    const poll = new PollObj();

    const pollTopic = document.getElementById("topic").value;
    poll.set('topic', pollTopic);

    poll.set('choices', choices);
    poll.set('creator', Moralis.User.current().get('ethAddress'));
    await poll.save();
    const query = new Moralis.Query('Polls');
    query.equalTo('creator', Moralis.User.current().get('ethAddress'));
    query.descending('createdAt');
    const res = await query.find();
    document.getElementById("idOutput").innerHTML = res[0].id;
  }
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

