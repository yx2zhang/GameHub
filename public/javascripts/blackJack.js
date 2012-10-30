$(document).ready(function(){
	$("#blackJackStart").click(function(){
		$.ajax({
			url: '/game/start',
			type: 'POST',
			success: function(data){
				$('#blackJackStart').attr('disabled','disabled');
				$('#blackJackDeal').removeAttr('disabled');
				$('.blackJackHand.dealer').html("");
				$('.blackJackHand.current').html("");
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
			url: '/game/deal',
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
			url: '/game/hit',
			type: 'POST',
			data: {bid: 10},
			success: hitCard,
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

$(document).ready(function(){
	$('#blackJackStand').click(function(){
		alert('stand');
		$.ajax({
			url: '/game/stand',
			type: 'POST',
			success: gameEnd,
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});

function gameEnd(data){
	var cur_player = data.players[1];
	var dealer = data.players[0];
	
	console.log(dealer);

	for(var i = 2;i<dealer.hand.length;i++){
		console.log('bobo');
		addCards('dealer',[dealer.hand[i]]);
	}

	if(cur_player.status=='lost'){
		alert('lost');
	}else if(cur_player.status=='win'){
		alert('win');
		var money = cur_player.money;
		$('.bjPlayerMoney').text(money);
	}else if(cur_player.status=='draw'){
		alert('draw');
	}

	$('.bjPlayerBid').text(0)
	$('#blackJackDeal').attr('disabled','disabled');
	$('#blackJackHit').attr('disabled','disabled');
	$('#blackJackStand').attr('disabled','disabled');
	$('#blackJackDouble').attr('disabled','disabled');
	$('#blackJackSplit').attr('disabled','disabled');
	$('#blackJackStart').removeAttr('disabled');
}

function dealCard(data){
	$('#blackJackDeal').attr('disabled','disabled');
	$('#blackJackHit').removeAttr('disabled');
	$('#blackJackStand').removeAttr('disabled');
	$('#blackJackDouble').removeAttr('disabled');
	$('#blackJackSplit').removeAttr('disabled');

	addCards('dealer',data.players[0].hand);
	addCards('current',data.players[1].hand);
}

function hitCard(data){
	var cur_player = data.players[1];
	var last = cur_player.hand.length;
	addCards('current',[cur_player.hand[last-1]]);
	if(cur_player.status=='lost'){
		gameEnd(data);
	}
}

function addCards(role,cards){
	for(var i=0;i<cards.length;i++){
		var card_str = cards[i].suit+cards[i].face;
		var class_str =  '<div class="blackJackCard" id="card'+card_str+'"></div>';
		var css_str = 'url("/images/cards/'+card_str+'.png")';
		$('.blackJackHand.'+role).append(class_str);
		$('#card'+card_str).css('background-image','url("/images/cards/'+card_str+'.png")');
	}
}
