$(document).ready(function(){
	$("#blackJackStart").click(function(){
		$.ajax({
			url: '/game/blackjack/start',
			type: 'POST',
			success: function(data){
				$('#blackJackStart').attr('disabled','disabled');
				$('#blackJackDeal').removeAttr('disabled');
				$('.blackJackBidButton').removeAttr('disabled');
				$('.dealer').find('blackJackHand').html("");
				$('.currentPlayer').find('.blackJackHand').html("");
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('.blackJackChip').click(function(){
		var bid= parseInt(this.value.replace("$",""),10);
		var money = parseInt($('.bjPlayerMoney').text(),10) - bid;
		var new_bid = parseInt($('.bjPlayerBid').text(),10) + bid;
		$('.bjPlayerBid').text(new_bid);
		$('.bjPlayerMoney').text(money);
	});
});

$(document).ready(function(){
	$('.optionMenu').on('click','#blackJackDeal',function(){
		var bid= parseInt($('.bjPlayerBid').text(),10);
		if(bid==0){
			alert('please bid some money');
			return;
		}
		$.ajax({
			url: '/game/blackjack/deal',
			type: 'POST',
			data: {bid: bid},
			success: dealCard,
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('#blackJackHit').click(function(){
		$.ajax({
			url: '/game/blackjack/hit',
			type: 'POST',
			data: {bid: 10},
			success: hitMyCard,
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('#blackJackStand').click(function(){
		$.ajax({
			url: '/game/blackjack/stand',
			type: 'POST',
			success: gameEnd,
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});

	$('#blackJackQuit').click(function(){
		$.ajax({
			url: '/game/blackjack/quit',
			type: 'POST',
			success: quitGame,
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

function gameEnd(res){
	var data = res.data;
	var cur_player = data.cur_player;
	var dealer = data.dealer;
	if(data.cur_player.status=='stand'){
		alert('wait for other players');
		freezePlayer();
		return;
	}

	addCards('dealer',dealer.hand,2);

	if(checkAlive('currentPlayer')){
		curPlayerEnd(data.cur_player);
	}
	
	// $('.currentPlayer').find('.blackJackGameResult').text(data.cur_player.status);

	if(data.left_player){
		$('.leftPlayer').find('.blackJackGameResult').text(data.left_player.status);
	}

	if(data.right_player){
		$('.rightPlayer').find('.blackJackGameResult').text(data.right_player.status);
	}

	$('.currentPlayer').addClass('livePlayer');
	$('#blackJackDeal').removeAttr('disabled');
	$('.blackJackBidButton').removeAttr('disabled');
}

//return ture if the player is still alive
function checkAlive(role){
	return $('.'+role).hasClass('livePlayer');
}

function curPlayerEnd(cur_player){
	if(cur_player.status=='lost'){
		alert('lost');
	}else if(cur_player.status=='win'){
		alert('win');
		var money = cur_player.money;
		$('.bjPlayerMoney').text(money);
	}else if(cur_player.status=='draw'){
		alert('draw');
	}
	$('.currentPlayer').find('.blackJackGameResult').text(cur_player.status);
	$('.bjPlayerBid').text(0);
	$('.currentPlayer').removeClass('livePlayer');
	freezePlayer();
}

function freezePlayer(){
	$('#blackJackHit').attr('disabled','disabled');
	$('#blackJackStand').attr('disabled','disabled');
	$('#blackJackDouble').attr('disabled','disabled');
	$('#blackJackSplit').attr('disabled','disabled');
	$('#blackJackDeal').attr('disabled','disabled');
	$('.blackJackBidButton').attr('disabled','disabled');
}

function dealCard(res){
	var data = res.data;
	$('.dealer').find('.blackJackHand').html("");
	$('.blackJackHand').html("");
	$('.blackJackGameResult').html("");
	if(data.cur_player.status!='playing'){
		alert('wait for other players');
	}else{
		$('#blackJackDeal').attr('disabled','disabled');
		$('.blackJackBidButton').attr('disabled','disabled');
		$('#blackJackHit').removeAttr('disabled');
		$('#blackJackStand').removeAttr('disabled');
		$('#blackJackDouble').removeAttr('disabled');
		$('#blackJackSplit').removeAttr('disabled');
		addCards('dealer',data.dealer.hand,0);
		addCards('currentPlayer',data.cur_player.hand,0);
		if(data.left_player){
			addCards('leftPlayer',data.left_player.hand,0);
		}
		if(data.right_player){
			addCards('rightPlayer',data.right_player.hand,0);
		}
	}
}

function hitMyCard(data){
	hitCard('currentPlayer',data);
}

function hitCard(role,res){
	if(!res){console.log('error on hit card');}
	var data = res.data;
	var player;
	switch(role){
		case 'currentPlayer':
			player = data.cur_player;
			break;
		case 'leftPlayer':
			player = data.left_player;
			break;
		case 'rightPlayer':
			player = data.right_player;
			break;
		default:
			console.log('dont know which player to hit');
	}

	var last = player.hand.length;
	addCards(role,player.hand,last-1);

	if(player.status=='lost'){
		if(role=='currentPlayer'){
			curPlayerEnd(player);
			$.ajax({
				url: '/game/blackjack/stand',
				type: 'POST',
				success: gameEnd,
				error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
			});
		}else{
			$('.'+role).find('.blackJackGameResult').text(player.status);
			$('.'+role).removeClass('livePlayer');
		}
	}
}

function addCards(role,cards,start){
	var i = start;
	for(i;i<cards.length;i++){
		var card_str = cards[i].suit+cards[i].face;
		var class_str =  '<div class="blackJackCard" id="card'+card_str+'"></div>';
		var css_str = 'url("/images/cards/'+card_str+'.png")';
		$('.'+role).find('.blackJackHand').append(class_str);
		$('#card'+card_str).css('background-image','url("/images/cards/'+card_str+'.png")');
		$('#card'+card_str).css('left', i*(25)+'px');
	}
}

function addPlayer(role,res){
	alert('add new player here');
	var data = res.data;
	$('.'+role).find('.blackJackNameTag').text(data.user.user_name);
}

function initialize(){
	$('.curGame').attr('id', 'game_content_'+game_data.game_id);
	addCards('dealer',game_data.dealer.hand,0);
	addCards('currentPlayer',game_data.cur_player.hand,0);
	if(game_data.left_player) {addCards('leftPlayer',game_data.left_player.hand,0);}
	if(game_data.right_player){addCards('rightPlayer',game_data.right_player.hand,0);}
	setStage(game_data.game_status);

	var status = game_data.cur_player.status;

	if(status=='lost'||status=='win'||status=='draw'){
		curPlayerEnd(game_data.cur_player);
	}
}

function setStage(stage){
	if(stage == 'dealing'){
		$('#blackJackDeal').removeAttr('disabled');
		$('.blackJackBidButton').removeAttr('disabled');
		$('#blackJackHit').attr('disabled','disabled');
		$('#blackJackStand').attr('disabled','disabled');
		$('#blackJackDouble').attr('disabled','disabled');
		$('#blackJackSplit').attr('disabled','disabled');
	}else if(stage=='playing'){
		$('#blackJackDeal').attr('disabled','disabled');
		$('.blackJackBidButton').attr('disabled','disabled');
		$('#blackJackHit').removeAttr('disabled');
		$('#blackJackStand').removeAttr('disabled');
		$('#blackJackDouble').removeAttr('disabled');
		$('#blackJackSplit').removeAttr('disabled');
	}
}

function bj_removePlayer(role){
	var player;
	console.log('the orle');
	console.log(role);
	if(role=='left'){
		player = $('.leftPlayer');
	}else if(role=='right'){
		player = $('.rightPlayer');
	}
	player.find('.blackJackNameTag').html('');
	player.find('.blackJackHand').html('');
	player.find('.blackJackGameResult').html('');
}