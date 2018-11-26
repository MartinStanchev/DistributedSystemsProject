var fs = require('fs');
var DiagramSchema = require('../models/Diagram');
var admZip = require("adm-zip");
var xmlEmcoder = require('./xmlEncoder');

var classNames = [];
var classExtends = [];
var classConecteds = [];

module.exports = {
    readXML : function(GitRepo){
        classNames = [];
        classNames = [];
        classExtends = [];
        classConecteds = [];
        var excist;
        var readMe = fs.readFileSync("/DistributedSystemsProject/resources/javaProject.xml", 'utf8');
    
        if(readMe.includes(".java")){
            var arrayOfLines = readMe.split("\n"); 
            var currentClassName;

            //Check for classes and extensions
            for(var i = 0;i < arrayOfLines.length;i++){
                var line = arrayOfLines[i];
                if(line.includes("<class><specifier>public</specifier>")){
                    var firstIndex;
                    var lastIndex;
                    for(var j = 0 ; j < line.length ; j++){
                        if(line.substring(0,j) === "<class><specifier>public</specifier> class <name>"){
                            firstIndex = j;
                        }
                        if(line.substring(firstIndex,j).includes("</name>") ){
                            lastIndex = j-7;
                            break;
                        }
                    }
                    
                    var className = line.substring(firstIndex,lastIndex);
                    currentClassName = className;
                    classNames.push(className);
                }
                if(line.includes("extends")){
                    var firstExtendsIndex;
                    var lastExtendsIndex;
                    for(var j = lastIndex ; j < line.length ; j++){
                        if(line.substring(lastIndex,j) === "</name> <super><extends>extends <name>"){
                            firstExtendsIndex = j;
                        }
                        if(line.substring(firstExtendsIndex,j).includes("</name></extends>")){
                            lastExtendsIndex = j-17;
                            break;
                        }
                    }
                    var classExtend = {subClass: currentClassName  ,  superClass: line.substring(firstExtendsIndex,lastExtendsIndex)};
                    classExtends.push(classExtend);
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
                        if(line.substring(0,j) === "<class><specifier>public</specifier> class <name>"){
                            firstIndex = j;
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
 
        return [classNames,classExtends,classConecteds];
    },
    SaveDiagram : function(GitRepo){
            var Diagram = new DiagramSchema({
                GitRepo :  GitRepo,
                Classes : classNames,
                classExtends : classExtends,
                classConecteds : classConecteds
            });
            Diagram.save(function(err) {
            if (err) {
              return next(err);
            }
                console.log("data saved to database");
                return (Diagram);
            });
    },
    convertZip : function(path){
        var zip = new admZip();
        zip.addLocalFolder("/DistributedSystemsProject/resources/" + path);
        zip.writeZip("/DistributedSystemsProject/resources/" + path + ".zip");
        console.log("zip file created");
        xmlEmcoder.saveXML(path);
        
    }
};