var fs = require('fs');
var DiagramSchema = require('../models/Diagram');
var xmlEmcoder = require('./xmlEncoder');
var shell = require("shelljs");
var classNames;
var classConecteds;

module.exports = {
    //read xml file line by line 
    readXML : function(GitRepo){
        classNames = [];
        classConecteds = [];
        var excist;
        var readMe = fs.readFileSync(shell.pwd() + "/resources/" + GitRepo + ".xml", 'utf8');
        if(readMe.includes(".java")){
            var arrayOfLines = readMe.split("\n"); 
            var currentClassName;
            var pushedclass;
            var localPropreties = [];
            var localMethods = [];
            var classFound = false;
            var classFoundForConnection = false;
            //Check for classes ,extensions , attributes and methods
            for(var i = 0;i < arrayOfLines.length;i++){
                var line = arrayOfLines[i];

                if(line.includes("<class><specifier>public</specifier>") ){
                    currentClassName = this.FindClass(line);
                    localPropreties = [];
                    localMethods = [];
                    classFound = true;
                }
                if(line.includes("extends") && classFound === true)  {
                    this.FindSuperClass(line,currentClassName);
                }
                if(line.includes("<decl_stmt><decl>") && classFound === true){
                    var foundProprety = this.FindAttributes(line);
                    var dublicate = false;
                    for(var j = 0 ; j < localPropreties.length ; j++){
                        if(localPropreties[j].name == foundProprety.name){
                            dublicate = true;
                            break;
                        }
                        
                    }
                    if(dublicate == false){
                        if(foundProprety.name.length < 20 && foundProprety.type.length < 20 && foundProprety.visibility.length < 20){
                            localPropreties.push(foundProprety);
                        }
                    }
                }
                if(line.includes("<function>") && classFound === true){
                    var foundFuncation = this.FindMethod(line);
                    if(foundFuncation.type.length < 20 && foundFuncation.name.length < 20 && foundFuncation.visibility.length < 20){
                        localMethods.push(foundFuncation);
                    }
                }
                if(line.includes("</class>")){
                    pushedclass = { key : currentClassName , name : currentClassName , properties : localPropreties , methods : localMethods};
                    classFound = false;
                    classNames.push(pushedclass);
                }
            }
            //Check for connection between classes 
            for(var i = 0;i < arrayOfLines.length;i++){
                var line = arrayOfLines[i];
                if(line.includes("<class><specifier>public</specifier>")){
                    currentClassName = this.FindClass(line);
                    classFoundForConnection = true;
                }
                if(classFoundForConnection){
                    this.FindClassConnection(line,currentClassName);
                }
            }
        return this.SaveDiagram(GitRepo);
        }
    },
    //find classes 
    FindClass: function(line){
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
        
        return line.substring(firstIndex,lastIndex);
    },
    // find super classes of the found classes
    FindSuperClass: function(line, currentClassName){
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
        var classExtend = {from : line.substring(firstExtendsIndex,lastExtendsIndex) ,
                                 to : currentClassName , relationship: "generalization"};
        classConecteds.push(classExtend);
        return classExtend;
    },
    //find attributes of the class
    FindAttributes : function(line){
        var firstVisibilityIndex;
        var lastVisibilityIndex;
        var firstTypeIndex;
        var lastTypeIndex;
        var firstNameIndex;
        var lastNameIndex;
        var specifierFound = false;
        var firstSpecifierIndexFound = false;
        var typeFound = false;
        var firstTypeIndexFound = false;
        var nameFound = false;
        var firstNameIndexFound = false;
        for(var j = 0; j < line.length ; j++){
            if(line.substring(0,j).includes("<decl_stmt><decl><specifier>") && specifierFound == false && firstSpecifierIndexFound == false){
                firstVisibilityIndex = j;
                firstIndexFound = true;
            }
            if(line.substring(firstVisibilityIndex,j).includes("</specifier>") && specifierFound == false && firstSpecifierIndexFound == true ){
                lastVisibilityIndex = j-12;
                specifierFound = true;
            }
            if(line.substring(0,j).includes("<name>") && firstTypeIndexFound == false && typeFound == false){
                firstTypeIndex = j;
                firstTypeIndexFound = true;
            }
            if(line.substring(firstTypeIndex,j).includes("</name>") && firstTypeIndexFound == true && typeFound == false){
                lastTypeIndex = j-7;
                typeFound = true;
            }
            if(line.substring(0,j).includes("</name></type> <name>") && firstNameIndexFound == false && nameFound == false){
                firstNameIndex = j;
                firstNameIndexFound = true;
            }
            if(line.substring(firstNameIndex,j).includes("</name>") && firstNameIndexFound == true && nameFound == false){
                lastNameIndex = j-7;
                nameFound = true;
                break;
            }
        }
        var visibility1 ;
        if(specifierFound == false){
            visibility1 = "public";
        }
        else{
            visibility1 = line.substring(firstVisibilityIndex,lastVisibilityIndex);
        }
        var type1 = line.substring(firstTypeIndex,lastTypeIndex);
        var name1 = line.substring(firstNameIndex,lastNameIndex);
        var ls = {name : name1 , type : type1 , visibility : visibility1};
        return ls;
    },
    //find the fincations of the class
    FindMethod : function(line){
        var firstVisibilityIndex;
        var lastVisibilityIndex;
        var firstTypeIndex;
        var lastTypeIndex;
        var firstNameIndex;
        var lastNameIndex;
        var firstParNameIndex;
        var lastParNameIndex;
        var specifierFound = false;
        var firstSpecifierIndexFound = false;
        var typeFound = false;
        var firstTypeIndexFound = false;
        var nameFound = false;
        var firstNameIndexFound = false;
        var parNameFound = false;
        var firstParNameIndexFound = false;
        for(var j = 0; j < line.length ; j++){
            if(line.substring(0,j).includes("<function><specifier>") && specifierFound == false && firstSpecifierIndexFound == false){
                firstVisibilityIndex = j;
                firstIndexFound = true;
            }
            if(line.substring(firstVisibilityIndex,j).includes("</specifier>") && specifierFound == false && firstSpecifierIndexFound == true ){
                lastVisibilityIndex = j-12;
                specifierFound = true;
            }
            if(line.substring(0,j).includes("<name>") && firstTypeIndexFound == false && typeFound == false){
                firstTypeIndex = j;
                firstTypeIndexFound = true;
            }
            if(line.substring(firstTypeIndex,j).includes("</name>") && firstTypeIndexFound == true && typeFound == false){
                lastTypeIndex = j-7;
                typeFound = true;
            }
            if(line.substring(0,j).includes("</name></type> <name>") && firstNameIndexFound == false && nameFound == false){
                firstNameIndex = j;
                firstNameIndexFound = true;
            }
            if(line.substring(firstNameIndex,j).includes("</name>") && firstNameIndexFound == true && nameFound == false){
                lastNameIndex = j-7;
                nameFound = true;
            }
            //this work i can find the type name of the parameter
            /*if(line.substring(0,j).includes("<parameter><decl><type><name>") && firstParTypeIndexFound == false && parTypeFound == false){
                firstParTypeIndex = j;
                firstParTypeIndexFound = true;
            }
            if(line.substring(firstParTypeIndex,j).includes("</name></type>") && firstParTypeIndexFound == true && parTypeFound == false){
                lastParTypeIndex = j- 14;
                parTypeFound = true;
            }
            //this doesnt work when activated the system cant process any data
            if(line.substring(lastParTypeIndex,j).includes("<name>") && firstParNameIndexFound == false && parName == false && parTypeFound == true){
                firstParNameIndex = j;
                firstParNameIndexFound = true;
            }
            if(line.substring(firstParNameIndex,j).includes("</name>") && firstParNameIndexFound == true && parName == false && parTypeFound == true){
                lastParNameIndex = j- 7;
                parName = true;
            }*/
        }
        var visibility1 ;
        if(specifierFound == false){
            visibility1 = "public";
        }
        else{
            visibility1 = line.substring(firstVisibilityIndex,lastVisibilityIndex);
        }
        var type1 = line.substring(firstTypeIndex,lastTypeIndex);
        var name1 = line.substring(firstNameIndex,lastNameIndex);
        /*if(parNameFound){
            var parName = line.substring(firstParNameIndex, lastParNameIndex);
            console.log(parName);
            var parType = line.substring(firstParTypeIndex,lastParTypeIndex);
            console.log(parType);
        }*/
        ls = {name: name1, type : type1 , visibility: visibility1 }

        return ls;
    },
    //find the other classes that is connected to the found class
    FindClassConnection : function(line,current){
        var excist;
        for(var j = 0; j < classNames.length ; j++){
            if(line.includes(classNames[j].name)){
                if(current != classNames[j].name){
                    if(line.includes("new")){
                        var classConected = {from : current , to : classNames[j].name , relationship : "aggregation"};
                    }else{
                        var classConected = {from : current , to : classNames[j].name , relationship : ""};
                    }

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
    },
    //delete xml file after processing data and saving it to database
    cleanUpFiles : function (pathToFolder) {
        shell.echo('deleting files... \n' + shell.ls('-A', __dirname + '/../../resources/'));
        shell.rm('-rf', __dirname + '/../../resources/' + pathToFolder);
        shell.rm(__dirname + '/../../resources/' + pathToFolder + ".xml");
    },
    //save the data that is generated from reading xml file to database
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
        this.cleanUpFiles(GitRepo);
    },
    // converts the file that is downloaded from the github to a zip and makes the connection between script.js and xmlEncoder.js
    convertZip : function(path){
        if(xmlEmcoder.saveXML(path) == 1) {
            return this.readXML(path);
        }
        
    }
};