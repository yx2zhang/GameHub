var mongoose = require('mongoose');
require('../models/blackJackPlayerModel');
require('../models/blackJackDeckModel');

var db = require('../db');
var Player = db.model('blackJackPlayer');
var Deck = db.model('blackJackDeck');

var bjGameSchema = new mongoose.Schema({
	name: String,
  type: String,
  players: [],
  dealer: Number,
	status: String,
	deck_id: String,
  turn: Number,
  master_id: String,
});

bjGameSchema.statics.new = function(){
	var new_game = new this();
  new_game.save(function(error){
    if(error) console.log('can not creat game');
  });
  return new_game;
}

bjGameSchema.methods.initilize = function(req){
  var current_user = req.session.user;  
  var new_deck = Deck.new();

  var dealer = Player.new({
    role: 'dealer', 
    type: 'AI'
  });

  var player_first = Player.new({
    role: 'regular',
    type: 'human',
  });

  player_first.initialize({
    user_id: current_user._id,
    money: current_user.money
  });

  this.players.push(dealer.id);
  this.players.push(player_first.id);
  this.name = req.param('gameName');
  this.type = req.param('gameType'),
  this.dealer = 0;
  this.status = 'wait';
  this.turn = 1;
  this.master_id = current_user.id;
  this.deck_id = new_deck.id;

  this.save(function(error){
    if(error) console.log('can not init game');
    return false;
  });

  return true;
}

bjGameSchema.methods.start = function(attr){
  this.status = 'bid';
  this.save(function(error){
    if(error) console.log('can not init game');
    return false;
  });
  return true;
}

mongoose.model('blackJackGame',bjGameSchema);