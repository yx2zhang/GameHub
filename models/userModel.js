var mongoose = require('mongoose')
    Schema = mongoose.Schema
    ,realtime = require('../realtime');

var messageSchema = new mongoose.Schema({
  content: String, 
  sender: String, 
  receiver: String, 
  block: Number,
  status: String,
  index: Number
})

var userSchema = new mongoose.Schema({
	email: String,
	password: String,
	user_name: String,
	money: Number,
	level: Number,
	exp: Number,
  friends: [String],
  games:[],
  active_games: Number,
  messager:{
    messages: [messageSchema],
    total: Number,
    unread: Number,
    box_size: Number,
    store: []
  },
});

userSchema.statics.authenticate = function(email,password,callback){
	this.findOne({'email': email, 'password': password},callback);
}

userSchema.statics.new = function(){
	var new_user = new this();

	new_user.save(function(error){
    	if(error) console.log('meow');
  	});

  	return new_user;
}

userSchema.methods.initialize = function(req){
  this.user_name = req.param('userName');
  this.email = req.param('email');
  this.password = req.param('password');
  this.money = 150;
  this.active_games = 0;
  this.messager.total = 0;
  this.messager.unread = 0;
  this.messager.box_size = 100;

  this.save(function(error){
  	if(error) console.log('meow');
	});
}

userSchema.methods.upDate = function(field,value){
	if(field=='money'){
		this.money = value;
	}

    this.save(function(error){
    	if(error){
    		console.log('can not update player');
    		return false;
    	}
  	});
  	return true
}


userSchema.methods.receiveMessage = function(message){
  var sender = message.sender;
  message.status = 'received';
  message.index = this.newMessageIndex();
  this.messager.total++;
  this.messager.messages.push(message);
  messages =  this.messager.messages

  var m_socket = realtime.clients[this.id];

  if(m_socket){
    m_socket.emit('message',{messages:messages});
  }

  this.save(function(error){
    if(error){
      console.log('can not update player');
      return false;
    }
  });
  return true;
}

userSchema.methods.sendMessage = function(message,receiver){
  return true;
}

userSchema.methods.addFriend = function(new_friend){
  this.friends.push(new_friend);
  this.save(function(error){
    if(error){
      console.log('can not add firend '+error);
      return false;
    }
  });

  console.log(this.user_name+' added '+new_friend);
  return true;
}

userSchema.methods.addGame = function(game){
  this.games.push(game.id);
  this.active_games++;
  this.save(function(error){
    if(error){
      console.log('can not add game to user');
    }
  });
}

userSchema.methods.quitGame = function(game){
  
  for(var i = 0;i< this.games.length;i++){
    if(this.games[i]==game.id){
      this.games.splice(i,i+1);
    }
  }

  this.save(function(error){
    if(error){
      console.log('can not quit game to user');
    }
  });
}

userSchema.methods.findMessage = function(message_id){
  var messages = this.messager.messages;
  for(var i = 0; i<messages.length;i++){
    if(message_id == messages[i]._id){
      console.log('found message');
      return messages[i];
    }
  }
  console.log('here');
  return null;
}

userSchema.methods.friendsCount = function(){
  return this.friends.length;
}

userSchema.methods.acceptMessage = function(message_id){
  var message = this.findMessage(message_id);
  if(message){
    message.status = 'accepted';
    this.save(function(error){
      if(error){
        console.log('can not accept message');
      }
    });
    return true;
  }else{
    return false;
  }
}

userSchema.methods.newMessageIndex = function(){
  return (this.messager.total)%(this.messager.box_size);
}

mongoose.model('User',userSchema);