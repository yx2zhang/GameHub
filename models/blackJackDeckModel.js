var mongoose = require('mongoose');

var bjDeckSchema = new mongoose.Schema({
	cards: [],
	size: Number,
	top: Number
});

bjDeckSchema.statics.new = function(){	
	var new_deck = new this({
		size: 52,
		top: 0
	});

	for(i=0;i<52;i++){
		new_deck.cards.push(i);
	}

	new_deck.save(function(error){
		if(error) console.log('can not create deck');
  	});

	return new_deck;
}

bjDeckSchema.methods.shuffle = function(){
	if(this.cards.length != this.size) {
		console.log('deck size doesnt match');
	}else{
		for(var i = this.size-1; i>=0; i--){
			var random = Math.floor(Math.random() * (i+1));
			var temp = this.cards[random]
			this.cards[random] = this.cards[i];
			this.cards[i] = temp;
		}
	}
	this.markModified('cards');
	this.save(function(error){
		if(error) console.log('can not shuffle cards');
  	});	
}

bjDeckSchema.methods.getCard = function(){
	var i = this.top++;

  	this.save(function(error){
  		if(error){ 
    		console.log('can not get card from deck');
      		return null;
    	}
  	});

  	card = new Object;
  	card.suit = getSuit(this.cards[i]);
  	card.face = getFace(this.cards[i]);
	return card;
}

function getSuit(card){
	if(card>=0&&card<=12){
		return 's';
	}else if(card>=13&&card<=25){
		return'h';
	}else if(card>=26&&card<=38){
		return 'c';
	}else if(card>=39&&card<=51){
		return 'd';
	}
}

function getFace(card){
	return card%13+1;
}

mongoose.model('blackJackDeck',bjDeckSchema);