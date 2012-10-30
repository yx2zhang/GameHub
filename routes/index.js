/*
 * GET home page.
 */
 
exports.login = function(req, res){
  	console.log('here we are');
  	res.render('index', { title: 'GameHub'});
};