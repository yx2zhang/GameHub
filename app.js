/**
 * Module dependencies.
 */
 
var express = require('express')

var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , user = require('./routes/user')
  , blackjack = require('./routes/games/blackjack')
  , db = require('./db')
  , realtime = require('./realtime');

var MemStore =  express.session.MemoryStore;

io.sockets.on('connection',function(socket){
  socket.on('init',function(data){
      realtime.clients[data.user_id] = socket;
  });
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false,  pretty: true});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'secret_key',
    store: MemStore({
      reapInterval: 60000 * 10
    })
  }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

function requiresLogin(req,res,next){
  if(req.session.user){
    next();
  }else{
    res.redirect('/');
  }
}

// Routes
app.get('/',user.index);
app.post('/',user.login);
app.post('/user/new',user.createNewUser);
app.get('/user/:id',requiresLogin,user.showUser);

app.post('/user/invite',requiresLogin,user.invite);
app.post('/user/search_friend',requiresLogin,user.searchFriend);
app.post('/user/friend_request',requiresLogin,user.friendRequest);
app.post('/user/accept_friend',requiresLogin,user.acceptFriend);

app.post('/user/show_friends',requiresLogin,user.showFriends);
app.post('/user/show_messages',requiresLogin,user.showMessages);
app.post('/user/games_list',requiresLogin,user.gamesList);
app.post('/user/show_games',requiresLogin,user.showGames);
app.post('/user/show_my_games',requiresLogin,user.showMyGames);

app.post('/user/back_game',requiresLogin,user.backGame);
app.post('/user/invite_friend',requiresLogin,user.inviteFriend);
app.post('/user/accept_invite',requiresLogin,user.acceptInvite);
app.post('/user/show_profile',requiresLogin,requiresLogin,user.showProfile);
app.post('/user/upload_profile_image',requiresLogin,user.uploadProfileImage);

app.post('/user/profile_change',requiresLogin,user.profileChange);
app.get('/log_out',requiresLogin,user.logout);

//games
app.post('/game/blackjack/new',requiresLogin, blackjack.newGame);
app.get('/game/blackjack/:id', requiresLogin, blackjack.showGame);

// app.post('/game/blackjack/start', blackjack.startGame);
app.post('/game/blackjack/deal',requiresLogin,blackjack.dealGame);
app.post('/game/blackjack/hit',requiresLogin,blackjack.hitGame);
app.post('/game/blackjack/stand',requiresLogin,blackjack.standGame);
app.post('/game/blackjack/joint',requiresLogin,blackjack.jointGame);
app.post('/game/blackjack/back_game',requiresLogin,blackjack.backGame);
app.post('/game/blackjack/quit',requiresLogin,blackjack.quit);

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});
