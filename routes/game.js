require('../models/blackJackGameModel');
require('../models/blackJackPlayerModel');
require('../models/blackJackDeckModel');

var db = require('../db');
var Game = db.model('blackJackGame');
var Player = db.model('blackJackPlayer');
var Deck = db.model('blackJackDeck');

exports.newGame = function(req, res){  	
    var current_user = req.session.user;
    var new_game = Game.new();
    new_game.initilize(req);
  	res.redirect('/game/' + new_game.id);
};

exports.showGame = function(req,res){
	Game.findById(req.params.id,function(error,game){
    req.session.game = game;
    var resultJson = new Object;
    resultJson.page = './blackjack/game_show.jade';
    resultJson.type = 'load';
    resultJson.action = 'show'
    loadGameAndRun(req,res,resultJson);
	});
};

exports.startGame = function(req,res){
  var resultJson = new Object;
  resultJson.type = 'send';
  resultJson.action = 'start';
  loadGameAndRun(req,res,resultJson);
}

exports.dealGame = function(req,res){
  var cur_game = req.session.game;
  var resultJson = new Object;
  resultJson.type = 'send';
  resultJson.action = 'deal';
  loadGameAndRun(req,res,resultJson);
}

exports.hitGame = function(req,res){
  var resultJson = new Object;
  resultJson.type = 'send';
  resultJson.action = 'hit';
  loadGameAndRun(req,res,resultJson);
}

exports.standGame = function(req,res){
  var resultJson = new Object;
  resultJson.type = 'send';
  resultJson.action = 'stand';
  loadGameAndRun(req,res,resultJson);
}

function start(req,res,resultJson){
  var game = resultJson.game;
  var deck = resultJson.deck;
  game.start();
  deck.shuffle();

  var players = resultJson.players;
  for(var i =0;i<players.length;i++){
    var player = players[i];
    player.start();
  }
  shipIt(req,res,resultJson);
}

function deal(req,res,resultJson){
  var players = resultJson.players;
  var cur_user = resultJson.user;
  var deck = resultJson.deck;
  var bid = req.body.bid;

  for(var i = 0;i<players.length;i++){
    var player = players[i];
    player.addCard(deck.getCard());
    player.addCard(deck.getCard());
    if(player.user_id==cur_user._id){
      player.bidMoney(bid);
    }
  }
  shipIt(req,res,resultJson);
}

function hit(req,res,resultJson){
  var cur_player = resultJson.players[resultJson.cur_playerIndex];
  var deck = resultJson.deck;
  cur_player.addCard(deck.getCard());
  var point = cur_player.count();
  if(point>21){
    cur_player.lost();
  }
  shipIt(req,res,resultJson);
}

function stand(req,res,resultJson){
  var players = resultJson.players;
  var dealer = players[0];
  var cur_player = players[resultJson.cur_playerIndex];
  dealer.dealerAction(resultJson.deck);
  var dealer_point = dealer.count();
  var player_point = cur_player.count();
  
  if(dealer_point==cur_player.point){
    cur_player.draw();
  }
  if(dealer_point>21||dealer_point<player_point){
    cur_player.win(); 
  }else{
    cur_player.lost();
  }
  shipIt(req,res,resultJson);
}

function loadGameAndRun(req,res,resultJson){
  resultJson.user = req.session.user;
  if(resultJson.game==null){
    LoadGame(req,res,resultJson);
  }else if(resultJson.players==null){
    LoadDeck(req,res,resultJson);
  }else{
    shipIt(req,res,resultJson);
  }
}

function LoadGame(req,res,resultJson){
  var cur_game = req.session.game;
  Game.findById(cur_game._id,function(error,game){
      if(game==null||game==undefined){
        console.log('cant find game and ship failed');
      }else{
        resultJson.game = game;
        LoadDeck(req,res,resultJson);
      }
  });
}

function LoadDeck(req,res,resultJson){
  Deck.findById(resultJson.game.deck_id,function(error,deck){
    if(deck===null||deck===undefined){
      console.log('cant find deck and ship failed');
    }else{
      resultJson.deck = deck;
      LoadPlayers(req,res,resultJson);
    }
  });
}

function LoadPlayers(req,res,resultJson){
  var players_ids = resultJson.game.players;
  Player.find({'_id':{ $in:players_ids}},function(error,players){
    if(players==null||players==undefined){
      console.log('cant find players and ship failed');
    }else{
      resultJson.players = players;
      resultJson.cur_playerIndex = findCurPlayer(players,resultJson.user);
      RunGame(req,res,resultJson);
    }
  });
}

function RunGame(req,res,resultJson){
  if(resultJson.action=='show'){
    shipIt(req,res,resultJson);
  }else if(resultJson.action=='deal'){
    deal(req,res,resultJson);
  }else if(resultJson.action=='start'){
    start(req,res,resultJson);
  }else if(resultJson.action=='hit'){
    hit(req,res,resultJson);
  }else if(resultJson.action=='stand'){
    stand(req,res,resultJson);
  }
}

function shipIt(req,res,resultJson){
  if(resultJson.type == 'send'){
    res.send(resultJson);
  }else if(resultJson.type=='load'){
    res.render(resultJson.page,{
      locals:{
        data: resultJson
      }
    });
  }else{
    console.log('dont know how to ship');
    res.send(resultJson)
  }
}

function findCurPlayer(players,cur_user){
  for(var i =0;i<players.length;i++){
    var player = players[i];
    if(player.user_id==cur_user._id){
      return i;
    }
  }
}
