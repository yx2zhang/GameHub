var mongoose = require('mongoose');
var db = module.exports = mongoose.createConnection('localhost', 'test');
require('./models/userModel');
require('./models/blackJackGameModel');
require('./models/blackJackDeckModel');
require('./models/messagerModel');