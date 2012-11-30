var mongoose = require('mongoose');
var realtime = require('../realtime');

var bjPlayerSchema = new mongoose.Schema({
	gold: Number,
	hand: [],
	user_id: String,
	user_name: String,
	role: String,
	type: String,
	money: Number,
  bid: Number,
  status: String
});

bjPlayerSchema.statics.new = function(attr){
	var new_player = new this(attr);
	new_player.save(function(error){
    	if(error) console.log('can not creat player');
  	});
  	return new_player;
}

bjPlayerSchema.methods.initialize = function(attr){
  this.user_id = attr.user_id;
  this.money = parseInt(attr.money,10);
  this.user_name = attr.user_name;
  this.status = 'dealing'

  this.save(function(error){
  	if(error){ 
  		console.log('can not init player');
  		return false;
  	}
	});
	return true;
}

bjPlayerSchema.methods.start = function(bid){
  this.status = 'playing';
  this.hand = [];
  this.markModified('hand');
  this.save(function(error){
    if(error){ 
      console.log('can not add card to player');
      return false;
    }
  });
  return true;
}

bjPlayerSchema.methods.bidMoney = function(bid){
  this.status = 'ready';
  this.bid = bid;
  this.money = this.money - bid;
  this.save(function(error){
    if(error){ 
      console.log('can not add card to player');
      return false;
    }
  });
  return true;
}

bjPlayerSchema.methods.addCard = function(card){
  this.hand.push(card);
  this.save(function(error){
    if(error){ 
      console.log('can not add card to player');
      return false;
    }
  });
  return true;
}

bjPlayerSchema.methods.stand = function(){
  this.status = 'stand';
  this.save(function(error){
    if(error){ 
      console.log('player cannot stand');
      return false;
    }
  });
  return true;
}

bjPlayerSchema.methods.count = function(bid){

  var point = 0;
  var as = 0;
  var hand = this.hand;

  for(var i =0;i<hand.length;i++){
    var value = cardValue(hand[i]);
    point = point + value;
    if(value==1){
      as++;
    }
  }

  while(as>0){
    var point_alter = point+10;
    if(point_alter<=21) {
      point = point_alter;
      as--;
    }else{break;}
  }

  this.save(function(error){
    if(error){ 
      console.log('can not add card to player');
      return false;
    }
  });
  return point;
}

bjPlayerSchema.methods.dealerAction = function(deck){
  var point = this.count();
  while(point<17){
    this.addCard(deck.getCard());
    point = this.count();
  }

  this.save(function(error){
    if(error){ 
      console.log('can not do dealer action');
      return false;
    }
  });
  return true;
}

bjPlayerSchema.methods.lost = function(){
  this.status = 'lost';
  this.bid = 0;
  this.save(function(error){
    if(error){ 
      console.log('can not lost game');
      return false;
    }
  });
  return true;
}

bjPlayerSchema.methods.win = function(){
  this.status = 'win';
  this.money = this.bid*2+this.money;
  this.bid = 0;
  this.save(function(error){
    if(error){ 
      console.log('can not lost game');
      return false;
    }
  });

  return true;
}

bjPlayerSchema.methods.draw = function(){
  this.status = 'draw';
  this.bid = 0;
  this.money = this.bid+this.money;
  
  this.save(function(error){
    if(error){ 
      console.log('can not lost game');
      return false;
    }
  });

  return true;
}

bjPlayerSchema.methods.checkForDeal = function(){
  if(this.status =='ready'){
    return true;
  }
  return false;
}

bjPlayerSchema.methods.checkForEnd = function(){
  if(this.status =='stand'||this.status=='lost'||this.status=='win'||this.status=='draw'){
    return true;
  }
  return false;
}

bjPlayerSchema.methods.checkResult = function(resultJson){
  if(this.status!='lost'||this.status!='win'||this.status!='draw'){
    var dealer_point = resultJson.dealer.count();
    var my_point = this.count();

    if(my_point>21){
      this.lost();
      return;
    }

    if(dealer_point>21){
      this.win()
      return;
    }

    if(my_point==dealer_point){
      this.draw();
    }else if(dealer_point<my_point){
      this.win();
    }else{
      this.lost();
    }

    resultJson.user.upDate('money',this.money);
  }
}

bjPlayerSchema.methods.updateGamesList = function(resultJson){
  var m_socket = realtime.clients[this.user_id];
  console.log(realtime.clients.length);
  if(m_socket){
    m_socket.broadcast.emit('gameUpdate',{game:resultJson.game});
    m_socket.emit('gameUpdate',{game:resultJson.game});
  }
}

bjPlayerSchema.methods.quit = function(){
  this.remove();
}

bjPlayerSchema.methods.update = function(resultJson,action){
  var f_action = action;
  var data;
  switch(action){
    case 'joint_left':
      data = new Object({
        left_player: resultJson.cur_player,
        user: resultJson.user
      });

      f_action = 'bj_joint_left';
      break;
    case 'joint_right':
      data = new Object({
        right_player: resultJson.cur_player,
        user: resultJson.user
      });
      f_action = 'bj_joint_right';
      break;
    case 'deal_left':
      data = new Object({
        cur_player: resultJson.right_player,
        left_player: resultJson.cur_player,
        right_player: resultJson.left_player,
        dealer: resultJson.dealer
      });
      f_action = 'bj_deal';
      break;
    case 'deal_right':
      data = new Object({
        cur_player: resultJson.left_player,
        left_player: resultJson.right_player,
        right_player: resultJson.cur_player,
        dealer: resultJson.dealer
      });
      f_action = 'bj_deal';
      break;
    case 'hit_left':
      data = new Object({
        cur_player: resultJson.right_player,
        left_player: resultJson.cur_player,
        right_player: resultJson.left_player,
        dealer: resultJson.dealer,
        game_status: resultJson.game.status
      });
      f_action = 'bj_hit_left';
      break;
    case 'hit_right':
      data = new Object({
        cur_player: resultJson.left_player,
        left_player: resultJson.right_player,
        right_player: resultJson.cur_player,
        dealer: resultJson.dealer,
        game_status: resultJson.game.status
      });
      f_action = 'bj_hit_right';
      break;
    case 'stand_right':
      data = new Object({
        cur_player: resultJson.left_player,
        left_player: resultJson.right_player,
        right_player: resultJson.cur_player,
        dealer: resultJson.dealer
      })
      f_action = 'bj_stand';
      break;
    case 'stand_left':
      data = new Object({
        cur_player: resultJson.right_player,
        left_player: resultJson.cur_player,
        right_player: resultJson.left_player,
        dealer: resultJson.dealer
      })
      f_action = 'bj_stand';
      break;
    case 'quit_right':
      data = 'right';
      f_action = 'bj_quit';
      break;
    case 'quit_left':
      data = 'left';
      f_action = 'bj_quit';
    case 'update_Games_List':
      break;
    default:
      console.log('can not update');
  }

  var m_socket = realtime.clients[this.user_id];
  if(m_socket){
    m_socket.emit(f_action,{data:data});
  }
}

function cardValue(card){
  if(card.face<=10){
    return card.face;
  }else{
    return 10;
  }
}

mongoose.model('blackJackPlayer',bjPlayerSchema);
