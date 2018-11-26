var shell = require('shelljs');
var script= require('./script');

module.exports = {
    saveXML : function(path){    
        var res_dir = shell.pwd() + '/resources';
        var srcml = shell.pwd() + '/srcML/bin/srcml ';
        if(shell.ls('-A', res_dir)) {
            shell.echo('dir exists');
            if(shell.exec( srcml + res_dir + '/'+path +'.zip -o ' + res_dir + '/javaProject.xml').code !== 0) {
                shell.echo('Error: srcml command failed.');
                shell.exit(1);
            }
            console.log("xml created");
            script.readXML(path);
        } else {
            res.status('404').json({"message":"No file in directory resources"});
        }
    }
};