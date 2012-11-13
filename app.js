/**
 * Module dependencies.
 */
var express = require('express')

var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , user = require('./routes/user')
  , game = require('./routes/game')
  , db = require('./db')
  , realtime = require('./realtime');

var MemStore =  express.session.MemoryStore;

io.sockets.on('connection',function(socket){
  socket.on('init',function(data){
    realtime.clients[data.user_id] = socket;
  });

  socket.on('invite',function(data){
    var m_socket = realtime.clients[data.receiver];
    m_socket.emit('invite',{sender: data.sender});
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
app.get('/user/:id',user.showUser);
app.post('/user/show_games',user.showGames);
app.post('/user/invite',user.invite);
app.post('/user/search_friend',user.searchFriend);
app.post('/user/show_friends',user.showFriends);
app.post('/user/friend_request',user.friendRequest);
app.post('/user/show_messages',user.showMessages);
app.post('/user/accept_friend',user.acceptFriend);

//games
app.post('/game/new',requiresLogin, game.newGame);
app.get('/game/:id', requiresLogin, game.showGame);
app.post('/game/start', game.startGame);
app.post('/game/deal',game.dealGame);
app.post('/game/hit',game.hitGame);
app.post('/game/stand',game.standGame);

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});
