import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import YoutubeEmbed from '../components/YoutubeEmbed';
import { BASE_URL } from '../utils/config';
import { CSS_VARS } from '../utils/enums';
import Header from '../components/Header';

const LoginPage = ({setToken}) => {
    const navigate = useNavigate();

    const [page, setPage] = useState(1); // 1 = email, 2 = password, 3 = login
    const [email, setEmail] = useState('');
    const [loginCode, setLoginCode] = useState('');
    const [loginError, setLoginError] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [askInfo, setAskInfo] = useState(false);

    const validateEmail = (email) => {
        // A common pattern for validating an email address
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // Test the pattern against the email argument
        return pattern.test(email);
    }

    const nextPage = async () => {
        const url = `${BASE_URL}/api/auth/send-code`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'email': email,
                }),
            })
            const data = await response.json();
            if (data.success) {
                setLoginCode('');
                setPage(2);
                setAskInfo(data.ask_info);
            }
        } catch (error) {
            console.log(error);
            setLoginError('There was an error logging in. Please try again.')
        }
    }

    const login = async () => {
        const url = `${BASE_URL}/api/auth/login`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'email': email,
                    'code': loginCode,
                    'ask_info': askInfo,
                    'company': company,
                    'role': role,
                }),
            })
            const data = await response.json();
            if (data.success) {
                setToken(data.access_token);
                if (data.doc_count == 0) {
                    navigate('/getting-started');
                } else {
                    navigate('/chat');
                }
                
            }
            if (!data.success) {
                setLoginError(data.message);
            }

        } catch (error) {
                console.log(error);
                setLoginError('There was an error logging in. Please try again.');
        }
    }


    const continueWithEmailSubmit = () => {
        setLoginError('');
        if (!email) {
            setLoginError('Please enter your email');
            return;
        }
        if (!validateEmail(email)) {
            setLoginError('Invalid email');
            return;
        }
        nextPage();
    }

    const continueWithLoginCodeSubmit = () => {
        setLoginError('');
        if (!validateEmail(email)) {
            setLoginError('Invalid email');
            return;
        } else if (askInfo && (!company || !role)) {
            setLoginError('Please enter your company and role');
            return;
        }else if (loginCode.length < 6) {
            setLoginError('Invalid login code');
            return;
        }
        login();
    }


    return (        
        <div className="container">
            <div className="row">
                <div className="col-12 mt-3 mb-5">
                    <Header 
                        isLoggedIn={false}
                    />
                </div>
                
                <div className="col-12 mt-5"></div>

                <div className="col-5">
                    <div className="example-question-title mb-3">How it Works!</div>
                    <YoutubeEmbed embedId={'xfIAZdBvzss'} />
                </div>
                
                <div className="col-1"></div>

                <div className="col-5 pt-4">
                    <form onSubmit={e => { e.preventDefault(); }}>
                    {loginError && (
                        <div style={{order: '4'}}>
                            <p style={{color: 'red'}}>{loginError}</p>
                        </div>
                    )}
                    <div className="mb-3" style={{fontSize: '15px'}}>Enter your email, we'll send you a code to access securely without creating a profile with us.</div>
                    <input type="text" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)}/>

                    <div className="mt-3 text-muted font-1" style={{fontSize: '12px'}}>
                        by signing in you will agree to our <a className="color-dark-blue" href="" target="_blank">EULA</a>.
                    </div>
                    {page === 1 && (
                        <div className="mt-4">
                            <button 
                                onClick={() => continueWithEmailSubmit()}
                                className="btn"
                                onKeyDown={(e) => {
                                    const keyCode = e.keyCode;
                                    if (keyCode === 13) {
                                        e.preventDefault();
                                        continueWithEmailSubmit();
                                    }
                                }} 
                                style={{backgroundColor: CSS_VARS.DARK_BLUE, color: CSS_VARS.WHITE}}
                            >Continue</button>
                        </div>
                    )}
                    {page === 2 && (
                        <>
                            <div>  
                                <div className="mt-3" style={{fontSize: '15px'}}>
                                    We just sent you a temporary login code.{' '}
                                    Please check your inbox. Can't find it?{' '}
                                        <a style={{textDecoration: 'underline', cursor: 'pointer'}} 
                                            onClick={() => {
                                            setLoginError('');
                                            setLoginCode('');
                                            setPage(1);
                                            }}>
                                            Try again
                                        </a>
                                </div>
                                <div className="mt-1" style={{fontSize: '15px'}}>
                                    Please enter the code in the box below and click “continue” to access SpecGPT
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>Login Code</div>
                                <div>
                                    <input type="text" className="form-control" value={loginCode} onChange={(e) => setLoginCode(e.target.value)}/>
                                </div>
                            </div>
                            
                            {askInfo && (<div className="mt-3">
                                <div>Company</div>
                                <div>
                                    <input type="text" className="form-control" value={company} onChange={(e) => setCompany(e.target.value)}/>
                                </div>
                            </div>)}

                            {askInfo && (
                            <div className="mt-3">
                                <div>Role</div>
                                <div>
                                    <input type="text" className="form-control" value={role} onChange={(e) => setRole(e.target.value)}/>
                                </div>
                            </div>)}
                            

                            <div className="mt-3">
                                <button 
                                    onClick={() => continueWithLoginCodeSubmit()} 
                                    className="btn"
                                    onKeyDown={(e) => {
                                        const keyCode = e.keyCode;
                                        if (keyCode === 13) {
                                            e.preventDefault();
                                            continueWithLoginCodeSubmit();
                                        }
                                    }} 
                                    style={{backgroundColor: CSS_VARS.DARK_BLUE, color: CSS_VARS.WHITE}}>
                                    Continue with login code
                                </button>
                            </div>
                        </>                    
                    )}
                    </form>
                </div>
                <div className={ askInfo && page === 2 ? " col-12 mt-5 text-center fixed-bottom position-relative" : "col-12 mt-5 text-center fixed-bottom"}>   
                    <div style={{color: CSS_VARS.TEXT_GRAY, width: '70%', marginLeft: '12%', marginBottom: '4%'}}>
                        SpecGPT is a new way to access project information, starting with specifications. 
                        This beta test is designed to allow for limited, secure use by general and trade contractors.
                        We have included the ability to upload your own project, then delete the files after your testing is done. 
                        For a quick how to, check out the videos on this screen.&nbsp;<span className="font-italic color-dark-blue">Please note this beta has a file upload limit of 300 files.</span>                        
                    </div>
                </div>
            </div>
        </div>
        
    );
}

export default LoginPage;