var app = new Vue({
    el: '#profile'
    , data: {
        user: []
        , repos: []
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
                this.repos = res;
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
            let Repo = {
                url: repoUrl
            };
            axios.post('/api/gitrepository', Repo).then((response) => {
                return Repo;
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