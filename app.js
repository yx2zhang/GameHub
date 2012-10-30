
/**
 * Module dependencies.
 */

var express = require('express')
  , user = require('./routes/user')
  , game = require('./routes/game');

var app = module.exports = express.createServer();
var db = require('./db'); 

var MemStore =  express.session.MemoryStore;

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

//games
app.post('/game/new',requiresLogin, game.newGame);
app.get('/game/:id', requiresLogin, game.showGame);
app.post('/game/start', game.startGame);
app.post('/game/deal',game.dealGame);
app.post('/game/hit',game.hitGame);
app.post('/game/stand',game.standGame);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
