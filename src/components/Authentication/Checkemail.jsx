import React from 'react';
import {ReactComponent as Mail} from '../../assets/images/mail.svg';
import {ReactComponent as ArrowLeft} from '../../assets/images/arrow-left.svg';

const Checkemail = () => {

    return (
        <form className='forgot-form'>
            <span className='iconheading'>
                <Mail/>
            </span>
            <h1 className='form-heading heading-two'>Check your email</h1>
            <p className='form-info'>
                We sent a password reset link to
                <br/>
                <b>mohanrj@designer.com</b>
            </p>
            <div className='form-helping-text'>
                <p>
                    Din’t receive the email? <a href='javascript:void(0);'>Click to resend</a>
                </p>
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

export default Checkemail;
