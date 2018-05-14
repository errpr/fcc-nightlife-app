import React from 'react';

function Business(props) {
    let button =    <button 
                        className="going-button"
                        onClick={() => { props.goingClick(props.biz.id) }}>
                        I'm going!
                    </button>;
    if(props.biz.users.indexOf(props.userid) >= 0) {
        button = <button className="already-going-button">Already going.</button>;
    }
    return(
        <div className="business-item">
            <img className="business-item-image" src={props.biz.image_url} />
            <h3 className="business-item-name">{props.biz.name}</h3>
            <p className="business-item-info">
                Price: {props.biz.price}<br />
                Yelp Rating: {props.biz.rating.toString()}
            </p>
            <p className="business-item-users">
                Going: {props.biz.users.length}<br />
                {button}
            </p>
        </div>
    )
}

export default Business;