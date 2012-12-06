$(document).ready(function(){
	// $('.userProfileImage').on('change','.imageUpload',function(){
	// 	var fd = new FormData;
	// 	var file = this.files[0];
	// 	fd.append('photo1', file);
	//     $.ajax({
	//         url: '/user/upload_profile_image',
	//         type: 'POST',
	//         xhr: function() {  // custom xhr
	//             myXhr = $.ajaxSettings.xhr();
	//             if(myXhr.upload){ // check if upload property exists
	//                 myXhr.upload.addEventListener('progress',function(){}, false); // for handling the progress of the upload
	//             }
	//             return myXhr;
	//         },
	//         //Ajax events
	//         data: {image:fd},
	//         success: function(profileHtml){},
	//         error: function(jqXHR, textStatus, errorThrown) {alert(errorThrown);},
	//         cache: false,
 	//        	contentType: false,
 	//        	processData: false
	//     });
	// });

	$('.userProfileContainer').on('click','#profileSaveBt',function(){
		var email = $('.userProfileEmail').attr('value');
		var user_name = $('.userProfileName').attr('value');
		var location = $('.userProfileLocation').attr('value');
		$.ajax({
	        url: '/user/profile_change',
	        type: 'POST',
	        data:{email:email,user_name:user_name,location:location},
	        success: function(new_user){
	        	console.log(new_user);
	        	data.user = new_user;
	        	initialize();
	        	$('.userProfileContainer').remove();
			},
			error: function(jqXHR, textStatus, errorThrown) { alert(errorThrown); }
	    });
	});

	$('.userProfileContainer').on('click','#profileCancelBt',function(){
		$('.userProfileContainer').remove();
	});
});

function profileSet(){
	$('.userProfileName').attr('value',profile_data.user_name);
	$('.userProfileEmail').attr('value',profile_data.email)
}