import React from 'react';

export default class TopBar extends React.Component {
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
                case("Enter"): this.props.submit(e.target.value); break;
                default: break;
            }
        }
    }

    render() {
        let userInfo = <button 
                           onClick={this.props.twitterSignIn}
                           className="sign-in-button">
                           Sign In
                       </button>;
        if(this.props.user) {
            userInfo = <p className="user-name">{this.props.user.screen_name}</p>
        }
        return (
            <div className="top-bar">
                <input 
                    id="yelpsearch" 
                    type="text" 
                    onChange={this.handleChange} 
                    onKeyDown={this.handleKeys} 
                    value={this.state.inputValue}
                    placeholder="City Name" />
                <div className="user-info">
                    {userInfo}
                </div>
            </div>
        )
    }
}
