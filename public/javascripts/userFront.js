var socket = io.connect('http://localhost');

$(document).ready(function(){
	socket.emit('init', { user_id: data.user._id});
	socket.on('invite', function (data) {
		alert('received invitation from '+ data.sender);
  	});
  	socket.on('message', function (data) {
		console.log('get message');
  	});
});

$(document).ready(function(){
	$("#blackJackGames").click(function(){
		$.ajax({
			url: '/user/show_games',
			type: 'POST',
			data: {game: 'blackJack'},
			success: function(htmlResult){
				$('.gameContent').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('.gameLink').click(function(){
		var id = $(this).attr('id');
		$.ajax({
			url: '/game/'+id,
			type: 'GET',
			success: function(htmlResult){
				$('.gameContent').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('.newGame').click(function(){
		$.ajax({
			url: '/game/new',
			type: 'POST',
			success: function(htmlResult){
				$('.gameContent').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('.friendsInfo').click(function(){
		$.ajax({
			url: '/user/show_friends',
			type: 'POST',
			success: function(htmlResult){
				$('.dashBoardList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('.messagesInfo').click(function(){
		$.ajax({
			url: '/user/show_messages',
			type: 'POST',
			success: function(htmlResult){
				$('.dashBoardList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});
