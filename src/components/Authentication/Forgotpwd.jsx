import React, {useState} from 'react';
import {ReactComponent as User} from '../../assets/images/user.svg';
import {ReactComponent as Keys} from '../../assets/images/keys.svg';
import {ReactComponent as ArrowLeft} from '../../assets/images/arrow-left.svg';

const Forgotpwd = () => {

    return (
        <form className='forgot-form'>
            <span className='iconheading'>
                <Keys/>
            </span>
            <h1 className='form-heading heading-two'>Forgot Password?</h1>
            <p className='form-info'>
                No worries, we’ll send you reset instructions.
            </p>
            <div className='form-group'>
                <label className="text-label" for="loginEmail">Email</label>
                <input type="text" className="form-control" id="loginEmail" aria-describedby="loginEmail" placeholder="Enter your email or username" required />
                <i className='iconinput inputuser'><User/></i>
                {/* <small className='form-error'>Please enter a Valid Email Address</small> */}
            </div>
            <div className='form-group form-btn'>
                <button type="button" className="btn btn-primary w-100">Reset password</button>
            </div>
            <div className='form-helping-text'>
                <a className='d-flex align-items-center justify-content-center' href='javascrip:void(0);'>
                    <ArrowLeft/>
                    Back to log in
                </a>
            </div>
        </form>
    );
}

export default Forgotpwd;
