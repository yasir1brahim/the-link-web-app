import React, { useState } from 'react';
import { BASE_URL } from '../utils/config';

function GoLinkCreateForm() {
    const [name, setName] = useState('name');
    const [url, setUrl] = useState('');
    const [successfullyCreated, setSuccessfullyCreated] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      // Make API call to create go link
      const response = await fetch(`${BASE_URL}/api/go-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessfullyCreated(true)
        setErrorMessage('');
      } else {
        setErrorMessage(`go/${name} was not created because ${data.message}`);
        setSuccessfullyCreated(false);
      }
    };
  
    // TODO: Add link to go link list page.
    // TODO: Change the go link field to be pre-populated with go/ but don't allow the user to remove the go/ prefix.
    return (
        <div>
            <h3>Create Go Link</h3>
            <form onSubmit={handleSubmit}>
            <table>
                <tbody>
                <tr>
                    <td>
                    <label htmlFor="name-input" className="create-go-link-label-text">go/</label>
                    </td>
                    <td>
                    <input type="text" id="name-input" name="name" onChange={(event) => setName(event.target.value)} />
                    </td>
                </tr>
                <tr>
                    <td>
                    <label htmlFor="url-input" className="create-go-link-label-text">
                        URL:
                    </label>
                    </td>
                    <td>
                    <input type="text" id="url-input" name="url" onChange={(event) => setUrl(event.target.value)} />
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                    <button type="submit" className="btn btn-outline-primary btn-sm" disabled={!name || !url}>
                        Create Go Link
                    </button>
                    </td>
                </tr>
                </tbody>
            </table>
            </form>
            {successfullyCreated && (
            <div className="alert alert-success" role="alert">
                <a href={`https://go/${name}`}>(go/{name})</a> was successfully created.
            </div>
            )}      
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
      </div>    
      );
    }
    
    export default GoLinkCreateForm;
    