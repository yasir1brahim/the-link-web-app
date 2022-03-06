import React from 'react';
import {ReactComponent as ReactLogo} from '../../assets/images/logo.svg';
import Signin from './Signin';
import Signup from './Signup';
import Forgotpwd from './Forgotpwd';
import Checkemail from './Checkemail';
import Resetpwd from './Resetpwd';
import Resetsuccess from './Resetsuccess';

const Authentication = () => {
    return (
        <section className='authentication-content-wrapper'>
            <div className='ac-left'>
                <a href='#' className='company-branding'>
                    <ReactLogo /> 
                </a>
            </div>
            <div className='ac-right'>
                <Signin />
                {/* <Signup /> */}
                {/* <Forgotpwd /> */}
                {/* <Checkemail /> */}
                {/* <Resetpwd /> */}
                {/* <Resetsuccess /> */}
            </div>
        </section>
    );
}

export default Authentication;
