import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/esm/Button';
import { BASE_URL } from '../utils/config';
import { CSS_VARS } from '../utils/enums';

const HomePage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showError, setShowError] = React.useState(false);

    const login = () => {
        const fetchLogin = async () => {
            const url = `${BASE_URL}/api/login`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, password})
            });
            const data = await response.json();
            console.log(data);
            if (data.success) {
                console.log('success');
                navigate('/chat');                
            } else {
                setShowError(true);
            }
        }

        fetchLogin();
    }   

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('handleSubmit');
        setShowError(false);
        if (!email || !password) {
            setShowError(true);
            return;
        }
        login();
    }



    /*****
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10%'}}>
            {showError && <p style={{order: '0', color: 'red'}}>Please Enter a correct email and password</p>}
            <Form>
                <Form.Group as={Row} style={{order: '1'}} controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group as={Row} controlId="formBasicPassword" style={{order: '2', marginTop: '5%'}}>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <Form.Group style={{order: '3', marginTop: '3%'}}>
                    <Button variant="primary" type="submit" onClick={(e) => handleSubmit(e)} style={{marginLeft: '35%', marginTop: '10%'}}>
                        Login
                    </Button>
                </Form.Group>
            </Form>
        </div>    
    ) ****/

}

export default HomePage;
