var fs = require('fs');
var DiagramSchema = require('../models/Diagram');
var admZip = require("adm-zip");
var xmlEmcoder = require('./xmlEncoder');
var shell = require("shelljs");
var classNames;
var ClassExtends;
var classConecteds;

module.exports = {
    readXML : function(GitRepo){
        classNames = [];
        classNames = [];
        ClassExtends = [];
        classConecteds = [];
        var excist;
        var readMe = fs.readFileSync(shell.pwd() + "/resources/" + GitRepo + ".xml", 'utf8');
    
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
                    classFound = true;
                    classNames.push(className);
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
                    var classExtend = {SubClass: currentClassName  ,  SuperClass: line.substring(firstExtendsIndex,lastExtendsIndex)};
                    ClassExtends.push(classExtend);
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
                    if(line.includes(classNames[j])){
                        if(current != classNames[j]){
                            var classConected = {MainClass:current , UsedClass:classNames[j]};
    
                            if(classConecteds.length < 1 && classConected.MainClass != null){
                                classConecteds.push(classConected);
                            }
                            else{
                                excist = false;
                                for(var k = 0; k < classConecteds.length; k++){
                                    if(((classConecteds[k].MainClass === classConected.MainClass) && (classConecteds[k].UsedClass === classConected.UsedClass)) || ((classConecteds[k].MainClass === classConected.UsedClass) && (classConecteds[k].UsedClass === classConected.MainClass))){
                                        excist = true;
                                        break;
                                    }
                                }
                                if(excist === false && classConected.MainClass != null){
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
        this.SaveDiagram(GitRepo);
 
    },
    cleanUpFiles : function (pathToFolder) {
        shell.echo('deleting files... \n' + shell.ls('-A', shell.pwd() + '/resources/'));
        shell.rm('-rf', shell.pwd() + '/resources/' + pathToFolder);
        shell.rm(shell.pwd() + '/resources/' + pathToFolder + ".xml");
    },
    SaveDiagram : function(GitRepo){
        var Diagram = new DiagramSchema({
            GitRepo :  GitRepo,
            Classes : classNames,
            classExtends : ClassExtends,
            classConecteds : classConecteds
        });
        Diagram.save(function(err) {
        if (err) {
          return next(err);
        }
            console.log("data saved to database");
            return (Diagram);
        });
        this.cleanUpFiles(GitRepo);
    },
    convertZip : function(path){
       console.log("covertZip file funcation called");
        if(xmlEmcoder.saveXML(path) == 1) {
            this.readXML(path);
        }
        
    }
    
};