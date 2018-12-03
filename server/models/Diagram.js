var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiagramSchema = new Schema({
    GitRepo : { type: String, unique: true},
    Classes : [{key : String , name : String 
        , properties : [{name : String, type : {type : String} , visibility : String }]
        , methods:  [{name: String, type: {type : String}, parameters: [{ name: String, type: {type : String}  }], visibility: String  }]}],
    classConecteds : [{from: String , to : String , relationship : String}]
});

module.exports = mongoose.model('Diagram', DiagramSchema);