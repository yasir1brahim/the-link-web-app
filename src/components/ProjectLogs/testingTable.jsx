import React from 'react';

export default function TestingTable(props) {
  const logData = props.logData;
  return (
    <div className="l-table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th className="ticket-checkbox">
              <div className="form-group">
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    name="ticketHeading"
                    id="ticketHeading"
                  />
                  <label
                    className="custom-control-label"
                    for="ticketHeading"
                  ></label>
                </div>
              </div>
            </th>
            <th>
              <span className="has-sorting">
                Spec Section <i className=""></i>
              </span>
            </th>
            <th>
              <span className="has-sorting">
                Sub Section <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span className="has-sorting">
                Type <i className="sort-i"></i>
              </span>
            </th>
            <th>
              <span>Description </span>
            </th>
            <th>
              <span className="has-sorting">
                Test Date <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span className="has-sorting">
                Contractor Responsible <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span className="has-sorting">
                Test Status <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span>Comments</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {logData.map((log) => {
            return (
              <tr>
                <td className="ticket-checkbox">
                  <div className="form-group">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        name="ticketRow1"
                        id="ticketRow1"
                      />
                      <label
                        className="custom-control-label"
                        for="ticketRow1"
                      ></label>
                    </div>
                  </div>
                </td>
                <td>{log.spec_section}</td>
                <td>{log.sub_section}</td>
                <td>{log.section_name}</td>
                <td>{log.description}</td>
                <td>{log.test_date}</td>
                <td>{log.contractor_responsible}</td>
                <td>{log.test_status}</td>
                <td>{log.comments}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
