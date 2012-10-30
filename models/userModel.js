var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	email: String,
	password: String,
	username: String,
	money: Number,
	level: Number,
	exp: Number,
});

userSchema.statics.authenticate = function(email,password,callback){
	this.findOne({'email': email, 'password': password},callback);
}

userSchema.statics.new = function(attr){
	var new_user = new this(attr);
	
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
}

mongoose.model('User',userSchema);

