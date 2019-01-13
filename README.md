# DistributedSystemsProject
DIT355 University of Gothenburg mini project 
### To start the server: 
`npm install`   
`npm start`  
Open localhost:3000

### To start mongod service:  
 `service mongod start`  in UNIX terminal.

Server must be run on a Linux machine to execute *srcML* and *nmap*.  
To install *nmap* run `sudo apt-get install nmap` in the console.  
`MongoDB` is required to be active and running on starting the server.

A *github* account is required to login.  
After loggin in choose a repository and click on *View Diagram* to see it visualised.  
Multiple server can be connected and use seperate databases which will allow for fault-tolerance and distribution.  
If people are editing on a different database they cannot make changes.

Dependencies handled by `npm`

__backend__ Folder contains the code for the backend and middleware.  
* __middleware__ folder contains the blackboard code.  
* __models__ contains our data model template that we use to save to the database.  
* __script__ contains components for the logic, like converting code to xml and visualizing it, finding different servers on the network etc.  

__frontend__ folder contains the code for the frontend and visualisation. Inside it you can find the html files for the web pages.    
* __css__ folder contains all the css files and a folder with the images that we're using for our logo and the front page.
* __scripts__ folder contains the javascript files managing the frontend.

__srcML__ contains the source code for [srcML](https://www.srcml.org/) for Ubuntu.
