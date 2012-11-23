$(document).ready(function(){
	$('.gameLink').click(function(){
		var id = $(this).attr('id');
		$.ajax({
			url: '/game/blackjack'+id,
			type: 'GET',
			success: function(htmlResult){
				$('.gameContent').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

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

	$('.gamesInfo,#showAllGames').live('click',function(){
		$.ajax({
			url: '/user/show_games',
			type: 'POST',
			success: function(htmlResult){
				$('.dashBoardList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('#showMyGames').live('click',function(){
		$.ajax({
			url: '/user/show_my_games',
			type: 'POST',
			success: function(htmlResult){
				$('.gameTypesList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('#frinedSearchBar').live('click',function(){
		this.value ='';
	});

	$('#friendSearchButton').live('click',function(){
		var search_str = $('#frinedSearchBar').attr('value');
		$.ajax({
			url: '/user/search_friend',
			data:{search_str: search_str},
			type: 'POST',
			success: function(htmlResult){
				$('.friendsList').html(htmlResult);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.friendInvite').live('click',function(){
		var id = $(this).attr('id');
		socket.emit('invite', {sender:data.user.user_name,receiver:id});
	});

	$("#blackJackGames").live('click',function(){
		$.ajax({
			url: '/user/games_list',
			type: 'POST',
			data: {game: 'blackJack'},
			success: function(htmlResult){
				$('.roomsBoard').html('');
				$('.roomsBoard').html(htmlResult);
				$.getScript('../javascripts/gamesShow.js',function(data, textStatus, jqxhr){
					setList();
					showRoomsList();
				});
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.friendAdd').live('click',function(){
		var id = $(this).attr('id');
		$.ajax({
			url: '/user/friend_request',
			data:{sender:data.user._id,receiver:id},
			type: 'POST',
			success: function(data){
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.acceptFriend').live('click',function(){
		var id = $(this).parent().attr('id');
		$.ajax({
			url: '/user/accept_friend',
			data:{message_index:id},
			type: 'POST',
			success: function(data){
				var str = '<span class="right messageResult"> accepted <span>'
				$('#'+id).find('.messageAction').text('');
				$('#'+id).append(str);
				$('.friendsInfo').text('Friends '+data);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown);}
		});
	});

	$('.backToGame').live('click',function(){
		var id = $(this).parent().attr('id');
		$.ajax({
			url: '/game/blackjack/back_game',
			data:{game_id:id},
			type: 'POST',
			success: function(htmlResult){
				$('.gameContent').html(htmlResult);
				$.getScript('../javascripts/blackJackFront.js',function(data, textStatus, jqxhr){
					setTable();
				});
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown);}
		})
	});
});
