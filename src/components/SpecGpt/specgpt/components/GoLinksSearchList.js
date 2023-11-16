import React, { useState, useEffect } from "react";
import { BASE_URL } from "../utils/config";

function GoLinksSearchList() {
    const [goLinks, setGoLinks] = useState([]);
    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
  
    // TODO: Pass in the owner's ID
    useEffect(() => {
      // Make API call to get the user's go links
      fetch(`${BASE_URL}/api/go-links`)
        .then((response) => response.json())
        .then((data) => setGoLinks(data["go_links"]));
    }, []);

  
    const handleSort = (columnName) => {
      console.log(goLinks);
      if (sortColumn === columnName) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(columnName);
        setSortDirection("asc");
      }
    };
  
    const sortedGoLinks = [...goLinks].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      return a.name.localeCompare(b.name) * direction;
    });
    
    // TODO: Fix or remove the sorting arrow positioning.
    return (
      <div>
        <h3>My Links</h3>
        <table className="go-links-table">
          <thead>
            <tr>
              <th className="go-links-sortable-header" onClick={() => handleSort("name")}>
                Name{" "}
                {sortColumn === "name" && (
                  <span className="go-links-sort-arrow">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {sortedGoLinks.map((goLink) => (
              <tr key={goLink.name}>
                <td>go/{goLink.name}</td>
                <td>{goLink.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  export default GoLinksSearchList;