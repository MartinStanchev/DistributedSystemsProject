var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    Email : { type: String },
    Password : { type: String },
    OtherUsers : [{ type: String }],
    GitRepo : {type : String}
});

module.exports = mongoose.model('users', UserSchema);