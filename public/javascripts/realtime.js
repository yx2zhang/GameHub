var socket = io.connect('http://localhost');
$(document).ready(function(){
	socket.emit('init', { user_id: data.user._id});

  socket.on('invite', function (data) {
    alert('received invitation from '+ data.sender);
  });

	socket.on('message', function (data) {
	console.log('get message');
	});

  socket.on('gameUpdate', function (data) {
  	updateGame(data.game);
	});

  //black jack functions
	socket.on('bj_joint_left', function (data) {
    alert('joint_left');
		addPlayer('LeftPlayer',data);
  });

	socket.on('bj_joint_right', function (data) {
    alert('joint_rights');
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
});