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
	$('#blackJackDeal').click(function(){
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
});

function gameEnd(res){
	var data = res.data;
	var cur_player = data.cur_player;
	var dealer = data.dealer;
	if(data.cur_player.status=='stand'){
		alert('wait for other players');
		return;
	}
	
	addCards('dealer',dealer.hand,2);

	if(cur_player.status=='lost'){
		alert('lost');
	}else if(cur_player.status=='win'){
		alert('win');
		var money = cur_player.money;
		$('.bjPlayerMoney').text(money);
	}else if(cur_player.status=='draw'){
		alert('draw');
	}

	$('.currentPlayer').find('.blackJackGameResult').text(data.cur_player.status);

	if(data.left_player){
		$('.leftPlayer').find('.blackJackGameResult').text(data.left_player.status);
	}

	if(data.right_player){
		$('.rightPlayer').find('.blackJackGameResult').text(data.right_player.status);
	}

	$('.bjPlayerBid').text(0);
	$('#blackJackHit').attr('disabled','disabled');
	$('#blackJackStand').attr('disabled','disabled');
	$('#blackJackDouble').attr('disabled','disabled');
	$('#blackJackSplit').attr('disabled','disabled');
	$('#blackJackDeal').removeAttr('disabled');
	$('.blackJackBidButton').removeAttr('disabled');
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
		gameEnd(res);
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

function setTable(){
	addCards('dealer',game_data.dealer.hand,0);
	addCards('currentPlayer',game_data.cur_player.hand,0);
	if(game_data.left_player) {addCards('leftPlayer',game_data.left_player.hand,0);}
	if(game_data.right_player){addCards('rightPlayer',game_data.right_player.hand,0);}
	setStage(game_data.game_status);
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