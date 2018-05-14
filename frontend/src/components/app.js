import React from 'react';
import ResultSet from './result_set';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            signed_in: false,
            user: {},
            results: null
        }

        this.handleChange = (e) => {
            this.setState({inputValue: e.target.value});
        }

        this.handleKeys = (e) => {
            switch(e.key) {
                case("Enter"): this.submit(e.target.value); break;
                default: break;
            }
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
            .then(json => this.setState({results: json}));
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
        let signIn = <a href="/auth/twitter">Sign in with twitter</a>;
        if(this.state.signed_in) {
            signIn = <span>Hello, {this.state.user.screen_name}</span>;
        }
        return(
            <div>
                <div>{signIn}</div>
                <input id="yelpsearch" 
                    type="text" 
                    onChange={this.handleChange} 
                    onKeyDown={this.handleKeys} 
                    value={this.state.inputValue} />
                { this.state.results && 
                    <ResultSet 
                        results={this.state.results} 
                        goingClick={this.goingClick} 
                        userid={this.state.user.user_id} />
                }
            </div>
        );
    }
}