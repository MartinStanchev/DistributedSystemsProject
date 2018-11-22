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
        , addRepo: function (repoUrl) {
            console.log(repoUrl)
            let Diagram = {
                GitRepo: repoUrl
            };
            axios.post('/api/diagrams', Diagram).then((response) => {
                return Diagram;
            }).catch((error) => {
                console.log(error);
            });
        }
    }
    , beforeMount() {
        this.queryGitUser();
        this.queryGitRepo();
    }
})