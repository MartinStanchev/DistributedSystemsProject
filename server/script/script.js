var fs = require('fs');
var DiagramSchema = require('../models/Diagram');
var xmlEmcoder = require('./xmlEncoder');
var shell = require("shelljs");
var repoPath = "resources/"
var classNames;
var classConecteds;

module.exports = {
    readXML : function(GitRepo){
        classNames = [];
        classConecteds = [];
        var excist;
        var readMe = fs.readFileSync(shell.pwd() + "/resources/javaProject.xml", 'utf8');
    
        if(readMe.includes(".java")){
            var arrayOfLines = readMe.split("\n"); 
            var currentClassName;

            //Check for classes and extensions
            for(var i = 0;i < arrayOfLines.length;i++){
                var line = arrayOfLines[i];
                var classFound = false;

                if(line.includes("<class><specifier>public</specifier>") ){
                    var firstIndex;
                    var lastIndex;
                    classFound = false;
                    for(var j = 0 ; j < line.length ; j++){
                        
                        if(line.substring(j,j+12) === "class <name>"){
                            firstIndex = j+12;
                        }
                        if(line.substring(firstIndex,j).includes("</name>") ){
                            lastIndex = j-7;
                            break;
                        }
                    }
                    
                    var className = line.substring(firstIndex,lastIndex);
                    currentClassName = className;
                    var pushedclass = { key : className , name : className , 
                        properties : [{ name : "classes", type : "List<Course>" , visibility : "public"}] };

                    classFound = true;
                    classNames.push(pushedclass);
                }
                if(line.includes("extends") && classFound === true)  {
                    var firstExtendsIndex;
                    var lastExtendsIndex;
                    var firstFound = false;
                    for(var j = 0 ; j < line.length ; j++){
                        if(line.substring(j,j+14) === "extends <name>"){
                            firstExtendsIndex = j+14;
                            firstFound = true;
                        }
                        if(line.substring(firstExtendsIndex,j).includes("</name>") && firstFound === true){
                            lastExtendsIndex = j-7;
                            break;
                        }
                    }
                    var classExtend = {from : line.substring(firstExtendsIndex,lastExtendsIndex) , to : currentClassName , relationship: "aggregation"};
                    classConecteds.push(classExtend);
                }
            }
            //Check for connection between classes 
            for(var i = 0;i < arrayOfLines.length;i++){
                var line = arrayOfLines[i];
                var current;
                if(line.includes("<class><specifier>public</specifier>")){
                    var firstIndex;
                    var lastIndex;
                    for(var j = 0 ; j < line.length ; j++){
                        if(line.substring(j,j+12) === "class <name>"){
                            firstIndex = j+12;
                        }
                        if(line.substring(firstIndex,j).includes("</name>") ){
                            lastIndex = j-7;
                            break;
                        }
                    }
                    var className = line.substring(firstIndex,lastIndex);
                    current = className;
                }
                for(var j = 0; j < classNames.length ; j++){
                    if(line.includes(classNames[j].name)){
                        if(current != classNames[j].name){
                            var classConected = {from : current , to : classNames[j].name , relationship : "generalization"};
    
                            if(classConecteds.length < 1 && classConected.from != null){
                                classConecteds.push(classConected);
                            }
                            else{
                                excist = false;
                                for(var k = 0; k < classConecteds.length; k++){
                                    if(((classConecteds[k].from === classConected.from) && (classConecteds[k].to === classConected.to)) || 
                                    ((classConecteds[k].from === classConected.to) && (classConecteds[k].to === classConected.from))){
                                        excist = true;
                                        break;
                                    }
                                }
                                if(excist === false && classConected.from != null){
                                    classConecteds.push(classConected);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log("data generated from the xml");
        return this.SaveDiagram(GitRepo);
    },
    SaveDiagram : function(GitRepo){
        var Diagram = new DiagramSchema({
            GitRepo :  GitRepo,
            Classes : classNames,
            classConecteds : classConecteds
        });
        Diagram.save(function(err) {
        if (err) {
            console.log("couldnt save data to database" + err)
          return (err);
        }
                          
            console.log("data saved to database");
            return (Diagram);
        });
    },
    convertZip : function(path){
       console.log("covertZip file funcation called");
        if(xmlEmcoder.saveXML(path) == 1) {
            return this.readXML(path);
        }
        
    }
};