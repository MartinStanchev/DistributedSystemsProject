var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiagramSchema = new Schema({
    user : { type: Schema.Types.ObjectId, ref: 'users'}
});

module.exports = mongoose.model('Diagram', DiagramSchema);