import React from 'react';
import Business from './business';

function ResultSet(props) {
    const results = props.results.businesses.map((e, i) => { 
                        return(
                            <li key={i} className="result-item">
                                <Business biz={e} />
                            </li>
                        ); 
                    });
    return(
        <ul className="result-set">
            {results}
        </ul>
    );
}

export default ResultSet;