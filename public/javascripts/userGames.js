$(document).ready(function(){
	$('.gamesNav').on('click','#showAllGames',function(){
		$.ajax({
			url: '/user/show_games',
			type: 'POST',
			success: function(htmlResult){
				$('.dashBoardList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.gamesNav').on('click','#showMyGames',function(){
		$.ajax({
			url: '/user/show_my_games',
			type: 'POST',
			success: function(htmlResult){
				$('.gameTypesList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$(".gameTypesList").on('click','#blackJackGames',function(){
		$.ajax({
			url: '/user/games_list',
			type: 'POST',
			data: {game: 'blackJack'},
			success: function(htmlResult){
				var show = $('.roomsBoard').hasClass('showBoard')
				if(show){
					hideRoomsList();
				}else{
					$('.roomsBoard').html(htmlResult);
					$.getScript('../javascripts/roomsBoard.js',function(data, textStatus, jqxhr){
						setList();
						showRoomsList();
					});
				}
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	// $('.backToGame').live('click',function(){
	// 	var id = $(this).parent().attr('id');
	// 	$.ajax({
	// 		url: '/game/blackjack/back_game',
	// 		data:{game_id:id},
	// 		type: 'POST',
	// 		success: function(htmlResult){
	// 			$('.gameContent').html(htmlResult);
	// 			$.getScript('../javascripts/blackJackFront.js',function(data, textStatus, jqxhr){
	// 				setTable();
	// 			});
	// 		},
	// 		error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown);}
	// 	})
	// });
});