var mongoose = require('mongoose')
    Schema = mongoose.Schema
    ,realtime = require('../realtime');
var messageSchema = new mongoose.Schema({
  content: String, 
  sender: String, 
  receiver: String, 
  block: Number,
  status: String,
  index: Number,
  type: String,
  game_id: String
})

var userSchema = new mongoose.Schema({
	email: String,
	password: String,
	user_name: String,
	money: Number,
	level: Number,
  location: String,
	exp: Number,
  friends: [String],
  games:[],
  active_games: Number,
  user_image: Number,
  game_index_box: [],
  max_game_index: Number,
  messager:{
    messages: [messageSchema],
    total: Number,
    unread: Number,
    box_size: Number,
    store: []
  }
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
  this.user_image = 0;
  this.max_game_index = 0;

  this.save(function(error){
  	if(error) console.log('meow');
	});
}

userSchema.methods.upDate = function(field,value){
	if(field=='money'){
		this.money = value;
	}else if(field=='user_name'){
    this.user_name=value;
  }else if(field=='location'){
    this.location =value;
  }else if(field=='email'){
    this.email = value;
  }

  this.save(function(error){
  	if(error){
  		console.log('can not update player');
  		return false;
  	}
	});
	return true;
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
  var exist = false;
  for(var i =0;i<this.friends.length;i++){
    if(new_friend==this.friends[i]){
      exist = true;
    }
  }
  if(!exist){
    this.friends.push(new_friend);
  }
  
  this.save(function(error){
    if(error){
      console.log('can not add firend '+error);
      return false;
    }
  });

  console.log(this.user_name+' added '+new_friend);
  return true;
}

userSchema.methods.addGame = function(new_game){
  var exist = false;
  for(var i =0;i<this.games.length;i++){
    if(new_game.id==this.games[i]){
      exist = true;
    }
  }
  
  if(!exist){
    this.games.push(new_game.id);
    this.active_games++;
  }

  this.save(function(error){
    if(error){
      console.log('can not add game to user');
    }
  });
}

userSchema.methods.generateIndex = function(){
  var new_index;
  for(var i = 0;i<this.max_game_index;i++){
    if(!this.game_index_box[i]){
      this.game_index_box[i] = true;
      this.markModified('game_index_box');
      this.save(function(error){
        if(error) console.log('can not update index');
        return false;
      });
      return i;
    }
  }

  this.game_index_box[this.max_game_index] = true;
  new_index = this.max_game_index;
  this.max_game_index++;
  this.markModified('game_index_box');

  this.save(function(error){
    if(error) console.log('can not generate index');
    return false;
  });

  return new_index;
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