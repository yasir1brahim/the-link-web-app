import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';
import DateSelector from '../shared/DateSelector/DateSelector';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';

export default function CombinedLogs(props) {
  const logData = props.logData;
  const [editRow, setEditRow] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [dateApproved, setDateApproved] = useState('');
  const [statusValue, setStatus] = useState({});
  const [groupingValue, setGroupingValue] = useState({});
  const [searchValue, setSearchValue] = useState('');

  const [rowData, setRowData] = useState({
    comments: '',
    id: 1,
    item_desc: '',
    package: '',
    para_context: '',
    para_no: '',
    project_id: '',
    spec_section: '',
    status: '',
    type: '',
  });

  const [showMore, setModal] = useState(null);
  // const toggleShowMore = () => setModal(!showMore);
  
  const handleEditToggle = (log, index) => {
    setRowData(log);
    setEditRow(index);
    setDateIssued('');
    setDateApproved('');
  };

  const handleUpdateLog = async () => {
    try {
      setEditRow('');

      await axiosInstance({
        method: 'put',
        url: '/update_logs',
        data: {
          customer_id: props.customerId,
          comments: rowData.comments,
          id: rowData.id,
          item_desc: rowData.item_desc,
          package: groupingValue?.length
            ? groupingValue[0].label
            : searchValue
            ? searchValue
            : rowData.package,
          para_context: rowData.para_context,
          para_no: rowData.para_no,
          project_id: rowData.project_id,
          spec_section: rowData.spec_section,
          status: statusValue?.length ? statusValue[0].value : '',
          type: rowData.type,
          date_issued: !dateIssued
            ? rowData?.date_issued
              ? moment(
                  new Date((rowData?.date_issued).replaceAll('-', '/'))
                ).format('YYYY-MM-DD')
              : null
            : moment(dateIssued).format('YYYY-MM-DD'),
          date_approved: !dateApproved
            ? rowData?.date_approved
              ? moment(
                  new Date((rowData?.date_approved).replaceAll('-', '/'))
                ).format('YYYY-MM-DD')
              : null
            : moment(dateApproved).format('YYYY-MM-DD'),
        },
      });
      props.setPageRefresh(!props.pageRefresh);
    } catch (error) {
      console.log(error.message);
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

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
                    for="ticketHeading"
                  ></label>
                </div>
              </div>
            </th>
            <th className="text-center">Action</th>
            <th>
              <span>
                Spec Sec <i className=""></i>
              </span>
            </th>
            <th>
              <span>
                Para <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span>
                Requirement Type <i className="sort-i"></i>
              </span>
            </th>
            <th>
              <span> Item </span>
            </th>
            <th>
              <span>
                Grouping <i className="sort-d"></i>
              </span>
            </th>
            <th className="log-description">
              <span>
                Paragraph Context <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span>
                Status <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span>
                Date Issued <i className="sort-d"></i>
              </span>
            </th>
            <th>
              <span>
                Date Approved <i className="sort-d"></i>
              </span>
            </th>
            <th className="log-description">
              <span>Comments</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {logData.map((log, index) => {
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
                        for="ticketRow1"
                      ></label>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="action-items">
                    {editRow === index ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleUpdateLog}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditRow('');
                            setRowData({
                              comments: '',
                              date_approved: '',
                              date_issued: '',
                              id: 1,
                              item_desc: '',
                              package: '',
                              para_context: '',
                              para_no: '',
                              project_id: '',
                              spec_section: '',
                              status: '',
                              type: '',
                            });
                            setDateApproved('');
                            setDateIssued('');
                            setStatus({});
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditToggle(log, index)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className="form-control"
                      type="text"
                      value={rowData.spec_section}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, spec_section: e.target.value })
                      }
                    />
                  ) : (
                    log.spec_section
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className="form-control"
                      type="text"
                      value={rowData.para_no}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, para_no: e.target.value })
                      }
                    />
                  ) : (
                    log.para_no
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className="form-control"
                      type="text"
                      value={rowData.type}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, type: e.target.value })
                      }
                    />
                  ) : (
                    log.type
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className="form-control"
                      type="text"
                      value={rowData.item_desc}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, item_desc: e.target.value })
                      }
                    />
                  ) : (
                    log.item_desc
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <div
                      className="form-group log-datepicker"
                      style={{ minWidth: '240px' }}
                    >
                      <SelectDropdown
                        label={'Grouping'}
                        // labelKey="name"
                        setSelected={setGroupingValue}
                        // value={leadContact.label}
                        selected={groupingValue?.label}
                        options={props.groupingData}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        // onInputChange={}
                      />
                    </div>
                  ) : (
                    log.package
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className="form-control"
                      type="text"
                      value={rowData.para_context}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, para_context: e.target.value })
                      }
                    />
                  ) : (
                    <div className={"log-desc "+(showMore === index? 'show-content':'')}>
                      {log.para_context}
                      {log.para_context.length > 132 && <span className="showmore-wrap" onClick={()=>setModal(showMore === index ? null : index)}>...{showMore === index? 'Show Less':'Show More'}</span>}
                    </div>
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <div
                      className="form-group log-datepicker"
                      style={{ minWidth: '240px' }}
                    >
                      <SelectDropdown
                        label={'Status'}
                        // labelKey="name"
                        setSelected={setStatus}
                        // value={leadContact.label}
                        selected={statusValue?.label}
                        options={[
                          { value: 'not issued', label: 'Not Issued' },
                          { value: 'in progress', label: 'In Progress' },
                          { value: 'Completed', label: 'Completed' },
                        ]}
                      />
                    </div>
                  ) : (
                    log.status
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <div className="log-datepicker form-group">
                      <DateSelector
                        isClearable={false}
                        placeholderText="Date Issued"
                        labelText="Date Issued"
                        onChange={setDateIssued}
                        selected={
                          !dateIssued
                            ? log.date_issued &&
                              log.date_issued !== '00-00-0000'
                              ? new Date(log.date_issued.replaceAll('-', '/'))
                              : null
                            : dateIssued
                        }
                      />
                    </div>
                  ) : log.date_issued === '00-00-0000' ? null : (
                    log.date_issued
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <div className="log-datepicker form-group">
                      <DateSelector
                        isClearable={false}
                        placeholderText="Date Approved"
                        labelText="Date Approved"
                        onChange={setDateApproved}
                        selected={
                          !dateApproved
                            ? log.date_approved &&
                              log.date_approved !== '00-00-0000'
                              ? new Date(log.date_approved.replaceAll('-', '/'))
                              : null
                            : dateApproved
                        }
                      />
                    </div>
                  ) : log.date_approved === '00-00-0000' ? null : (
                    log.date_approved
                  )}
                </td>
                <td>
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className="form-control"
                      type="text"
                      value={rowData.comments}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, comments: e.target.value })
                      }
                    />
                  ) : (
                    log.comments
                  )}
                </td>
                
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
