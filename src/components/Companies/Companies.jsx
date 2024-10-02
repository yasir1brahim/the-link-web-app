import React, { useState, useEffect } from 'react';
import { getUserTeams } from '../../api/Authentication/api';

const Companies = () => {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const response = await getUserTeams();
            setCompanies(response.data.results);
        };
        fetchCompanies();
    }, []);

    const handleCompanyClick = (company) => {
        localStorage.setItem('currentTeamId', company.id);
        localStorage.setItem('currentTeamSlug', company.slug);
        window.location.href = `/project-list/${company.id}`;
    };

    return (
        <div>
            <h1>Select a Company</h1>
            <ul>
                {companies.map((company) => (
                    <li key={company.id}><a onClick={() => handleCompanyClick(company)}>{company.name}</a></li>
                ))}
            </ul>
        </div>
    );
};

export default Companies;