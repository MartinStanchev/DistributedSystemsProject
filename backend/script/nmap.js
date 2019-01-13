var fs = require('fs');
var shell = require("shelljs");
var os = require('os');
var ifaces = os.networkInterfaces();
var request = require('request');
var IPs = [];

module.exports = {
// searches all the ip addresses to the devices that is connected on the same network
    FindIPs : function(){
        IPs = [];
        var localIP = this.FindLocalIP();
        var res_dir = shell.pwd()  + '/resources';
        if(shell.ls('-A', res_dir)) {
            shell.echo(shell.ls('-A', res_dir));
            if(shell.exec( 'nmap -sn '+ localIP + '/24 -oN ' + res_dir+'/ips').code != 0) {
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
    //finds the local ip address of the current device
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
// find active ips by sending an http request to them. if the response to the to the request valid system will add that ip to the ip list
    FindActiveIP : function(ip){ 
        // Fix for strange format on passed ip address (The passed ip adress is passed as an object and not as a string)
        ip = JSON.stringify(ip); // Object to string
        ip = ip.replace(/[^0-9.]/g, ""); // Remove crazy stuff
        var localIp = this.FindLocalIP(); // Local IP
        var url = "http://" + ip +":3000/api/ip/" + localIp; // Build string
        url = JSON.stringify(url); // Stringify string to prevent JS handling it as an object again
        // End of ip string fix  //
        
        //var url = "http://" + ip +":3000/api/ip/" + this.FindLocalIP();
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
    //get the found ips 
    GetIPs : function(){
        return IPs;
    },
    //set the found ips
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