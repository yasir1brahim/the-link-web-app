import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';
import DateSelector from '../shared/DateSelector/DateSelector';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { FilterTable } from './filterTable';
import { Link } from 'react-router-dom';

export default function CombinedLogs(props) {
  const logData = props.logData;
  const [editRow, setEditRow] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [dateApproved, setDateApproved] = useState('');
  const [statusValue, setStatus] = useState({});
  const [groupingValue, setGroupingValue] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState({ column: '', order: 'desc' });
  const [filterModal, setFilterModal] = useState(false)
  const [selectedFilterValue, setSelectedFilterValue] = useState({})
  const [filterColumn, setFilterColumn] = useState('')
  const [filterValues, setFilterValues] = useState({ spec_section: [], type: [], item_desc: [] })
  // const navigate = useNavigate();

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

  const handleSorting = async (columnName) => {
    let sortingOrder = sorting.column === columnName ? sorting.order : 'desc'
    let a = {}
    if (Object.values(filterValues).map(value => value.length ? true : false).includes(true)) {
      Object.keys(filterValues).forEach(key => filterValues[key].length ? a = { ...a, [key]: filterValues[key] } : null)
    }
    try {
      // const response = await axiosInstance({
      //   method: 'get',
      //   url: props.selectedLogData.length ?
      //     `/sort_saved_logs/${props.listId}/${columnName}/${sortingOrder === 'desc' ? 'asc' : 'desc'}` :
      //     `/sort_logs/${props.projectId}/${columnName}/${sortingOrder === 'desc' ? 'asc' : 'desc'}`,

      // });
      const response = await axiosInstance({
        method: 'post',
        url: '/filter_logs',
        data: {
          project_id: props.projectId,
          search: "",
          // filters: Object.values(filterValues).map(value => value.length ? true : false).includes(true) ? a : {},
          filters: a,
          order_col: columnName || "",
          order: sortingOrder === 'desc' ? 'asc' : 'desc' || "",
          list_id: props.selectedLogData.length ? props.listId : ''
        }
      });

      props.selectedLogData.length ?
        props.setSelectedLogData(response.data.message) :
        props.setLogData(response.data.message);

      setSorting({ ...sorting, column: columnName, order: sortingOrder === 'desc' ? 'asc' : 'desc' })
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
  }
  const handleOpenFilterModal = async () => {
    setFilterModal(true)
    try {
      let a = {}
      if (Object.values(filterValues).map(value => value.length ? true : false).includes(true)) {
        Object.keys(filterValues).forEach(key => filterValues[key].length ? a = { ...a, [key]: filterValues[key] } : null)
      }
      const response = await axiosInstance({
        method: 'post',
        url: '/filter_logs',
        data: {
          project_id: props.projectId,
          search: "",
          filters: Object.values(filterValues).map(value => value.length ? true : false).includes(true) ? a : {},
          // filters: a,
          order_col: sorting.column || "",
          order: sorting.order || "",
          list_id: props.selectedLogData.length ? props.listId : ''
        }
      });
      setSelectedFilterValue(response.data.sel_filter_vals)
      props.selectedLogData.length ?
        props.setSelectedLogData(response.data.message) :
        props.setLogData(response.data.message);
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
  }

  // const handleViewPdf = (pdfUrl, textLocation) => {
  //   navigate('/pdf-view', {
  //     state: {
  //       url: pdfUrl,
  //       textLoc: textLocation
  //     },
  //     replace: true
  //   });
  // };

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
              <span className="has-sorting" >
                Spec Sec <i className={sorting.column === 'spec_section' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('spec_section')}></i>
                <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('spec_section') }} />
              </span>
            </th>
            <th>
              <span >
                Para
              </span>
            </th>
            <th>
              <span className="has-sorting" >
                Requirement Type <i className={sorting.column === 'type' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('type')}></i>
                <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('type') }} />
              </span>
            </th>
            <th>
              <span className="has-sorting"  >Item
                <i className={sorting.column === 'item_desc' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('item_desc')}></i>
                <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('item_desc') }} />
              </span>
            </th>
            <th>
              <span className="has-sorting" >
                Grouping <i className={sorting.column === 'package' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('package')}></i>
              </span>
            </th>
            <th className="log-description">
              <span className='has-sorting' >
                Paragraph Context <i className={sorting.column === "para_context" ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting("para_context")}></i>
              </span>
            </th>
            <th>
              <span className="has-sorting" >
                Status <i className={sorting.column === 'status' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('status')}></i>
              </span>
            </th>
            <th>
              <span className="has-sorting" >
                Date Issued <i className={sorting.column === 'date_issued' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('date_issued')}></i>
              </span>
            </th>
            <th>
              <span className="has-sorting" >
                Date Approved <i className={sorting.column === 'date_approved' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('date_approved')}></i>
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
                        name={`ticketRow-${index}`}
                        id={`ticketRow-${index}`}
                        checked={props.selected.includes(log.id)}
                        onChange={() => props.handleSelect(log.id)}
                      />
                      <label
                        className="custom-control-label"
                        for={`ticketRow-${index}`}
                      ></label>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="action-items">
                    {<>
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
                          style={{marginRight: '10px'}}
                        >
                          Edit
                        </button>
                      )}
                        <Link
                          style={{fontWeight: 'normal'}}
                          className="btn btn-secondary btn-sm"
                          to={{ pathname: `/pdf-view`, search: `?url=${log?.doc_link}&textLoc=${log.text_loc}` }}
                          target="_blank" >
                           Pdf
                        </Link>
                      {/* <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewPdf(log.doc_link, JSON.parse(log.text_loc.replaceAll("'", '"')))}
                      >
                        Pdf
                      </button> */}
                    </>
                    }
                  </div>
                </td>
                <td>
                  {/* {editRow === index ? (
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
                  )} */}
                  {log.spec_section}
                </td>
                <td>
                  {log.para_no}
                  {/* {editRow === index ? (
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
                  )} */}
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
                    <div className={"log-desc " + (showMore === index ? 'show-content' : '')}>
                      {log.para_context}
                      {log.para_context.length > 132 && <span className="showmore-wrap" onClick={() => setModal(showMore === index ? null : index)}>...{showMore === index ? 'Show Less' : 'Show More'}</span>}
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
      <FilterTable
        modal={filterModal}
        setFilterModal={() => setFilterModal(!filterModal)}
        selectedFilterValue={selectedFilterValue}
        filterColumn={filterColumn}
        setFilterValues={setFilterValues}
        filterValues={filterValues}
        projectId={props.projectId}
        setLogData={props.setLogData}
        orderColumn={sorting.column || ""}
        order={sorting.order === 'desc' ? 'asc' : 'desc' || ""}
        selectedLogData={props.selectedLogData}
        listId={props.listId}
        setSelectedLogData={props.setSelectedLogData}
      />
    </div>
  );
}
