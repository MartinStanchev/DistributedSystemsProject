var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiagramSchema = new Schema({
    GitRepo : { type: Schema.Types.ObjectId, ref: 'GitSchema'},
    Classes : [{type : String}],
    classExtends : [{SubClass: String , SuperClass : String}],
    classConecteds : [{MainClass: String , UsedClass : String}]
});

module.exports = mongoose.model('Diagram', DiagramSchema);