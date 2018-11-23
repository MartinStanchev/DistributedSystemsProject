//
// USE LIKE THIS: include
// var toxml = require('./codeToXml) if in same folder
// var toxml = require('../codeToXml') if in controllers folder
// use:
// toxml.to_xml(ARCHIVE_NAME); 
// input archive must be in resources, output will be generated in resources with name generated.xml
var express = require('express');
var router = express.Router();
var shell = require('shelljs');

module.exports = {
    
    to_xml: function(project_name) {
        var res_dir = shell.pwd() + '/resources';
        var srcml = shell.pwd() + '/srcML/bin/srcml ';
        if(shell.ls('-A', res_dir)) {
            shell.echo('dir exists');
            if(shell.exec( srcml + res_dir + '/' + project_name + ' -o ' + res_dir + '/generated.xml').code !== 0) {
                shell.echo('Error: srcml command failed.');
                return false;
            } else {
                shell.echo('Successfully generated xml')
                return true;
            }

        } else {
            shell.echo("ERROR: resources dir not found or no files in it")
        }
    }
}