var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GitSchema = new Schema({
    GitRepo : { type: String }
});

module.exports = mongoose.model('GitSchema', GitSchema);