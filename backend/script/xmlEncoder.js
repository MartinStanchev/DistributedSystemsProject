var shell = require('shelljs');
var script= require('./script');

module.exports = {
    saveXML : function(path){    
        var res_dir = __dirname + '/../../resources';
        var srcml = 'srcml ';
        if(shell.ls('-A', res_dir)) {
            shell.echo(shell.ls('-A', res_dir));
            shell.echo('dir exists');
            if(shell.exec( srcml + res_dir + '/' + path +' -o ' + res_dir + '/' + path +'.xml').code !== 0) {
                shell.echo('Error: srcml command failed.');
                shell.exit(1);
            }
            console.log("xml created");
            //script.readXML(path);
            return 1;
        } else {
            res.status('404').json({"message":"No file in directory resources"});
        }
    }
};