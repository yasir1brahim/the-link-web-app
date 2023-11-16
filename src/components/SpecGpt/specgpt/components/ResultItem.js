import React from 'react';
import { DOC_TYPES } from '../utils/enums';


const itemLogoStyle = {
    width: '40px',
    height: '40px',
}
const rowStyle = {
    boxShadow: '0 2px 5px 1px rgb(64 60 67 / 16%)',
    marginBottom: '1px solid #ebebeb',
    marginBottom: '10px',
    paddingTop: '20px',
}

const titleStyle = {
    marginBottom: '40px',
}
const ResultItem = ({ result }) => {
    const iconPath = 'images/'+result.company_ticker+'.png';
    const filing_url = '/filing?url=' + result.url;
    const showScores = false;    
    
    return (
        <div className="row" style={rowStyle}>
            <div className="col-md-1">
                {iconPath && <img src={iconPath} alt="favicon" style={itemLogoStyle} />}
            </div>
            <div className="col-md-11 result-item">                
                <a href={filing_url} target="_blank" className="result-title" style={titleStyle}>{result.company_name} | {result.filing_type} | {result.filing_quarter} {result.filing_year}</a>
                <p className="result-snippet" 
                dangerouslySetInnerHTML={{__html: result.snippet}}></p>
                {showScores && <>
                <p className="result-metadata">Chunk ID: <b>{result.id}</b></p>
                <p className="result-metadata">Best sentence score: {result.best_sentence_score}</p>
                <p className="result-metadata">Paragraph score: {result.paragraph_score}</p>     
                </>}
            </div>            
        </div>
    );
}

export default ResultItem;