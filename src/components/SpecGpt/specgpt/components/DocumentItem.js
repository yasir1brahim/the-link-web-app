import React from 'react';
import PlainResultItem from './PlainResultItem';


const itemLogoStyle = {
    width: '40px',
    height: '40px',
}

const showAllStyle = {
    cursor: 'pointer',

}

const showAllTextStyle = {
    fontWeight: 'bold',
}

const ShowAllComponent = ({ text, callback}) => {
    return (
        <div className="card result-item bg-info" style={showAllStyle} onClick={() => callback()}>
            <div className="text-center mt-1 mb-1 text-white" style={showAllTextStyle}> {text} <i className="glyphicon glyphicon-chevron-down"></i></div>
        </div> 
    );
}

const DocumentItem = ({ result }) => {
    const iconPath = 'images/'+result.document.company_ticker+'.png';
    const [showAll, setShowAll] = React.useState(false);
    const [previewSize, setPreviewSize] = React.useState(2);
    const previewedItems = result.items.slice(0, previewSize);
    return (
        <div className="col-md-12">
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">
                        {iconPath && <img src={iconPath} alt="favicon" style={itemLogoStyle} />}
                        <a href={result.document.url} target="_blank" className="result-title">{result.document.company_name} - {result.document.filing_type} - {result.document.filing_date}</a>
                    </h5>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-1"></div>
                            <div className="col-md-10"> 
                                {showAll && result.items.map((item, index) => (
                                    <PlainResultItem 
                                        result={item}
                                        key={index} 
                                        showAll={showAll}
                                        />
                                ))}                           
                                {!showAll && previewedItems.map((item, index) => (                                    
                                    <PlainResultItem 
                                        result={item} 
                                        key={index} 
                                        showAll={showAll}
                                        />
                                ))}
                                {result.items.length > previewSize && !showAll && 
                                    (        
                                        <ShowAllComponent                                   
                                            text={'Show All (' + result.items.length + ')'}
                                            callback={() => setShowAll(true)}
                                        />      
                                    )
                                }
                                {result.items.length > previewSize && showAll && 
                                    (
                                        <ShowAllComponent
                                            text={'Show Less'}
                                            callback={() => setShowAll(false)}
                                        />
                                    )}
                            </div>
                        </div>                        
                    </div>
                </div>
            </div>
        </div>
    );    
}

export default DocumentItem;