import React from 'react';
import ResultSet from './result_set';
import TopBar from './topbar';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            signed_in: false,
            user: {},
            results: null
        }

        this.submit = (query) => {
            fetch("/api/search/" + query, {
                credentials: "same-origin"
            }).then(response => response.ok ? response.json() : null)
            .then(json => this.setState({results: json}));
        }

        this.goingClick = (id) => {
            fetch(`/api/${this.state.results.query}/${id}`, {
                credentials: "same-origin",
                method: "POST"
            }).then(response => response.ok ? response.json() : null)
            .then(json => {
                if(json) {
                    this.setState({results: json})
                } else {
                    this.twitterSignIn();
                }
            });
        }

        this.twitterSignIn = () => {
            window.location.assign(window.location.origin + "/auth/twitter");
        }
    }

    componentDidMount() {
        const storedState = localStorage.getItem("appState");
        if(storedState) {
            this.setState(JSON.parse(storedState));
        }
        fetch("/api/login")
        .then(response => response.ok ? response.json() : null)
        .then(json => {
            if(json) {
                this.setState({signed_in: true, user: json});
            } else {
                this.setState({signed_in: false, user: json});
            }
        });
    }

    componentDidUpdate() {
        localStorage.setItem("appState", JSON.stringify(this.state));
    }

    render() {
        return(
            <div>
                <TopBar 
                    submit={this.submit}
                    user={this.state.user} 
                    twitterSignIn={this.twitterSignIn} />
                { this.state.results &&
                    <ResultSet 
                        results={this.state.results} 
                        goingClick={this.goingClick} 
                        userid={this.state.user ? this.state.user.user_id : null} />
                }
            </div>
        );
    }
}