
var app = new Vue({	
    el: '#profile'
    , data: {
        user: []
        , diagrams: []
    }
    , methods: {
		 
        queryGitRepo: function () {
            const query = window.location.search.substring(1)
            const token = query.split('access_token=')[1]
            fetch('https://api.github.com/user/repos', {
                headers: {
                    Authorization: 'token ' + token
                }
            }).then(res => res.json()).then(res => {
                this.diagrams = res;
            })
        }
        , queryGitUser: function () {
            const query = window.location.search.substring(1)
            const token = query.split('access_token=')[1]
            fetch('https://api.github.com/user', {
                headers: {
                    Authorization: 'token ' + token
                }
            }).then(res => res.json()).then(res => {
                this.user = res;
            })
        }
        , addRepo: function (repoUrl, pushed_at) {
			const query = window.location.search.substring(1)
            const token = query.split('access_token=')[1]
            console.log(repoUrl)
            console.log("PUSHED AT: " + pushed_at);
            window.location.href = "/uml.html?repo=" + repoUrl.slice(19).replace(/\//g, "_")+"?access_token="+token;  
            let Diagram = {
                GitRepo: repoUrl,
                pushed_at: pushed_at
            };
            axios.post('/api/diagrams', Diagram).then((response) => {
                return Diagram;
            }).catch((error) => {
                console.log(error);
            });

        }
        //TODO: this logout function needs to be fixed this is just sad
            /*logout:function() {
            var req = new XMLHttpRequest();
            req.open("POST", "http://192.168.1.63:8000/weather/logout/", true);
            req.withCredentials = true;
            req.send();
          
            document.getElementById('log_form').style.display = '';
            document.getElementById('logged_user').style.display = 'none';
            document.getElementById('logout_button').style.display = 'none';
            document.getElementById('content').style.display = 'none';
            hide_error();
          }*/
        
    }
    , beforeMount() {
        this.queryGitUser();
        this.queryGitRepo();
    }
})