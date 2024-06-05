import React from 'react';

export default function CloseOutTable(props) {
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
                    onChange={props.handleSelectAll}
                    checked={props.selected.length === logData.length}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="ticketHeading"
                  ></label>
                </div>
              </div>
            </th>
            <th>
              <span className="has-sorting">
                Spec Sec <i className=""></i>
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
                Status <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span className="has-sorting">
                Contractor Responsible <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span className="has-sorting">
                File Location <i className="sort-d"></i>
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
                        checked={props.selected.includes(log.id)}
                        onChange={() => props.handleSelect(log.id)}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="ticketRow1"
                      ></label>
                    </div>
                  </div>
                </td>
                <td>{log.spec_section}</td>
                <td>{log.sub_section}</td>
                <td>{log.section_name}</td>
                <td>{log.description}</td>
                <td>{log.status}</td>
                <td>{log.contractor_responsible}</td>
                <td>{log.file_location}</td>
                <td>{log.comments}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
