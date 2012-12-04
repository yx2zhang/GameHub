$(document).ready(function(){
	$('.friendsItem').on('click','.friendAction',function(){
		alert('here');
		var id = $(this).attr('id');
		console.log(id);
		$.ajax({
			url: '/user/invite_friend',
			data:{receiver:id},
			type: 'POST',
			success: function(data){
				console.log(data);
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
		});
	});
});