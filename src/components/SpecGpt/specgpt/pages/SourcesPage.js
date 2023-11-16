import React, { useState, useEffect } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/esm/Button';
import { BASE_URL } from "../utils/config";



const SourcesPage = () => {
    const [sources, setSources] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [k, setK] = useState(10);

    const handleSubmit = (e) => {
        e.preventDefault();
        const fetchSources = async () => {
            const url = `${BASE_URL}/api/sources`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({prompt, k})
            });
            const data = await response.json();
            console.log(data.sources);
            setSources([...data.sources]); 
            if (data.success) {
                console.log('success');
               
            } else {
                console.log('failure');
            }
        }

        fetchSources();
    }

    return (
        <>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1>Sources</h1>

            <div style={{width: '50%'}}>
                Question: <input type="text" className="form-control input-lg" placeholder="Enter a prompt" value={prompt} onChange={e => setPrompt(e.target.value)} />
                K: <input type="text" className="form-control input-lg" placeholder="Enter a k value" value={k} onChange={e => setK(e.target.value)} />                
                    <Button variant="primary" type="submit" style={{marginTop: '3%', marginBottom: '5%'}} onClick={handleSubmit}>Submit</Button>
            </div>           
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                {sources.map((source, index) => {
                    return (
                        <div key={index}>
                        <p>{source.page} ----- {source.source}</p>                        
                        </div>
                    )
                })}
            </div>
        </div>
        </>
    )
}

export default SourcesPage;