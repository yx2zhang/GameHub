var mongoose = require('mongoose');

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
  this.save(function(error){
  	if(error){ 
  		console.log('can not init player');
  		return false;
  	}
	});
	return true;
}

bjPlayerSchema.methods.start = function(bid){

  this.status = 'bid';
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
  this.status = 'playing'
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

function cardValue(card){
  if(card.face<=10){
    return card.face;
  }else{
    return 10;
  }
}

mongoose.model('blackJackPlayer',bjPlayerSchema);
