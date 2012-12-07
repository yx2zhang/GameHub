function validateEmail(email) { 
	var re =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var email = $('#signUpEmail').attr('value');
	console.log(email);
	if(re.test(email)){
		return true;
	}else{
		alert('please enter valid email');
		return false;
	}
}