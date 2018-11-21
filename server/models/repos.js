var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var repoModel = new Schema({
    url: String, 
    image: String
});

module.exports = mongoose.model('repos', repoModel);
