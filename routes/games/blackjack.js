require('../../models/blackJackGameModel');
require('../../models/blackJackPlayerModel');
require('../../models/blackJackDeckModel');
require('../../models/userModel');
var realtime = require('../../realtime');
var db = require('../../db');
var Game = db.model('blackJackGame');
var Player = db.model('blackJackPlayer');
var Deck = db.model('blackJackDeck');
var User = db.model('User');

exports.newGame = function(req, res){
  User.findById(req.session.user._id,function(error,user){
    if(user==null||user==undefined){
        console.log('cant find user and ship failed');
      }else{
        var new_game = Game.new();
        new_game.initilize(user,req);
        res.redirect('/game/blackjack/' + new_game.id);
      }
  });  	
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

exports.jointGame = function(req,res){
  User.findById(req.session.user._id,function(error,user){
    Game.findById(req.body.game_id,function(error,game){
      var how_to_joint = game.joint(user)
      var resultJson = new Object;
      if(how_to_joint=='joint'){
        console.log('wrong place');
        req.session.game = game;
        resultJson.page ='./blackjack/game_show.jade';
        resultJson.type = 'load';
        resultJson.action = 'joint';
        loadGameAndRun(req,res,resultJson);
      }else if(how_to_joint=='back'){
        req.session.game = game;
        resultJson.page = './blackjack/game_show.jade';
        resultJson.type = 'load';
        resultJson.action = 'show'
        loadGameAndRun(req,res,resultJson);
      }else{
        console.log('game is full');
        res.send('full')
      }
    });
  });
}

exports.backGame = function(req,res){
  Game.findById(req.body.game_id,function(error,game){
    req.session.game = game;
    var resultJson = new Object;
    resultJson.page = './blackjack/game_show.jade';
    resultJson.type = 'load';
    resultJson.action = 'show'
    loadGameAndRun(req,res,resultJson);
  });
}


function noticeOthers(resultJson,action){
  switch(action){
    case 'joint':
      resultJson.cur_player.updateGamesList(resultJson);
      if(resultJson.left_player) {resultJson.left_player.update(resultJson,'joint_right');}
      if(resultJson.right_player) {resultJson.right_player.update(resultJson,'joint_left');}
      break;
    case 'deal':
      if(resultJson.left_player) {resultJson.left_player.update(resultJson,'deal_right');}
      if(resultJson.right_player) {resultJson.right_player.update(resultJson,'deal_left');}
      break;
    case 'hit':
      if(resultJson.left_player) {resultJson.left_player.update(resultJson,'hit_right');}
      if(resultJson.right_player) {resultJson.right_player.update(resultJson,'hit_left');}
      break;
    case 'stand':
      if(resultJson.left_player) {resultJson.left_player.update(resultJson,'stand_right');}
      if(resultJson.right_player) {resultJson.right_player.update(resultJson,'stand_left');}
      break;
    default:
      console.log('no action to notice other players');
  }
}

function joint(req,res,resultJson){
  noticeOthers(resultJson,'joint');
  shipIt(req,res,resultJson);
}

function gameStart(resultJson){
  var game = resultJson.game;
  var deck = resultJson.deck;
  game.start();
  deck.shuffle();

  resultJson.cur_player.start();
  resultJson.dealer.start();
  
  if(resultJson.left_player) resultJson.left_player.start();
  if(resultJson.right_player) resultJson.right_player.start();
}

function checkForDeal(req,res,resultJson){
  var bid = req.body.bid;
  var cur_user = resultJson.user;
  resultJson.cur_player.bidMoney(bid);
  cur_user.upDate('money',resultJson.cur_player.money);
  if(checkPlayers(resultJson)){
    resultJson.action = 'deal';
    deal(req,res,resultJson);
  }else{
    resultJson.action = 'wait';
    shipIt(req,res,resultJson);
  }
}

function checkPlayers(resultJson){
  var result = true;
  if(resultJson.cur_player){
    result = result&&resultJson.cur_player.checkForDeal();
  }

  if(resultJson.left_player){
    result = result&&resultJson.left_player.checkForDeal();
  }

  if(resultJson.right_player){
    result = result&&resultJson.right_player.checkForDeal();
  }
  
  return result;
}

function deal(req,res,resultJson){
  var deck = resultJson.deck;
  gameStart(resultJson);

  resultJson.dealer.addCard(deck.getCard());
  resultJson.dealer.addCard(deck.getCard());
  resultJson.cur_player.addCard(deck.getCard());
  resultJson.cur_player.addCard(deck.getCard());

  if(resultJson.left_player){
    resultJson.left_player.addCard(deck.getCard());
    resultJson.left_player.addCard(deck.getCard());
  }

  if(resultJson.right_player){
    resultJson.right_player.addCard(deck.getCard());
    resultJson.right_player.addCard(deck.getCard());
  }

  noticeOthers(resultJson,'deal');
  shipIt(req,res,resultJson);
}

function hit(req,res,resultJson){
  var cur_player = resultJson.cur_player;
  var deck = resultJson.deck;
  cur_player.addCard(deck.getCard());
  var point = cur_player.count();

  if(point>21){
    cur_player.lost();
    resultJson.user.upDate('money',cur_player.money);
    req.session.user = resultJson.user;
  }

  noticeOthers(resultJson,'hit');
  shipIt(req,res,resultJson);
}

function checkForStand(req,res,resultJson){
  resultJson.cur_player.stand();
  if(checkPlayersStand(resultJson)){
    stand(req,res,resultJson);
  }else{
    shipIt(req,res,resultJson);
  }
}

function checkPlayersStand(resultJson){
  var result = true;
  if(resultJson.cur_player){
    result = result&&resultJson.cur_player.checkForStand();
  }

  if(resultJson.left_player){
    result = result&&resultJson.left_player.checkForStand();
  }

  if(resultJson.right_player){
    result = result&&resultJson.right_player.checkForStand();
  }
  return result;
}

function stand(req,res,resultJson){
  var dealer = resultJson.dealer;
  dealer.dealerAction(resultJson.deck);
  resultJson.cur_player.checkResult(resultJson);
  if(resultJson.left_player){resultJson.left_player.checkResult(resultJson);}
  if(resultJson.right_player){resultJson.right_player.checkResult(resultJson);}
  req.session.user = resultJson.user;
  noticeOthers(resultJson,'stand');
  resultJson.game.end();

  shipIt(req,res,resultJson);
}

function loadGameAndRun(req,res,resultJson){
  LoadGame(req,res,resultJson);
}

function LoadGame(req,res,resultJson){
  var cur_game = req.session.game;
  Game.findById(cur_game._id,function(error,game){
    if(game==null||game==undefined){
      console.log('cant find game and ship failed');
    }else{
      resultJson.game = game;
      LoadUser(req,res,resultJson);
    }
  });
}

function LoadUser(req,res,resultJson){
  User.findById(req.session.user._id,function(error,user){
    if(user==null||user==undefined){
        console.log('cant find user and ship failed');
      }else{
        resultJson.user = user;
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
      var dealer_index = resultJson.game.dealerIndex();
      var cur_index = resultJson.game.curPlayerIndex(resultJson.user.id);
      var left_index = resultJson.game.leftPlayerIndex(cur_index);
      var right_index = resultJson.game.rightPlayerIndex(cur_index);

      resultJson.dealer = getItem(players,dealer_index);
      resultJson.cur_player = getItem(players,cur_index);
      resultJson.left_player = getItem(players,left_index);
      resultJson.right_player = getItem(players,right_index);
      
      runGame(req,res,resultJson);
    }
  });
}

function getItem(Items,index){
  if(index==null) return null;
  return Items[index];
}

function runGame(req,res,resultJson){
  if(resultJson.action=='show'){
    shipIt(req,res,resultJson);
  }else if(resultJson.action=='deal'){
    checkForDeal(req,res,resultJson);
  }else if(resultJson.action=='joint'){
    joint(req,res,resultJson);
  }else if(resultJson.action=='hit'){
    hit(req,res,resultJson);
  }else if(resultJson.action=='stand'){
    checkForStand(req,res,resultJson);
  }
}

function shipIt(req,res,resultJson){
  var data = new Object;
  data.dealer = resultJson.dealer;
  data.cur_player = resultJson.cur_player;
  data.left_player = resultJson.left_player;
  data.right_player = resultJson.right_player;
  data.user = resultJson.user;
  data.game_status = resultJson.game.status;

  if(resultJson.type == 'send'){
    res.send({data:data});

  }else if(resultJson.type=='load'){
    res.render(resultJson.page,{data: data});
  }else{
    console.log('dont know how to ship');
    res.send({data:data});
  }
}