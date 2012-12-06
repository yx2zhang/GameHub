$(document).ready(function(){
	$('#newBlackjack').click(function(){
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
		var game_id = $(this).parent().attr('id').replace('gameRoom_','');
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

//functions for game rooms list
function updateGame(data){
	var game = data.game;

	var gameName = game.master_name+"\'Black Jack"+ game.index+'&nbsp &nbsp &nbsp ('+game.users.length+"/3)";
	var t_game = $("#gameRoom_" + game._id);
	if(t_game.length==0){
		addGameRoom(game);
	}else{
		if(game.users.length==0){
			t_game.remove();
		}else{
			t_game.find('.gameRoomName').text(gameName);
		}
	}
}

function showRoomsList(){
	$('.roomsBoard').addClass('showBoard');
    $(".roomsBoard").animate({right:'310px'});    
}

function hideRoomsList(){
	$('.roomsBoard').removeClass('showBoard');
    $(".roomsBoard").animate({right:'0px'});    
}

function setList(){
	var max = 10;
	for(var i =room_list_data.games.length-1; i>=0;i--){
		addGameRoom(room_list_data.games[i]);
		// if(i>=max) break;
	}
}

function addGameRoom(game){
		var room = '<div class="gameRoomItem listItem" id=gameRoom_'+ game._id+'>'
					+'<span class= "gameRoomName">'+game.master_name+'\'Black Jack '+game.index+'&nbsp &nbsp &nbsp ('+game.users.length+'/3)'+ '</span>'
					+'<a href="#" class="gameJoint right">joint</a>'+'</div>'
		$('.gamesListContent').append(room);
}
