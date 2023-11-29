import React from 'react';
import DocumentItem from './DocumentItem';

const GroupedResultList = ({ results }) => {

    return (
        <div className="row">
            {results.map((result, index) => (
                <DocumentItem result={result} key={index} />
            ))}
        </div>
    );
}

export default GroupedResultList;