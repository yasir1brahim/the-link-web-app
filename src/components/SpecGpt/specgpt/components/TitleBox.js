import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import stylex from '@ladifire-opensource/stylex'
import SearchFilters from './SearchFilters';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Form from 'react-bootstrap/Form';

const styles = {
        
    searchBox: {
        width: '20%',
        height: '100%',
        borderColor: 'red',
    },
};

const logoStyle = {
    width: '30px',
    height: '30px',
}

const gotoHomepageStyle = {
    cursor: 'pointer',
}


const TitleBox = ({callback_url, title, ticker}) => {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState('');
    const [parentSearchUrl, setParentSearchUrl] = React.useState('search');

    useEffect(() => {
        console.log('useEffect:');
        if (callback_url !== undefined) {
            setParentSearchUrl(callback_url);
        }
    }, [callback_url]);

    const q = useParams();
    useEffect(() => {
        console.log('useEffect:');
        const queryParameters = new URLSearchParams(window.location.search);
        const q = queryParameters.get('q');
        console.log('q: ', q);
        setQuery(q);
    }, [q]);    

    const handleSubmit = (event) => {
        event.preventDefault();
        const encodedQuery = encodeURIComponent(query);
        navigate(`/${parentSearchUrl}?q=${encodedQuery}`);
    }

    const gotoHomepage = () => {
        navigate(`/`);
    }   

    const location = useLocation();
    console.log('location: ', location);
    const options = [
        {value: 'T - AT&T Inc.', label: 'T'},
        {value: 'ZIM - ZIM Integrated Shipping Services Ltd.', label: 'ZIM'},
    ];

    const updateTicker = (newTicker) => {
        console.log('updateTicker: ', newTicker);
        callback_url(newTicker)
    }

    return (
        <div className="container-fluid searchbox-border">
            <div className="row">
                <div className="col-md-1">
                    <h5 className="genie-logo text-primary" style={gotoHomepageStyle} onClick={() => gotoHomepage()}>                        
                        Search+{title}                    
                    </h5>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-1 mt-2">Choose Company:</div>
                <div className="col-md-3 mb-3">
                <Form.Group controlId="formBasicSelect">
                    {/***<Form.Label>Choose Company</Form.Label>***/}
                    <Form.Select
                    value={ticker}
                    onChange={(e) => updateTicker(e.currentTarget.value)}
                    >
                    <option value="T">T - AT&T Inc.</option>                    
                    <option value="ZIM">ZIM - ZIM Integrated Shipping Services Ltd.</option>
                    </Form.Select>
                </Form.Group>
                </div>
                <div className="col-md-2"></div>
            </div>
        </div>
    );
}



export default TitleBox;