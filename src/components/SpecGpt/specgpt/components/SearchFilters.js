import React from "react";

import DropDown from "react-bootstrap/Dropdown";
import DropDownButton from "react-bootstrap/DropdownButton";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";



const SearchFilters = () => {

    const location = useLocation();
    console.log(location);
    const [anytimeFilter, setAnytimeFilter] = React.useState('Anytime');
    const [ownerFilter, setOwnerFilter] = React.useState('Owner');
    const [typeFilter, setTypeFilter] = React.useState('Type');    

    const q = useParams();
    useEffect(() => {
        const queryParameters = new URLSearchParams(window.location.search);

        const t = queryParameters.get('t');
        if (t === 'p24') {
            setAnytimeFilter('Past 24 hours');
        }
        else if (t === 'pw') {
            setAnytimeFilter('Past week');
        }
        else if (t === 'pm') {
            setAnytimeFilter('Past month');
        }
        else if (t === 'py') {
            setAnytimeFilter('Past year');
        }
        else {
            setAnytimeFilter('Anytime');
        }

        const ow = queryParameters.get('ow');
        if (ow === 'me') {
            setOwnerFilter('is Me');
        }
        else if (ow === 'notme') {
            setOwnerFilter('is not Me');
        }
        else if (ow === 'is') {
            setOwnerFilter('Is');
        }
        else if (ow === 'isnot') {
            setOwnerFilter('Is Not');
        }
        else {
            setOwnerFilter('Owner');
        }
        
        const doc = queryParameters.get('doc');
        if (doc === 'gdoc') {
            setTypeFilter('Google Doc');
        }
        else if (doc === 'gslide') {
            setTypeFilter('Google Slides');
        }
        else if (doc === 'gsheet') {
            setTypeFilter('Google Sheet');
        }
        else if (doc === 'jira') {
            setTypeFilter('Jira');
        } else if (doc === 'confluence') {
            setTypeFilter('Confluence');
        } else {
            setTypeFilter('Type');
        }
    }, [q]);        

    const navigateTo = (key, value) => {
        const queryParameters = new URLSearchParams(window.location.search);
        queryParameters.set(key, value);
        window.location.search = queryParameters.toString();
    }

    const clearFilters = () => {
        const queryParameters = new URLSearchParams(window.location.search);
        queryParameters.delete('t');
        queryParameters.delete('ow');
        queryParameters.delete('doc');
        window.location.search = queryParameters.toString();
    }



    return (        
        <div className="row">
            <div className="col-md-1"></div>
            <div className="col-md-5">
                <div className="row">
                    <div className="col-md-3">
                        <DropDownButton title={anytimeFilter} id="anytime-dropdown" variant="default">                            
                            <DropDown.Item active={anytimeFilter === 'Past 24 hours' ? true : false} onClick={() => {navigateTo('t', 'p24')}}>Past 24 hours</DropDown.Item>
                            <DropDown.Item active={anytimeFilter === 'Past week' ? true : false} onClick={() => {navigateTo('t', 'pw')}}>Past week</DropDown.Item>
                            <DropDown.Item active={anytimeFilter === 'Past month' ? true : false} onClick={() => {navigateTo('t', 'pm')}}>Past month</DropDown.Item>
                            <DropDown.Item active={anytimeFilter === 'Past year' ? true : false} onClick={() => {navigateTo('t', 'py')}}>Past year</DropDown.Item>                            
                        </DropDownButton>
                    </div>
                    <div className="col-md-3">   
                        <DropDownButton title={ownerFilter} id="owner-dropdown" variant="default">
                            <DropDown.Item active={ownerFilter === 'is Me' ? true : false} onClick={() => {navigateTo('ow', 'me')}}>is Me</DropDown.Item>
                            <DropDown.Item active={ownerFilter === 'is not Me' ? true : false} onClick={() => {navigateTo('ow', 'notme')}}>is not Me</DropDown.Item>
                            <DropDown.Item active={ownerFilter === 'is' ? true : false} onClick={() => {navigateTo('ow', 'is')}}>Is</DropDown.Item>
                            <DropDown.Item active={ownerFilter === 'is not' ? true : false} onClick={() => {navigateTo('ow', 'isnot')}}>Is not</DropDown.Item>
                        </DropDownButton>                                                        
                    </div>              
                    <div className="col-md-3">  
                        <DropDownButton title={typeFilter} id="type-dropdown" variant="default">
                            <DropDown.Item active={typeFilter === 'Google Doc' ? true : false} onClick={() => {navigateTo('doc', 'gdoc')}}>Google Doc</DropDown.Item>
                            <DropDown.Item active={typeFilter === 'Google Slides' ? true : false} onClick={() => {navigateTo('doc', 'gslide')}}>Google Slides</DropDown.Item>                            
                            <DropDown.Item active={typeFilter === 'Jira' ? true : false} onClick={() => {navigateTo('doc', 'jira')}}>Jira</DropDown.Item>
                            <DropDown.Item active={typeFilter === 'Confluence' ? true : false} onClick={() => {navigateTo('doc', 'confluence')}}>Confluence</DropDown.Item>                            
                        </DropDownButton>
                    </div>
                    <div className="col-md-3">
                        { anytimeFilter !== 'Anytime' || ownerFilter !== 'Owner' || typeFilter !== 'Type' ?
                        <button className="btn btn-default" onClick={() => {clearFilters()}}>Clear</button> : null}
                    </div>
                </div>
            </div>
            <div className="col-md-2"></div>
        </div>        
    );
}

export default SearchFilters;
