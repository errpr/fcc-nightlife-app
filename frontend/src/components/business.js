import React from 'react';

function Business(props) {
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
                <button onClick={() => { props.goingClick(props.biz.id) }}>
                    I'm going!
                </button>
            </p>
        </div>
    )
}

export default Business;