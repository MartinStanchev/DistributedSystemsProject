// Vue component for the profile page

var app = new Vue({	
    el: '#profile'
    , data: {
        user: []
        , diagrams: []
    }
    , methods: {
		 
        // Queries the signed in user's repository data through github api
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
        // Queries the signed in user's profile data through github api
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
        // Creates/views the diagram page and redirects user there once function is called.
        , addRepo: function (repoUrl) {
			const query = window.location.search.substring(1)
            const token = query.split('access_token=')[1]
            console.log(repoUrl)
            window.location.href = "/uml.html?repo=" + repoUrl.slice(19).replace(/\//g, "_")+"?access_token="+token;  
            let Diagram = {
                GitRepo: repoUrl
            };
            axios.post('/api/diagrams', Diagram).then((response) => {
                return Diagram;
            }).catch((error) => {
                console.log(error);
            });
      },  
        
    }
    // These methods are mounted before the page loads for the user
    , beforeMount() {
        this.queryGitUser();
        this.queryGitRepo();
    }
})