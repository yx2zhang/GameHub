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
				$.getScript('../javascripts/userFriends.js',function(data, textStatus, jqxhr){
				});
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.gamesInfo').click(function(){
		$.ajax({
			url: '/user/show_games',
			type: 'POST',
			success: function(htmlResult){
				$('.dashBoardList').html(htmlResult);
				$.getScript('../javascripts/userGames.js',function(data, textStatus, jqxhr){
				});
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
				$.getScript('../javascripts/userMessages.js',function(data, textStatus, jqxhr){
					updateMessages();
				});
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.playingGameList').on('click','.playingGameItem',function(){
		var id = $(this).attr('id');
		id = id.replace('playing_','');
		$.ajax({
			url: '/game/blackjack/back_game',
			data:{game_id:id},
			type: 'POST',
			success: function(new_game){
				newGame(new_game);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.navUser,.userName').click(function(){
		$.ajax({
			url: '/user/show_profile',
			type: 'POST',
			success: function(profileHtml){
				loadProfile(profileHtml);
				$.getScript('../javascripts/userProfile.js',function(data, textStatus, jqxhr){
					profileSet();
				});
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('.navUser,.navGameHub').click(function(){
		$.ajax({
			url: '/user/show_welcome',
			type: 'POST',
			success: function(welcomeHtml){
				loadProfile(welcomeHtml);
				// $.getScript('../javascripts/showWelcome.js',function(data, textStatus, jqxhr){
					
				// });
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	initialize();
});

function initialize(){
	var games = data.active_games;
	var messages = data.user.messager.messages;
	for(var i =0;i<games.length;i++){
		var game = games[i];
		var name = game.master_name + "' " +game.name + ' ' + game.index;
		addPlayingGame(game._id,name);
	}

	var m_number = 0;
	for(var i = 0;i<messages.length;i++){
		if(messages[i].status=='received'){
			m_number++;
		}
	}

	if(data.user.user_image==0)
	{
		$('.profilePic').css('background-image','url(/images/profile_pic/default.png)');
	}else{
		var url = 'url(/image/profile_pic/'+data.user.id+'.png)';
		$('.profilePic').css('background-image',url);
	}

	$('.messagesInfo').text('Messages '+m_number);
	$('.navUser').text(data.user.user_name);
	$('.userName').text(data.user.user_name);
	updateView();
}

function updateView(){
	updateHeight();
}

function updateHeight(){
	var height = $('.bodyContainer').css('height')
	$('.dashBoard').css('height', height);
}

function addPlayingGame(game_id,game_name){ 
	if(checkPlayingGameItem(game_id)){
		var game_item = new div('playingGameItem');
		var game_image = new div('blackJackImage');
		var game_text = new div('blackJackText');

		game_item.id = "playing_"+ game_id;
		game_text.content = game_name;

		$('.playingGameList').append(game_item.html());
		$('.playingGameItem#'+game_item.id).append(game_image.html());
		$('.playingGameItem#'+game_item.id).append(game_text.html());
	}
}

function checkPlayingGameItem(game_id){
	if($('.playingGameItem#'+"playing_"+ game_id).length>0){
		return false;
	}else{
		return true;
	}
}

function quitGame(game_id){
	var cur_game_container = $('.curGame');
	var playing_game_item = $('.playingGameItem#playing_'+game_id);
	cur_game_container.remove();
	playing_game_item.remove();
}

function newGame(new_game){
	var cur_game_container = $(".curGame");
	$('.userProfileContainer').remove();
	if(cur_game_container.length!=0){
		cur_game_container.animate({left:'-750px'},400,function(){
			var id = $(".curGame").attr('id').replace('game_content_','');
			var name = $(".curGame").find('.gameTitle').text();
			addPlayingGame(id,name);
			cur_game_container.remove();
			loadGame(new_game);
		});
	}else{
		loadGame(new_game);
	}
}

function loadProfile(profileHtml){
	var cur_game_container = $(".curGame");
	if(cur_game_container.length!=0){
		cur_game_container.animate({left:'-750px'},400,function(){
			var id = $(".curGame").attr('id').replace('game_content_','');
			var name = $(".curGame").find('.gameTitle').text();
			addPlayingGame(id,name);
			cur_game_container.remove();
		});
	}

	var profile = new div('userProfileContainer');
	var cur_profile = $('.bodyContainer').find('.userProfileContainer');
	if(cur_profile.length!=0){
		cur_profile.remove();
	}

	$('.bodyContainer').append(profile.html());
	$('.userProfileContainer').html(profileHtml);
}

function loadGame(new_game){
	var game_content = new div('gameContent curGame');
	$('.bodyContainer').append(game_content.html());
	$('.gameContent').html(new_game);
	$.getScript('../javascripts/blackJackFront.js',function(data, textStatus, jqxhr){
		bjInitialize();
		updateView();
	});
}