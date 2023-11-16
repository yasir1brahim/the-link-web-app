import React from 'react';
import DOC_TYPES from '../utils/enums';

const rowStyle = {
    boxShadow: '0 2px 5px 1px rgb(64 60 67 / 16%)',
    marginBottom: '1px solid #ebebeb',
    marginBottom: '10px',
    paddingTop: '20px',
}

const PlainResultItem = ({ result }) => {
    const showScores = false;
    return (
        <div className="row" style={rowStyle}>
            <div className="col-md-12 result-item">
                <p className="result-snippet" 
                    dangerouslySetInnerHTML={{__html: result.snippet}}>                    
                </p>
                {showScores && <>
                    <p className="result-metadata">Chunk ID: <b>{result.id}</b></p>
                    <p className="result-metadata">Best sentence score: {result.best_sentence_score}</p>
                    <p className="result-metadata">Paragraph score: {result.paragraph_score}</p>     
                </>}                
            </div>
        </div>
    );
}

export default PlainResultItem;