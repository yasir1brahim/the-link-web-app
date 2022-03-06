import React, {useState} from 'react';
import {ReactComponent as User} from '../../assets/images/user.svg';
import {ReactComponent as Eyeshow} from '../../assets/images/eye-show.svg';
import {ReactComponent as Eyehide} from '../../assets/images/eye-hide.svg';

const Signin = () => {

    const [showPwd, setShowPwd] = useState(false);
    
    const toggleType = () => setShowPwd(!showPwd);

    return (
        <form className='login-form'>
            <h1 className='form-heading'>Hello!</h1>
            <p className='form-info'>
                Welcome to The Link Log Manager. Please sign in if you have 
                credentials. If not, please see your administrator.
            </p>
            <div className='form-group'>
                <label className="text-label" for="userName">Username</label>
                <input type="text" className="form-control" id="userName" aria-describedby="userName" placeholder="User Name" required />
                <i className='iconinput inputuser'><User/></i>
                <small className='form-error'>Please enter a Valid Username</small>
            </div>
            <div className='form-group'>
                <label className="text-label" for="passsword">Passsword</label>
                <input type={showPwd ? 'text':'password'} className="form-control" id="passsword" aria-describedby="passsword" placeholder="Password" required />
                <a className='iconinput inputpwd' href='javascript:void(0)' onClick={toggleType}>{showPwd ? <Eyeshow/>:<Eyehide/>}</a>
                {/* <small className='form-error'>Please enter a correct Password</small> */}
            </div>
            <div className='form-group forgot-pwd'>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                    <label className="custom-control-label" for="ticketRow1">Remember Me</label>
                </div>
                <a className="forgot-pwd" href="javascript:void(0);">Forgot Password?</a>
            </div>
            <div className='form-group form-btn'>
                <button type="button" className="btn btn-primary w-100">Login</button>
            </div>
            <div className='form-helping-text'>
                <p>
                    Don’t have credentials?
                    <br/> 
                    Ask your administrator, or email <a href='mailto:support@thelink.ai'>support@thelink.ai</a>
                </p>
            </div>
        </form>
    );
}

export default Signin;
