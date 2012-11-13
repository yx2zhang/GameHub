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
	username: String,
	money: Number,
	level: Number,
	exp: Number,
  friends: [],
  games:[],
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
  this.username = req.param('userName');
  this.email = req.param('email');
  this.password = req.param('password');
  this.money = 150;

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

userSchema.methods.receiveMessage = function(message,sender){
  message.content = 'some one sent friend request';
  message.status = 'reveived';
  message.index = this.newMessageIndex();
  this.messager.total++;
  this.messager.messages.push(message);

  var m_socket = realtime.clients[this.id];
  if(m_socket){
    m_socket.emit('message',{sender: sender});
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
      console.log('can not add firend');
      return false;
    }
  });
  return true;
}

userSchema.methods.findMessage = function(message_index){
  console.log(message_index);
  console.log(this.messager.messages[message_index]);
  return this.messager.messages[message_index];
}

userSchema.methods.newMessageIndex = function(){
  return (this.messager.total)%(this.messager.box_size);
}

mongoose.model('User',userSchema);