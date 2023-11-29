import React from 'react'


const ContainerFluid = (props) => {
    return (
        <div className="container-fluid">
            {props.children}
        </div>
    );
}

export default ContainerFluid;