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
  users:[],
  dealer: Number,
	status: String,
	deck_id: String,
  turn: Number,
  master_name: String,
});

bjGameSchema.statics.new = function(){
	var new_game = new this();
  new_game.save(function(error){
    if(error) console.log('can not creat game');
  });
  return new_game;
}

bjGameSchema.methods.initilize = function(user,req){
  var new_deck = Deck.new();
  var dealer = Player.new({
    role: 'dealer', 
    type: 'AI',
    status: 'ready'
  });

  this.players.push(dealer.id);
  this.joint(user);
  this.name = 'Black Jack'
  this.dealer = 0;
  this.status = 'dealing';
  this.deck_id = new_deck.id;
  this.master_name = user.user_name;

  this.save(function(error){
    if(error) console.log('can not init game');
    return false;
  });

  return true;
}

bjGameSchema.methods.joint = function(user){
  if(this.players.length>=4) return 'full';

  for(var i =0;i<this.users.length;i++){
    if(this.users[i]==user.id){
      return 'back';
    }
  }

  var new_player = Player.new({
    role: 'regular',
    type: 'human',
  });

  new_player.initialize({
    user_id: user.id,
    user_name: user.user_name,
    money: user.money,
  });
  
  this.players.push(new_player.id);
  this.users.push(user.id);
  this.save(function(error){
    if(error) console.log('can not joint game');
  });
    
  return 'joint';
}

bjGameSchema.methods.start = function(attr){
  this.status = 'playing';
  this.save(function(error){
    if(error) console.log('can not start game');
    return false;
  });
  return true;
}

bjGameSchema.methods.end = function(attr){
  this.status = 'dealing';
  this.save(function(error){
    if(error) console.log('can not end game');
    return false;
  });
  return true;
}

bjGameSchema.methods.quit = function(player){
  for(var i = 0;i<this.players.length;i++){
    if(this.players[i]==player._id){
      this.players.splice(i,1);
      this.users.splice(i-1,1);
      break;
    }
  }

  this.save(function(error){
    if(error) console.log('can not let player quit game');
    return false;
  });


  if(this.users.length<=0){
    this.remove();
  }
}

bjGameSchema.methods.dealerIndex = function(){
  return 0;
}

bjGameSchema.methods.curPlayerIndex = function(user_id){
  for(var i = 0;i<this.users.length;i++){
    if(this.users[i]==user_id){return i+1;}
  }
  console.log('can not find user index');
  return 0;
}

bjGameSchema.methods.leftPlayerIndex = function(cur_player_index){
  if(this.players.length<=2) return null;
  var left = cur_player_index-1
  if(left<=0){
    left = (this.players.length>=4)?this.players.length-1:null;
  }  
  return left;
}

bjGameSchema.methods.rightPlayerIndex = function(cur_player_index){
  if(this.players.length<=2) return null;
  var right = cur_player_index+1
  if(right>=this.players.length) {
    right = (this.players.length>=4)?1:null;
  }
  return right;
}


mongoose.model('blackJackGame',bjGameSchema);