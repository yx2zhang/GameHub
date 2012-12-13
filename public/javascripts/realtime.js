var socket = io.connect('http://198.74.57.21/');
$(document).ready(function(){
	socket.emit('init', { user_id: data.user._id});

  socket.on('invite', function (data) {
    alert('received invitation from '+ data.sender);
  });

	socket.on('message', function (data) {
    updateMessages(data.messages);
	});

  socket.on('gameUpdate', function (data) {
  	updateGame(data);
	});

  //black jack functions
	socket.on('bj_joint_left', function (data) {
		addPlayer('LeftPlayer',data);
  });

	socket.on('bj_joint_right', function (data) {
		addPlayer('rightPlayer',data);
  });

  socket.on('bj_deal',function (data){
  	dealCard(data);
  });

  socket.on('bj_hit_left',function (data){
  	hitCard('leftPlayer',data);
  });

	socket.on('bj_hit_right',function (data){
		hitCard('rightPlayer',data);
	});

	socket.on('bj_stand',function (data){
		gameEnd(data);
	});

  socket.on('bj_quit',function (data){
    bj_removePlayer(data.data);
  });
});