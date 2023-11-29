import React from 'react';

const containerStyle = {
    paddingLeft: 0,
};
const logoStyle = {
    paddingLeft: '10px',
};
const customStyle = {
    width: '100%',
    height: '100%',
}


const Container = (props) => {
    
    return (        
        <>
        <div className="container-fluid" style={containerStyle}>
            <nav className="navbar navbar-light bg-light">
                <span className="navbar-brand mb-0 h1" style={logoStyle}>Genie</span>
            </nav>
        </div>
            <div className={props.useContainerFluid ? "container-fluid" : "container"} style={customStyle}>                
                {props.children}            
            </div>
        </>
    );
}

export default Container;