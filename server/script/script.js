var fs = require('fs');
var DiagramSchema = require('../models/Diagram');
var classNames = [];
var classExtends = [];
var classConecteds = [];

module.exports = {
    readXML : function(){

        var excist;
        var readMe = fs.readFileSync("/DistributedSystemsProject/resources/javaProject.xml", 'utf8');
    
        if(readMe.includes(".java")){
            var arrayOfLines = readMe.split("\n"); 
            var currentClassName;
            for(var i = 0;i < arrayOfLines.length;i++){
                var line = arrayOfLines[i];
                if(line.includes("<class>")){
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
                for(var j = 0; j < classNames.length ; j++){
                    if(line.includes(classNames[j])){
                        if(currentClassName != classNames[j]){
                            var classConected = {MainClass:currentClassName , UsedClass:classNames[j]};
                            //classConecteds.push(classConected);

                            if(classConecteds.length < 1){
                                classConecteds.push(classConected);
                            }
                            else{
                                excist = false;
                                for(var k = 0; k < classConecteds.length; k++){
                                    if((classConecteds[k].MainClass === classConected.MainClass) && (classConecteds[k].UsedClass == classConected.UsedClass)){
                                        excist = true;
                                        break;
                                    }
                                 }
                                 if(excist === false){
                                    classConecteds.push(classConected);
                                 }
                            }
                        }
                    }
                }
            }
        }
        this.SaveDiagram();
        return [classNames,classExtends,classConecteds];
    },
    SaveDiagram : function(){
            var Diagram = new DiagramSchema({
                GitRepo :  "", //TODO: needs to be fixed base on the git repo
                Classes : classNames,
                classExtends : classExtends,
                classConecteds : classConecteds
            });
            Diagram.save(function(err) {
            if (err) {
              return next(err);
            }
              return (Diagram);
            });
    }
};