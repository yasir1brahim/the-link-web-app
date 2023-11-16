import React from 'react';
import ResultItem from './ResultItem';

const ResultList = ({ results }) => {

    return (
        <div className="row">
            {results.map((result, index) => (
                <ResultItem result={result} key={index} />
            ))}
        </div>
    );
}

export default ResultList;