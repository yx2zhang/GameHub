// require('../models/userModel');
// require('../models/blackJackGameModel');
// require('../models/messagerModel');

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
  var new_user = User.new();
  new_user.initialize(req);
  req.session.user = new_user;
  res.redirect('/user/'+ new_user.id); 
};

exports.showUser = function(req,res){
  var resultJson = new Object;
  resultJson.action = 'show_user';
  loadUserAndRun(req,res,resultJson);
}

exports.showFriends= function(req,res){
  var resultJson = new Object;
  resultJson.action = 'show_friends';
  console.log(resultJson);
  loadUserAndRun(req,res,resultJson);
}

exports.showGames = function(req,res){
  var resultJson = new Object;
  resultJson.action = 'show_all_games';
  loadUserAndRun(req,res,resultJson);
}

exports.showMessages = function(req,res){
  User.findById(req.session.user._id,function(error,user){
    var resultJson = new Object;
    resultJson.messager = user.messager;
    res.render('./user/user_messages.jade',{
      data:resultJson
    });
  });
}

exports.searchFriend = function(req,res){
  User.find({'username' : new RegExp(req.body.search_str, 'i')}, function(err, users){
    var resultJson = new Object;
    resultJson.users = users;
    res.render('./user/user_search_result.jade',{
      data:resultJson,
    });
  });
}

exports.friendRequest = function(req,res){
  var message = new Object;
  message.type = 'add_friend';
  message.sender = req.body.sender;
  message.receiver = req.body.receiver;
  sendMessage(req,res,message);
}

exports.acceptFriend = function(req,res){
  User.findById(req.session.user._id,function(error,receiver){
    if(!receiver){
      console.log('can not find reciever');
      res.send(false);
    }else{
      var message = receiver.findMessage(req.body.message_index);
      if(confirmMessage(req,message)){
        addFriends(req,res,message.receiver,message.sender);
      }else{
        console.log('illegal');
        res.send(false);
      }
    }
  });
}

function addFriends(req,res,receiver,sender){
  User.findById(receiver,function(error,receiver){
    User.findById(sender,function(error,sender){
      if(receiver&&sender){
        receiver.addFriend(sender.id);
        sender.addFriend(receiver.id);
        res.send(true);
      }else{
        res.send(false);
      }
    });
  });
}

function confirmMessage(req,message){
  if(message){ 
    return (message.receiver == req.session.user._id);
  }
  else {return false;}
}

function sendMessage(req,res,message){
  User.findById(message.receiver,function(error,receiver){
    if(receiver){
      receiver.receiveMessage(message,message.sender);
      res.send('ture')
    }
  });
}

function loadUserAndRun(req,res,resultJson){
  loadUser(req,res,resultJson);
}

function loadUser(req,res,resultJson){
  User.findById(req.session.user._id,function(error,user){
    if(user==null||user==undefined) res.redirect('/');
    else{
      resultJson.user = user;
      loadFriends(req,res,resultJson);
    }
  });
}

function loadFriends(req,res,resultJson){
  User.find({'_id':{ $in:resultJson.user.friends}},function(error,friends){
    resultJson.friends = friends;
    loadGames(req,res,resultJson);
  });
}

function loadGames(req,res,resultJson){
  bjGame.find({},function(error,games){
    resultJson.games = games;
    loadPlayerGames(req,res,resultJson);
  });
}

function loadPlayerGames(req,res,resultJson){
  bjGame.find({'_id':{ $in:resultJson.user.games}},function(error,player_games){
    resultJson.player_games = player_games;
    runPlayer(req,res,resultJson);
  });
}

function runPlayer(req,res,resultJson){
  if(resultJson.action=='show_all_games'){
    showAllgames(req,res,resultJson);
  }else if(resultJson.action=='show_user'){
    showUser(req,res,resultJson);
  }else if(resultJson.action=='show_friends'){
    showFriends(req,res,resultJson);
  }
}

function showUser(req,res,resultJson){
  res.render('./user/user_show.jade',{
      data:resultJson,
  });
}

function showFriends(req,res,resultJson){
  res.render('./user/user_friends.jade',{
      data:resultJson,
  });
}

function showAllgames(req,res,resultJson){
  res.render('./user/user_games.jade',{
      data:resultJson,
  });
}
