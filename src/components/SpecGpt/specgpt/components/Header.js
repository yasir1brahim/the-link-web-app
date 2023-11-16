import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Header = ({isLoggedIn}) => {
    const navigate = useNavigate();
    return (        
        <div className="row">
            <div className="col-2">
                <div className="spect-gpt-logo"
                    style={{cursor: "pointer"}}
                    onClick={() => {
                        if (isLoggedIn) {
                            navigate("/chat");
                        } else {
                            navigate("/");
                        }
                        
                    }}
                    >
                    <img src={"./images/The_Link_Black.png"} alt="SpecGPT Logo" height="50px" width="150px"/>
                </div>
            </div>
            
            <div className="col-3"></div>

            <div className="col-3">
                <div className="specgpt-logo-title">
                    SpecGPT
                </div>
                <div className="beta-v1-text">
                    Beta V1
                </div>
            </div>

            <div className="col-2"></div>
            <div className="col-3">
                <div className="specgpt-logo-subtitle">

                </div>
            </div>
        </div>
    )
}

export default Header;