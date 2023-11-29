import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import stylex from '@ladifire-opensource/stylex'
import SearchFilters from './SearchFilters';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

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


const SearchBox = ({callback_url}) => {
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

    return (
        <div className="container-fluid searchbox-border">
            <div className="row">
                <div className="col-md-1">
                    <h5 className="genie-logo text-primary" style={gotoHomepageStyle} onClick={() => gotoHomepage()}>                        
                        Search+                       
                    </h5>
                </div>
                <div className="col-md-5">
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <div className="input-group mb-3 ">
                            <input type="text" value={query} onChange={e => setQuery(e.target.value)} className={"form-control searchbox "} placeholder="Search for..." aria-label="Search for..." aria-describedby="button-addon2" />
                        </div>
                    </form>
                </div>
                <div className="col-md-2"></div>
            </div>
            {location.pathname === '/search' && query !== '' ? null /** <SearchFilters /> **/ : null}
        </div>
    );
}

export default SearchBox;
