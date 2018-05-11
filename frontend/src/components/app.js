import React from 'react';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ""
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
    render() {
        return(
            <div>
                <input id="yelpsearch" 
                    type="text" 
                    onChange={this.handleChange} 
                    onKeyDown={this.handleKeys} 
                    value={this.state.inputValue} />
            </div>
        );
    }
}