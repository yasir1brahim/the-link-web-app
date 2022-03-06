import React, {useState} from 'react';
import {ReactComponent as Mail} from '../../assets/images/mail.svg';
import {ReactComponent as Eyeshow} from '../../assets/images/eye-show.svg';
import {ReactComponent as Eyehide} from '../../assets/images/eye-hide.svg';

const Signin = () => {

    const [showPwd, setShowPwd] = useState(false);
    
    const toggleType = () => setShowPwd(!showPwd);

    return (
        <form className='signup-form'>
            <h1 className='form-heading'>Sign Up</h1>
            <p className='form-info'>
                Welcome to The Link Log Manager. Please sign in if you have 
                credentials. If not, please see your administrator.
            </p>
            <div className='form-group'>
                <label className="text-label" for="userName">Email</label>
                <input type="text" className="form-control" id="userName" aria-describedby="userName" placeholder="User Name" required />
                <i className='iconinput inputuser'><Mail/></i>
                {/* <small className='form-error'>Please enter a Valid Username</small> */}
            </div>
            <div className='form-group'>
                <label className="text-label" for="passsword">Passsword</label>
                <input type={showPwd ? 'text':'password'} className="form-control" id="passsword" aria-describedby="passsword" placeholder="Password" required />
                <a className='iconinput inputpwd' href='javascript:void(0)' onClick={toggleType}>{showPwd ? <Eyeshow/>:<Eyehide/>}</a>
                {/* <small className='form-error'>Please enter a correct Password</small> */}
            </div>
            <div className='form-group form-btn'>
                <button type="button" className="btn btn-primary w-100">Sign Up</button>
            </div>
            <div className='form-helping-text'>
                <p>
                    Already have an account? <a href='javascript:void(0);'>Login</a>
                </p>
            </div>
        </form>
    );
}

export default Signin;
