// import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';
// import DateSelector from '../shared/DateSelector/DateSelector';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { FilterTable } from './filterTable';
// import { ReactComponent as EditButton } from '../../assets/images/edit-button.svg';
// import { ReactComponent as AddButton } from '../../assets/images/circle-add.svg';
import { ReactComponent as PdfButton } from '../../assets/images/file-pdf.svg';
// import { ReactComponent as SaveButton } from '../../assets/images/label-approve.svg';
// import { ReactComponent as CancelButton } from '../../assets/images/label-reject.svg';
import { ReactComponent as ExpandButton } from '../../assets/images/down-arrow.svg';
import { ReactComponent as CollapseButton } from '../../assets/images/up-arrow.svg';
import { Tooltip } from 'reactstrap';
import handleError from '../../config/errorHandler';

export default function CombinedLogs(props) {
  const { logData, newRowIndex } = props;
  const [editRow, setEditRow] = useState('');
  // const [dateIssued, setDateIssued] = useState('');
  // const [dateApproved, setDateApproved] = useState('');
  // const [statusValue, setStatus] = useState({});
  const [groupingValue, setGroupingValue] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState({ column: '', order: 'desc' });
  const [filterModal, setFilterModal] = useState(false)
  const [selectedFilterValue, setSelectedFilterValue] = useState({})
  const [filterColumn, setFilterColumn] = useState('')
  const [filterValues, setFilterValues] = useState({ spec_section: [], type: ["Submittal"], item_desc: [], classification: [], sd_title: [] })
  // const [addRowTooltip, setaddRowTooltip] = useState(null)
  // const [editRowTooltip, setEditRowTooltip] = useState(null)
  const [pdfTooltip, setPdfTooltip] = useState(null)
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
    classification:''
  });

  const [showMore, setModal] = useState(null);
  // const toggleShowMore = () => setModal(!showMore);

  // const handleEditToggle = (log, index) => {
  //   setRowData(log);
  //   setEditRow(index);
  //   setDateIssued('');
  //   setDateApproved('');
  // };

  // const handleUpdateLog = async () => {
  //   try {
  //     setEditRow('');
  //     if (newRowIndex) {
  //       await axiosInstance({
  //         method: 'post',
  //         url: '/addRecord',
  //         data: {
  //           ...rowData,
  //           customer_id: props.customerId,
  //           user_id: localStorage.getItem('userId')
  //         }
  //       });
  //     } else {
  //       await axiosInstance({
  //         method: 'put',
  //         url: '/update_logs',
  //         data: {
  //           customer_id: props.customerId,
  //           comments: rowData.comments,
  //           id: rowData.id,
  //           item_desc: rowData.item_desc,
  //           package: groupingValue?.length
  //             ? groupingValue[0].label
  //             : searchValue
  //               ? searchValue
  //               : rowData.package,
  //           para_context: rowData.para_context,
  //           classification: rowData?.classification,
  //           phase: null,
  //           sd_no: rowData?.sd_no,
  //           div_no: rowData?.div_no,
  //           para_no: rowData.para_no,
  //           project_id: rowData.project_id,
  //           spec_section: rowData.spec_section,
  //           status: statusValue?.length ? statusValue[0].value : '',
  //           type: rowData.type,
  //           date_issued: !dateIssued
  //             ? rowData?.date_issued
  //               ? moment(
  //                 new Date((rowData?.date_issued).replaceAll('-', '/'))
  //               ).format('YYYY-MM-DD')
  //               : null
  //             : moment(dateIssued).format('YYYY-MM-DD'),
  //           date_approved: !dateApproved
  //             ? rowData?.date_approved
  //               ? moment(
  //                 new Date((rowData?.date_approved).replaceAll('-', '/'))
  //               ).format('YYYY-MM-DD')
  //               : null
  //             : moment(dateApproved).format('YYYY-MM-DD'),
  //         },
  //       });

  //     }
  //     setNewRowIndex(null)
  //     props.setPageRefresh(!props.pageRefresh);
  //   } catch (error) {
  //     console.log(error.message);
  //     toast.error(error?.response?.data?.message || error?.message, {
  //       position: 'bottom-center',
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // };

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
          filters: {...a, type: ["Submittal"]},
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
      handleError(error)
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
          filters: Object.values(filterValues).map(value => value.length ? true : false).includes(true) ? {...a, type: ["Submittal"]} : {type: ["Submittal"]},
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
      handleError(error)
    }
  }

  const handleViewPdf = (pdfUrl, textLocation, rowIndex, id) => {
    props.setPdfData({
      ...props.pdfData,
      url: pdfUrl,
      textLoc: textLocation,
      index: rowIndex,
      docId: id
    })
  };
  // const insertElement = (arr, index, newItem) => [
  //   // part of the array before the specified index
  //   ...arr.slice(0, index),
  //   // inserted item
  //   newItem,
  //   // part of the array after the specified index
  //   ...arr.slice(index)
  // ]
  // const deleteElement = (arr, index) => [
  //   // part of the array before the specified index
  //   ...arr.slice(0, index),
  //   // part of the array after the specified index
  //   ...arr.slice(index + 1)
  // ]

  // const handleAddRow = async (log) => {
  //   try {
  //     let index = props.logData?.findIndex(item => item === log)
  //     const dashIndex = log.para_no.search('-')
  //     // Below we are making an array of para_nos then filtering them like if log.para_no = 1.04, paraNos will have all entries of 1.04 i.e. 1.04-a, 1.04-b etc.
  //     const paraNos = completeLogData?.map(log => log.para_no).filter(paraNo => paraNo.includes(dashIndex !== -1 ? log.para_no.slice(0, dashIndex) : log.para_no))
  //     //Now we are making an array containing the ascii character values of elements after '-' in paraNos
  //     const charArray = paraNos.map(paraNo => paraNo.search('-') !== -1 ? paraNo.codePointAt(paraNo.search('-') + 1) : 96)
  //     const logObj = {
  //       ...log,
  //       //Here we are checking if para_no already contains a character after '-'. 
  //       // If yes, we are increasing the ascii value of the character by 1 for ex.- if it's a it will make it b. 
  //       // If No, it will add '-a' to para_no
  //       para_no: dashIndex !== -1 ?
  //         log.para_no.slice(0, dashIndex + 1) + String.fromCharCode(Math.max(...charArray) + 1) :
  //         `${log.para_no}-${String.fromCharCode(Math.max(...charArray) + 1)}`,
  //       customer_id: props.customerId, user_id: localStorage.getItem('userId'), para_context: ''
  //     }
  //     const result = insertElement(props.logData, index + 1, logObj)
  //     props.setFilteredLogData(result)

  //     setNewRowIndex(index + 1)
  //     handleEditToggle(logObj, index + 1)
  //     if (props.pdfData.url) {
  //       let docElement = document.getElementsByClassName("l-table-wrapper")
  //       docElement[0].scrollTo(890, 0)
  //     }
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message || error?.message, {
  //       position: 'bottom-center',
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // }
  useEffect(() => {
    setEditRow('');
  }, [props.searchValue])
  return (
    <div className="l-table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th className="ticket-checkbox small-font">
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
            <th className="text-center small-font">Source</th>
            <th className='small-font'>
              <span className="has-sorting" >
                Spec Sec <i className={sorting.column === 'spec_section' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('spec_section')}></i>
                <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('spec_section') }} />
              </span>
            </th>
            {props.projectType === 'ufgs' && <>
              <th className='small-font'>
                <span className="has-sorting" >
                  Div # <i className={sorting.column === 'div_no' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('div_no')}></i>
                  {/* <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('div_no') }} /> */}
                </span>
              </th>
              <th className='small-font'>
                <span className="has-sorting" >
                  SD # <i className={sorting.column === 'sd_no' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('sd_no')}></i>
                  {/* <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('sd_no') }} /> */}
                </span>
              </th>
            </>
            }
            {props.projectType !== 'ufgs' && <th className='para-no small-font'>
              <span>
                Para
              </span>
            </th>}
           {props.projectType !== 'ufgs' && <th className='small-font'>
              <span className="has-sorting" >
                Submittal Heading <i className={sorting.column === 'type' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('type')}></i>
                {/* <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('type') }} /> */}
              </span>
            </th>}
            {props.projectType === 'ufgs' && <th className='small-font'>
              <span className="has-sorting" >
                SD Title <i className={sorting.column === 'sd_title' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('sd_title')}></i>
                <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('sd_title') }} />
              </span>
            </th>}
            <th className='small-font'>
              <span className="has-sorting"  >
                Submittal Type
                <div>
                  <i className={sorting.column === 'item_desc' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('item_desc')}></i>
                  <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('item_desc') }} />
                </div>
              </span>
            </th>
            {/* {props.projectType === 'ufgs' &&
              <th>
                <span className="has-sorting" >
                  Phase <i className={sorting.column === 'package' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('package')}></i>
                </span>
              </th>
            } */}
            {props.projectType === 'ufgs' &&
              <th className='small-font'>
                <span className="has-sorting" >
                  Classification <i className={sorting.column === 'classification' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('classification')}></i>
                <i className='has-filter' onClick={() => { handleOpenFilterModal(); setFilterColumn('classification') }} />
                </span>
              </th>
            }
            {props.projectType !== 'ufgs' && 
            <>
              <th className='small-font'>
                <span className="has-sorting" >
                  Grouping <i className={sorting.column === 'package' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('package')}></i>
                </span>
              </th>
              <th className="log-description small-font">
              <span className='has-sorting' >
                Submittal Description <i className={sorting.column === "para_context" ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting("para_context")}></i>
              </span>
            </th>
            </>
            }
            
            {/* <th>
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
            </th> */}
          </tr>
        </thead>
        <tbody style={{fontSize: '12px'}}>
          {logData.map((log, index) => {
            return (
              <tr className={(log.user_id !== 1 || index%2 !== 0) ? "highlight-row" : ""} style={{lineHeight: 1.2}}>
                <td className="ticket-checkbox reduce-height">
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
                <td className="reduce-height">
                  <div className="action-items">
                    {<>
                      {/* {editRow === index ? (
                        <>
                          <SaveButton onClick={handleUpdateLog} style={{ marginRight: '5px' }} />
                          <CancelButton
                            style={{ marginRight: '5px' }}
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
                              setNewRowIndex(null)
                              newRowIndex === index && props.setLogData(deleteElement(props.logData, index))
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <EditButton onClick={() => handleEditToggle(log, index)} style={{ marginRight: '5px' }} id={'Edit-Tooltip-' + index + 1} />
                          <Tooltip placement="left" target={'Edit-Tooltip-' + index + 1} isOpen={editRowTooltip === index + 1} toggle={() => setEditRowTooltip(editRowTooltip ? editRowTooltip === index + 1 ? null : index + 1 : index + 1)}>
                            Edit Row
                          </Tooltip></>
                      )} */}
                      {/* <Link
                        style={{ fontWeight: 'normal' }}
                        className="btn btn-secondary btn-sm"
                        to={{ pathname: `/pdf-view`, search: `?url=${log?.doc_link}&textLoc=${log.text_loc}` }}
                        target="_blank" >
                        Pdf
                      </Link> */}
                      {props.pdfData.index === index ?
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ marginRight: '5px' }}
                          onClick={() => props.setPdfData({ url: '', textLoc: {}, index: '', docId: null })}
                        >
                          Close Pdf
                        </button> :
                        newRowIndex !== index && log.user_id === 1 &&
                        <>
                          <PdfButton onClick={() => handleViewPdf(log.doc_link, log.text_loc, index, log.doc_id)} style={{ marginRight: '5px' }} id={'Pdf-Tooltip-' + index + 1} />
                          <Tooltip placement="top" target={'Pdf-Tooltip-' + index + 1} isOpen={pdfTooltip === index + 1} toggle={() => setPdfTooltip(pdfTooltip ? pdfTooltip === index + 1 ? null : index + 1 : index + 1)}>
                            View Pdf
                          </Tooltip></>
                      }
                      {/* {!props.selectedLogData.length && <><AddButton onClick={() => {
                        if (!newRowIndex) {
                          handleAddRow(log)
                        } else if (newRowIndex === index + 1) {
                          handleAddRow(log)
                        }
                      }} id={'Tooltip-' + index + 1}
                      />
                        <Tooltip placement="right" target={'Tooltip-' + index + 1} isOpen={addRowTooltip === index + 1} toggle={() => setaddRowTooltip(addRowTooltip ? addRowTooltip === index + 1 ? null : index + 1 : index + 1)}>
                          Add Row below
                        </Tooltip></>} */}
                    </>
                    }
                  </div>
                </td>
                <td className="reduce-height">
                  {editRow === index && (newRowIndex === index || log.user_id !== 1) ? (
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
                  {/* {log.spec_section} */}
                </td>
                {props.projectType === 'ufgs' &&
                  <>
                    <td className="reduce-height">
                      {log.div_no}
                    </td>
                    <td className="reduce-height">
                      {log.sd_no}
                    </td>
                  </>
                }
                {props.projectType !== 'ufgs' && <td className="reduce-height">
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
                </td>}
                {props.projectType !== 'ufgs' && <td className="reduce-height">
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
                </td>}
                {props.projectType === 'ufgs' && <td className="reduce-height"> {log.sd_title} </td>}
                <td className="reduce-height">
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
                {props.projectType === 'ufgs' && <td style={{textAlign: 'center'}}>
                  {/* {editRow === index ? (
                    <div
                      className="form-group log-datepicker"
                      style={{ minWidth: '240px' }}
                    >
                      <SelectDropdown
                        label={'Phase'}
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
                  ) : ( */}
                    {log.classification}
                  {/* )} */}
                </td>}
                {props.projectType !== 'ufgs' && 
                <>
                  <td className="reduce-height">
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
                  <td className="reduce-height">
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
                        {log.para_context.length > 10 && <span className="showmore-wrap" onClick={() => setModal(showMore === index ? null : index)}>{showMore === index ? <CollapseButton/> : <ExpandButton/>}</span>}
                      </div>
                    )}
                  </td>
                </>
                }
                {/* <td className="reduce-height">
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
                <td className="reduce-height">
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
                <td className="reduce-height">
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
                <td className="reduce-height">
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
                </td> */}

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

    </div >

  );
}
