var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
    ClassName : { type: String },
    SubClass : { type: String },
	SuperClass : { type: String },
    Relation  : [{ type: String }],
    Diagram : { type: Schema.Types.ObjectId, ref: 'Diagram'}
});

module.exports = mongoose.model('Classes', ClassSchema);