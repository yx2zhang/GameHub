// var mongoose = require('mongoose')

// var messagerSchema = new mongoose.Schema({
// 	messages: [];
// 	messages_out:[],
// 	total_in: Number,
// 	total_out: Number,
// 	unread: Number
// });

// messagerSchema.statics.new = function(){
// 	var new_messager = new this();
// 	new_messager.save(function(error){
//     	if(error) console.log('meow');
//   	});
//   	return new_messager;
// }

// messagerSchema.methods.initialize = function(){
// 	this.total = 0;
// 	this.unread = 0;
// }

// messagerSchema.methods.getMessage = function(Message){
// 	messages_in.push(Message);
// 	this.save(function(error){
//     	if(error) console.log('can not get messages');
//   	});
// }

// messagerSchema.methods.readAllMessages = function(Message){
// 	this.unread = 0;
// 	this.save(function(error){
//     	if(error) console.log('can not read messages');
//   	});
// }

// messagerSchema.methods.unread = function(){
// 	return unread;
// }

// mongoose.model('Messager',messagerSchema);