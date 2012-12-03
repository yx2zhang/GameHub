element = function() {
	this.name = 'div';
	this.class = new Array;

	this.addClass = function addClass(class_name){
		this.class.push(class_name);
	}

	this.html = function html(){
		var html_str = '<'+this.name;
		if(this.type){
			html_str+=' type='+this.type;
		}

		if(this.class.length>0){
			html_str+=' class="';
			for(var i = 0;i<this.class.length;i++){
				html_str+=this.class[i];
				if(i<this.class.length-1){
					html_str+=' ';
				}
			}
			html_str+='"';
		}

		if(this.id){
			html_str+=(' id="'+this.id+'"');
		}

		html_str +='>';

		if(this.content){
			html_str+=this.content;
		}

		html_str+= '</'+this.name+'>'
		return html_str;
	}
}

div = function(class_name){
	this.name = 'div';
	this.class = new Array;

	if(class_name){
		this.class.push(class_name);
	}
}
div.prototype = new element;

span = function(class_name){
	this.name='span';
	this.class = new Array;
	if(class_name){
		this.class.push(class_name);
	}
}
span.prototype = new element;

a = function(class_name){
	this.name='a';
	this.class = new Array;
	if(class_name){
		this.class.push(class_name);
	}
}
a.prototype = new element;