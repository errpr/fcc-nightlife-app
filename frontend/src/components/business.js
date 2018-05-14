import React from 'react';

function Business(props) {
    return(
        <div className="business-item">
            <img className="business-item-image" src={props.biz.image_url} />
            <h3 className="business-item-name">{props.biz.name}</h3>
            <p className="business-item-price">{props.biz.price}</p>
            <p className="business-item-rating">{props.biz.rating.toString()}</p>
        </div>
    )
}

export default Business;