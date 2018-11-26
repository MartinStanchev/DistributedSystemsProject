var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiagramSchema = new Schema({
    GitRepo : { type: String},
    Classes : [{type : String}],
    classExtends : [{SubClass: String , SuperClass : String}],
    classConecteds : [{MainClass: String , UsedClass : String}]
});

module.exports = mongoose.model('Diagram', DiagramSchema);