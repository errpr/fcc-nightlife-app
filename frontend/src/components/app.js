import React from 'react';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            signed_in: false,
            user: {}
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
            }).then(response => console.log(response));
        }
    }

    componentDidMount() {
        fetch("/api/login")
        .then(response => response.ok ? response.json() : null)
        .then(json => json && this.setState({signed_in: true, user: json}))
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
            </div>
        );
    }
}