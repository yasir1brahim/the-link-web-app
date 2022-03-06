import React from 'react';
import {ReactComponent as ResetSuccess} from '../../assets/images/reset.svg';

const Resetsuccess = () => {

    return (
        <form className='resersuccess-form'>
            <span className='iconheading'>
                <ResetSuccess/>
            </span>
            <h1 className='form-heading heading-two'>Password reset</h1>
            <p className='form-info'>
                Your password has been successfully reset.
                <br/>
                Click below to login in magically.
            </p>
            <div className='form-group form-btn'>
                <button type="button" className="btn btn-primary w-100">Continue to login</button>
            </div>
        </form>
    );
}

export default Resetsuccess;
