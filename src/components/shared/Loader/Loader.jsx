import React from 'react';

// @ts-ignore
const Loader = ({...props}) => {

    return (
        <div className={"loader-wrapper "+(props.showComponentLoader? 'wrapper-component':'')}>
            <div className="linear-activity">
                <div className="indeterminate"></div>
            </div>
            {/* {props.showComponentLoader && 
            <div className="component-loader">
                <div className="linear-activity">
                    <div className="indeterminate"></div>
                </div>
            </div>
            } */}
        </div>
    )
}

export default Loader;