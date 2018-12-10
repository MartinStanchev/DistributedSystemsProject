var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    diagramId:{type: String},
    comments: [{
        userId: {type: String, require: true},
        comment: {type: String, require: true},
        time:{type: Date, required: true}
    }]
})

module.exports = mongoose.model('Comments', CommentSchema);