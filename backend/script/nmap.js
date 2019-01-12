var fs = require('fs');
var shell = require("shelljs");
var os = require('os');
var ifaces = os.networkInterfaces();
var request = require('request');
var IPs = [];

module.exports = {
    FindIPs : function(){
        var localIP = this.FindLocalIP();
        var res_dir = shell.pwd()  + '/resources';
        if(shell.ls('-A', res_dir)) {
            shell.echo(shell.ls('-A', res_dir));
            if(shell.exec( 'sudo nmap -sn '+ localIP + '/24 -oN ' + res_dir+'/ips').code != 0) {
                shell.echo('Error: nmap command failed.');
                shell.exit(1);
            }
            var readMe = fs.readFileSync(res_dir + "/ips" , 'utf8');
            var arrayOfLines = readMe.split("\n"); 
            for(var i = 1;i < arrayOfLines.length -1;i++){
                var line = arrayOfLines[i];
                if(line.includes('Nmap scan')){
                    var first;
                    var last;
                    var found = false;
                    for(var j = 0; j < line.length ; j++){
                        if(line.substring(0,j).includes('192') && found == false){
                            found = true;
                            first = j-3;
                        }
                        
                    }
                    if(line.substring(line.length-1,line.length) == ')'){
                        last = line.length -1;
                    }
                    else{
                        last = line.length;
                    }
                    ip = line.substring(first,last);
                    if(ip != localIP){
                        this.FindActiveIP(ip);
                    }
                }
            }
        } else {
        }
    },
    FindLocalIP : function(){
        var localIP;
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;
          
            ifaces[ifname].forEach(function (iface) {
              if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
              }
          
              if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
              } else {
                // this interface has only one ipv4 adress
                console.log(ifname, iface.address);
                localIP = iface.address;
              }
              ++alias;
            });
            
          });
          return localIP;
    },
    FindActiveIP : function(ip){ 
        var url = "http://" + ip +":3000/api/ip/" + this.FindLocalIP();
        request(url, function(error , response , body){
            if(response != undefined){
                    if(JSON.parse(response.body).ip!= undefined){
                        console.log("this ip is active : " + JSON.parse(response.body).ip);
                        if(IPs.length == 0){
                            IPs.push(JSON.parse(response.body).ip);
                        }
                        else{
                            for(var i = 0 ; i < IPs.length ; i++){
                                if(!IPs.includes(JSON.parse(response.body).ip)){
                                    IPs.push(JSON.parse(response.body).ip);
                                }
                            }
                        }
                    }   
            }
        });
    },
    GetIPs : function(){
        //For fault tolorence
        /*
        var ActiveIPs = [];
        for(var i = 0 ; i < IPs.length ; i++){
            var url = "http://" + IPs[i] +":3000/api/ip/" + this.FindLocalIP();
            request(url, function(error , response , body){
                if(response != undefined){
                    if(JSON.parse(response.body).ip != undefined){
                        console.log("this ip is active : " + JSON.parse(response.body).ip);
                        if(ActiveIPs.length == 0){
                            ActiveIPs.push(JSON.parse(response.body).ip);
                        }
                        else{
                            for(var i = 0 ; i < ActiveIPs.length ; i++){
                                if(!ActiveIPs.includes(JSON.parse(response.body).ip)){
                                    ActiveIPs.push(JSON.parse(response.body).ip);
                                }
                            }
                        }
                    }
                }
            });
        }
        console.log("acaliable ips : " + IPs);
        console.log("active ips : " + ActiveIPs);
        */
        return IPs;
    },
    SetIPs : function(ip){
        if(IPs.length == 0){
            IPs.push(ip);
        }
        else{
            for(var i = 0 ; i < IPs.length ; i++){
                if(!IPs.includes(ip)){
                    IPs.push(ip);
                }
            }
        }
    }

};