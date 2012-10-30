require('../models/userModel');
require('../models/blackJackGameModel');

var db = require('../db');
var User = db.model('User');
var bjGame = db.model('blackJackGame');

exports.index = function(req, res){
  res.render('index', { title: 'GameHub'});
};

exports.login = function(req,res){
  User.authenticate(req.param('email'),req.param('password'),function(error,user){
    if(user){
      req.session.user = user;
      res.redirect('/user/'+ user.id);
    }else{
      res.render('index',{ title: 'GameHub'});
    }
  });
};

exports.createNewUser = function(req,res){
  var new_user = User.new({});
  new_user.initialize(req);
  req.session.user = new_user;
  res.redirect('/user/'+ new_user.id); 
};

exports.showUser = function(req,res){
  User.findById(req.params.id,function(error,user){
    if(user==null||user==undefined) res.redirect('/');
    else{
      bjGame.find({},function(error,games){
        res.render('./user/user_show.jade',
        {
          locals: {
            user:user,
            games:games
          }
        });
      });
    }
  });
}