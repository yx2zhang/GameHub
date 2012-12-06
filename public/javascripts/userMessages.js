$(document).ready(function(){
	$('.messagesList').on('click','.acceptInvite',function(){
		alert('accept invite');
		var id = $(this).parent().attr('id');
		$.ajax({
			url: '/user/accept_invite',
			data:{message_id:id},
			type: 'POST',
			success: function(message){
				console.log('show the game id');
				console.log(message);
				var game_id = message.game_id;
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
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown);}
		});
	});

	$('.messagesList').on('click','.acceptFriend',function(){
		var id = $(this).parent().attr('id');
		$.ajax({
			url: '/user/accept_friend',
			data:{message_id:id},
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
});

function updateMessages(messages){
	if(!messages){
		var messages = message_data.messager.messages;
	}
	
	$('.messagesList').html('');
	var m_number = 0;
	for(var i =messages.length-1;i>=0;i--){
		var message = messages[i];
		if(i>=messages.length-6){
			addMessage(message);
		}

		if(messages[i].status=='received'){
			m_number++;
		}
	}

	$('.messagesInfo').text('Messages '+m_number);
}

function addMessage(message){
	var new_message = new div('messageItem listItem');
	new_message.id = message._id;
	$('.messagesList').append(new_message.html());

	var messgae_content = new span('messageContent left');
	messgae_content.content = message.content;
	$('.messageItem#'+new_message.id).append(messgae_content.html());
	if (message.status != 'accepted'){
		var accept = new a('left messageAction');
		accept.content = 'accept';
		var ignore = new a('left messageAction');
		ignore.content = 'ignore';
		if(message.type=='add_friend'){
			accept.addClass('acceptFriend');
			ignore.addClass('ignoreMessage');
		}else if(message.type=='invite_friend'){
			accept.addClass('acceptInvite');
			ignore.addClass('ignoreMessage');
		}

		$('.messageItem#'+new_message.id).append(accept.html());
		$('.messageItem#'+new_message.id).append(ignore.html());
	}else{
		var accepted = new span('right messageResult');
		accepted.content = 'accepted';
		$('.messageItem#'+new_message.id).append(accepted.html());
	}
}