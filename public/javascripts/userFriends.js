$(document).ready(function(){
	$('.searchFriends').on('click','#friendsSearchBar',function(){
		this.value ='';
	});

	$('.searchFriends').on('click','#friendSearchButton',function(){
		var search_str = $('#friendsSearchBar').attr('value');
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

	$('.friendsList').on('click','.friendAction',function(){
		alert('here');
		var id = $(this).attr('id');
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

	$('.friendsList').on('click','.friendAdd',function(){
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
});