$(document).ready(function(){
	$('.newBlackjack').click(function(){
		$.ajax({
			url: '/game/blackjack/new',
			type: 'POST',
			success: function(new_game){
				newGame(new_game);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('.gamesList').on('click','.gameJoint',function(){
		var game_id = $(this).parent().attr('id');
		$.ajax({
			url: '/game/blackjack/joint',
			data:{game_id: game_id},
			type: 'POST',
			success: function(new_game){
				if(new_game=='full') {
					alert('the game is full');
					return;
				}
				newGame(new_game);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.gamesList').on('click','#roomsListHide',function(){
		hideRoomsList();
	});
});

function updateGame(game){
	var gameName = game.master_name+"\' Black Jack("+ game.users.length+")"
	var t_game = $("#" + game._id);
	if(t_game.length==0){
		var new_item = '<div class="gameRoomItem"><span class="gameRoomName">'+gameName+'</span></div>'
		+ '<a href="#",class="gameJoint right">joint</a>'
	}else{
		alert('change game here');
		t_game.find('.gameRoomName').text(gameName);
	}
}


function showRoomsList(){
	$('.roomsBoard').addClass('showBoard');
    $(".roomsBoard").animate({right:'383px'});    
}

function hideRoomsList(){
	$('.roomsBoard').removeClass('showBoard');
    $(".roomsBoard").animate({right:'10px'});    
}

function setList(){
	var max = 10;
	for(var i =0; i<room_list_data.games.length;i++){
		var game = room_list_data.games[i];
		var room = '<div class="gameRoomItem listItem" id='+ game._id+'>'
					+'<span class= "gameRoomName">'+game.master_name+'\'Black Jack '+game.users.length+'/3'+'</span>'
					+'<a href="#" class="gameJoint right">joint</a>'+'</div>'
		$('.gamesListContent').append(room);
		if(i>=max) break;
	}
}

function newGame(new_game){
	var cur_game_container = $(".curGame");
	if(cur_game_container.length!=0){
		cur_game_container.animate({left:'-750px'},'slow',function(){
			var id = $(".curGame").attr('id').replace('game_content_','');
			addPlayingGame(id);
			cur_game_container.remove();
			loadGame(new_game);
		});
	}else{
		loadGame(new_game);
	}
}

function loadGame(new_game){
	var game_content = new div('gameContent curGame');
	$('.bodyContainer').append(game_content.html());
	$('.gameContent').html(new_game);
	$.getScript('../javascripts/blackJackFront.js',function(data, textStatus, jqxhr){
		initialize();
	});
}
