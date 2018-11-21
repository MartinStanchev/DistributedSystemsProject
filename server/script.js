var fs = require('fs');
var express = require('express');

module.exports = {
    readXML : function(){
        var classNames = [];
        var classExtends = [];
        var classConecteds = [];

        var readMe = fs.readFileSync("q2.xml", 'utf8');
    
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
                            classConecteds.push(classConected);

                           /* if(classConecteds.length < 1){
                                classConecteds.push(classConected);
                            }
                            else{
                                for(var k = 0; k < classConecteds.length; k++){
                                    if(classConecteds[k].MainClass !== classConected.MainClass || classConecteds[k].UsedClass !== classConected.UsedClass){
                                     classConecteds.push(classConected);
                                     }
                                 }
                            }*/
                        }
                    }
                }
            }
        }
        console.log("all class names");
        console.log(classNames);
        console.log("all extended classes");
        console.log(classExtends);
        console.log("all connected classes");
        console.log(classConecteds);
        return [classNames,classExtend,classConecteds];
    },

};
