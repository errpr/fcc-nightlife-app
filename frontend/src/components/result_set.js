import React from 'react';
import Business from './business';

function ResultSet(props) {
    const results = props.results.businesses.map((e, i) => { 
                        return(
                                <Business 
                                    key={i}
                                    biz={e} 
                                    goingClick={props.goingClick}
                                    userid={props.userid} />
                        ); 
                    });
    return(
        <div className="result-set">
            {results}
        </div>
    );
}

export default ResultSet;