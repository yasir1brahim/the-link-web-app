// import moment from 'moment';
import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
// import DateSelector from '../shared/DateSelector/DateSelector';
// import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { FilterTable } from "./filterTable";
import { ReactComponent as EditButton } from "../../assets/images/edit-button.svg";
import { ReactComponent as AddButton } from "../../assets/images/circle-add.svg";
import { ReactComponent as PdfButton } from "../../assets/images/file-pdf.svg";
import { ReactComponent as SaveButton } from "../../assets/images/label-approve.svg";
import { ReactComponent as CancelButton } from "../../assets/images/label-reject.svg";
import { ReactComponent as ExpandButton } from "../../assets/images/down-arrow.svg";
import { ReactComponent as CollapseButton } from "../../assets/images/up-arrow.svg";
import { Tooltip } from "reactstrap";
import handleError from "../../config/errorHandler";

export default function CombinedLogs(props) {
  const {
    logData,
    newRowIndex,
    filterValues,
    setFilterValues,
    setTotalCount,
    errorMessage,
    setNewRowIndex,
    editRow,
    setEditRow,
    rowData,
    setRowData
  } = props;
  // const [dateIssued, setDateIssued] = useState('');
  // const [dateApproved, setDateApproved] = useState('');
  // const [statusValue, setStatus] = useState({});
  // const [groupingValue, setGroupingValue] = useState({});
  // const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState({ column: "", order: "desc" });
  const [filterModal, setFilterModal] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");

  const [addRowTooltip, setaddRowTooltip] = useState(null);
  const [editRowTooltip, setEditRowTooltip] = useState(null);
  const [pdfTooltip, setPdfTooltip] = useState(null);
  // const navigate = useNavigate();

  const [formValid, setFormValid] = useState({
    spec_section: true,
    para_no: true,
    para_context: true,
    type: true,
    item_desc: true,
  });

  const [showMore, setModal] = useState(null);
  // const toggleShowMore = () => setModal(!showMore);

  const handleEditToggle = (log, index) => {
    setRowData(log);
    setEditRow(index);
    // setDateIssued('');
    // setDateApproved('');
  };

  const handleUpdateLog = async () => {
    try {
      setFormValid({
        spec_section: true,
        para_no: true,
        para_context: true,
        type: true,
        item_desc: true,
      });
      if (rowData.spec_section === "" || rowData.para_no === "" || rowData.para_context === "" || rowData.type === "" || rowData.item_desc === "") {
        setFormValid({
          ...formValid,
          spec_section: rowData.spec_section === "" ? false : true,
          para_no: rowData.para_no === "" ? false : true,
          para_context: rowData.para_context === "" ? false : true,
          type: rowData.type === "" ? false : true,
          item_desc: rowData.item_desc === "" ? false : true,
        })
        return
      }

      setEditRow("");
      if (newRowIndex) {
        await axiosInstance({
          method: "post",
          url: "/addRecord",
          data: {
            ...rowData,
            customer_id: props.customerId,
            user_id: localStorage.getItem("userId"),
          },
        });
      } else {
        await axiosInstance({
          method: "put",
          url: "/v2/update_logs",
          data: {
            // customer_id: props.customerId,
            // comments: rowData.comments,
            record: rowData.id,
            submittal_type: rowData.item_desc,
            // package: groupingValue?.length
            //   ? groupingValue[0].label
            //   : searchValue
            //     ? searchValue
            //     : rowData.package,
            submittal_description: rowData.para_context,
            // classification: rowData?.classification,
            // phase: null,
            // sd_no: rowData?.sd_no,
            // div_no: rowData?.div_no,
            para_no: rowData.para_no,
            project_id: rowData.project_id,
            spec_section: rowData.spec_section,
            // status: statusValue?.length ? statusValue[0].value : '',
            submittal_heading: rowData.type,
            para_context: rowData.para_context,
            // date_issued: !dateIssued
            //   ? rowData?.date_issued
            //     ? moment(
            //       new Date((rowData?.date_issued).replaceAll('-', '/'))
            //     ).format('YYYY-MM-DD')
            //     : null
            //   : moment(dateIssued).format('YYYY-MM-DD'),
            // date_approved: !dateApproved
            //   ? rowData?.date_approved
            //     ? moment(
            //       new Date((rowData?.date_approved).replaceAll('-', '/'))
            //     ).format('YYYY-MM-DD')
            //     : null
            //   : moment(dateApproved).format('YYYY-MM-DD'),
          },
        });
      }
      setNewRowIndex(null);
      props.setPageRefresh(!props.pageRefresh);
      props.setLogInViewer(null);
      props.setPdfData({
        url: "",
        textLoc: {},
        index: "",
        docId: null,
      })
    } catch (error) {
      console.log(error.message);
      // toast.error(error?.response?.data?.message || error?.message, {
      //   position: 'bottom-center',
      //   autoClose: 5000,
      //   hideProgressBar: true,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      // });
    }
  };

  const handleSorting = async (columnName) => {
    let sortingOrder = sorting.column === columnName ? sorting.order : "desc";
    let a = {};
    if (
      Object.values(filterValues)
        .map((value) => (value.length ? true : false))
        .includes(true)
    ) {
      Object.keys(filterValues).forEach((key) =>
        filterValues[key].length
          ? (a = { ...a, [key]: filterValues[key] })
          : null,
      );
    }
    try {
      // const response = await axiosInstance({
      //   method: 'get',
      //   url: props.selectedLogData.length ?
      //     `/sort_saved_logs/${props.listId}/${columnName}/${sortingOrder === 'desc' ? 'asc' : 'desc'}` :
      //     `/sort_logs/${props.projectId}/${columnName}/${sortingOrder === 'desc' ? 'asc' : 'desc'}`,

      // });
      const response = await axiosInstance({
        method: "post",
        url: props.qaDashboard ? "qa_dashboard_logs" : "/filter_logs",
        data: {
          project_id: props.projectId,
          search: "",
          // filters: Object.values(filterValues).map(value => value.length ? true : false).includes(true) ? a : {},
          filters: a,
          order_col: columnName || "",
          order: sortingOrder === "desc" ? "asc" : "desc" || "",
          list_id: props.selectedLogData.length ? props.listId : "",
          page_number: props?.page - 1,
          limit: props?.rowsPerPage,
        },
      });
      localStorage.setItem(
        "filteredIds",
        response.data?.message?.map((item) => item?.id),
      );
      props.selectedLogData.length
        ? props.setSelectedLogData(response.data.message)
        : props.setLogData(response.data.message);

      setSorting({
        ...sorting,
        column: columnName,
        order: sortingOrder === "desc" ? "asc" : "desc",
      });
    } catch (error) {
      console.log(error.message);
      handleError(error);
    }
  };

  const handleViewPdf = (pdfUrl, textLocation, rowIndex, id) => {
    props.setPdfData({
      ...props.pdfData,
      url: pdfUrl,
      textLoc: textLocation,
      index: rowIndex,
      docId: id,
    });
  };
  const insertElement = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index),
  ];
  const deleteElement = (arr, index) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // part of the array after the specified index
    ...arr.slice(index + 1),
  ];

  const handleAddRow = async (log) => {
    try {
      let index = props.logData?.findIndex((item) => item === log);
      const dashIndex = log.para_no.search("-");
      // Below we are making an array of para_nos then filtering them like if log.para_no = 1.04, paraNos will have all entries of 1.04 i.e. 1.04-a, 1.04-b etc.
      const paraNos = props.logData
        ?.map((log) => log.para_no)
        .filter((paraNo) =>
          paraNo.includes(
            dashIndex !== -1 ? log.para_no.slice(0, dashIndex) : log.para_no,
          ),
        );
      //Now we are making an array containing the ascii character values of elements after '-' in paraNos
      const charArray = paraNos.map((paraNo) =>
        paraNo.search("-") !== -1
          ? paraNo.codePointAt(paraNo.search("-") + 1)
          : 96,
      );
      const logObj = {
        ...log,
        //Here we are checking if para_no already contains a character after '-'.
        // If yes, we are increasing the ascii value of the character by 1 for ex.- if it's a it will make it b.
        // If No, it will add '-a' to para_no
        para_no:
          dashIndex !== -1
            ? log.para_no.slice(0, dashIndex + 1) +
              String.fromCharCode(Math.max(...charArray) + 1)
            : `${log.para_no}-${String.fromCharCode(
                Math.max(...charArray) + 1,
              )}`,
        // customer_id: props.customerId, user_id: localStorage.getItem('userId'), para_context: ''
      };
      const result = insertElement(props.logData, index + 1, logObj);
      props.setFilteredLogData(result);

      setNewRowIndex(index + 1);
      handleEditToggle(logObj, index + 1);
      if (props.pdfData.url) {
        let docElement = document.getElementsByClassName("l-table-wrapper");
        docElement[0].scrollTo(890, 0);
      }
    } catch (error) {
      // toast.error(error?.response?.data?.message || error?.message, {
      //   position: 'bottom-center',
      //   autoClose: 5000,
      //   hideProgressBar: true,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      // });
    }
  };
  useEffect(() => {
    setEditRow("");
  }, [props.searchValue]);
  return (
    <div
      className="l-table-wrapper"
      style={{
        maxHeight: "calc(100vh - 275px)"
      }}
    >
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
                    htmlFor="ticketHeading"
                  ></label>
                </div>
              </div>
            </th>

            <th className="text-center small-font">Actions</th>


            <th className="small-font">
              <span className="has-sorting">
                <div className="d-flex">
                  Spec Section{" "}
                  <span
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => handleSorting("spec_section")}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.52832 1.58331V10.6111"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.4731 12.4166V3.38885"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="ml-3">
                  <span
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("spec_section");
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 1.30312C0 0.584375 0.584375 0 1.30313 0H14.6969C15.4156 0 16 0.584375 16 1.30312C16 1.60312 15.8969 1.89375 15.7063 2.125L10.5 8.51562V12.9906C10.5 13.5469 10.0469 14 9.49063 14C9.2625 14 9.04063 13.9219 8.8625 13.7812L5.97188 11.4875C5.67188 11.25 5.5 10.8906 5.5 10.5094V8.51562L0.29375 2.125C0.103125 1.89375 0 1.60312 0 1.30312ZM1.71875 1.5L6.83125 7.775C6.94063 7.90937 7 8.075 7 8.25V10.3875L9 11.975V8.25C9 8.07812 9.05937 7.90937 9.16875 7.775L14.2812 1.5H1.71875Z"
                        fill="#36454F"
                      />
                    </svg>
                  </span>
                </div>
              </span>
            </th>
            {props.projectType === "ufgs" && (
              <>
                <th className="small-font">
                  <span className="has-sorting">
                    Div #{" "}
                    <i
                      className={
                        sorting.column === "div_no"
                          ? sorting.order === "asc"
                            ? "sort-i"
                            : "sort-d"
                          : ""
                      }
                      onClick={() => handleSorting("div_no")}
                    ></i>
                    {/* <i className='has-filter' onClick={() => { setFilterModal(true); setFilterColumn('div_no') }} /> */}
                  </span>
                </th>
                <th className="small-font">
                  <span className="has-sorting">
                    SD #{" "}
                    <i
                      className={
                        sorting.column === "sd_no"
                          ? sorting.order === "asc"
                            ? "sort-i"
                            : "sort-d"
                          : ""
                      }
                      onClick={() => handleSorting("sd_no")}
                    ></i>
                    {/* <i className='has-filter' onClick={() => { setFilterModal(true); setFilterColumn('sd_no') }} /> */}
                  </span>
                </th>
              </>
            )}
            {props.projectType !== "ufgs" && (
              <th className="para-no small-font">
                <span>Paragraph</span>
              </th>
            )}
            {props.projectType !== "ufgs" && (
              <th className="small-font">
                <span className="has-sorting">
                  <div className="d-flex">
                    Submittal Heading{" "}
                    <span
                      style={{ cursor: "pointer", marginLeft: "6px" }}
                      onClick={() => handleSorting("type")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.52832 1.58331V10.6111"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.4731 12.4166V3.38885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="ml-3">
                    <span
                      onClick={() => {
                        setFilterModal(true);
                        setFilterColumn("type");
                      }}
                    >
                      <svg
                        width="16"
                        height="14"
                        viewBox="0 0 16 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 1.30312C0 0.584375 0.584375 0 1.30313 0H14.6969C15.4156 0 16 0.584375 16 1.30312C16 1.60312 15.8969 1.89375 15.7063 2.125L10.5 8.51562V12.9906C10.5 13.5469 10.0469 14 9.49063 14C9.2625 14 9.04063 13.9219 8.8625 13.7812L5.97188 11.4875C5.67188 11.25 5.5 10.8906 5.5 10.5094V8.51562L0.29375 2.125C0.103125 1.89375 0 1.60312 0 1.30312ZM1.71875 1.5L6.83125 7.775C6.94063 7.90937 7 8.075 7 8.25V10.3875L9 11.975V8.25C9 8.07812 9.05937 7.90937 9.16875 7.775L14.2812 1.5H1.71875Z"
                          fill="#36454F"
                        />
                      </svg>
                    </span>
                  </div>
                </span>
              </th>
            )}
            {props.qaDashboard && (
              <th className="small-font">
                <span className="has-sorting">
                  <div className="d-flex">
                    Owner/Contractor{" "}
                    <span
                      style={{ cursor: "pointer", marginLeft: "6px" }}
                      onClick={() => handleSorting("owner_contractor")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.52832 1.58331V10.6111"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.4731 12.4166V3.38885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <span
                    className="ml-3"
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("owner_contractor");
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 1.30312C0 0.584375 0.584375 0 1.30313 0H14.6969C15.4156 0 16 0.584375 16 1.30312C16 1.60312 15.8969 1.89375 15.7063 2.125L10.5 8.51562V12.9906C10.5 13.5469 10.0469 14 9.49063 14C9.2625 14 9.04063 13.9219 8.8625 13.7812L5.97188 11.4875C5.67188 11.25 5.5 10.8906 5.5 10.5094V8.51562L0.29375 2.125C0.103125 1.89375 0 1.60312 0 1.30312ZM1.71875 1.5L6.83125 7.775C6.94063 7.90937 7 8.075 7 8.25V10.3875L9 11.975V8.25C9 8.07812 9.05937 7.90937 9.16875 7.775L14.2812 1.5H1.71875Z"
                        fill="#36454F"
                      />
                    </svg>
                  </span>
                </span>
              </th>
            )}
            {props.projectType === "ufgs" && (
              <th className="small-font">
                <span className="has-sorting">
                  <div className="d-flex">
                    SD Title{" "}
                    <span
                      style={{ cursor: "pointer", marginLeft: "6px" }}
                      onClick={() => handleSorting("sd_title")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.52832 1.58331V10.6111"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.4731 12.4166V3.38885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <span
                    className="ml-3"
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("sd_title");
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 1.30312C0 0.584375 0.584375 0 1.30313 0H14.6969C15.4156 0 16 0.584375 16 1.30312C16 1.60312 15.8969 1.89375 15.7063 2.125L10.5 8.51562V12.9906C10.5 13.5469 10.0469 14 9.49063 14C9.2625 14 9.04063 13.9219 8.8625 13.7812L5.97188 11.4875C5.67188 11.25 5.5 10.8906 5.5 10.5094V8.51562L0.29375 2.125C0.103125 1.89375 0 1.60312 0 1.30312ZM1.71875 1.5L6.83125 7.775C6.94063 7.90937 7 8.075 7 8.25V10.3875L9 11.975V8.25C9 8.07812 9.05937 7.90937 9.16875 7.775L14.2812 1.5H1.71875Z"
                        fill="#36454F"
                      />
                    </svg>
                  </span>
                </span>
              </th>
            )}
            <th className="small-font">
              <span className="has-sorting">
                <div className="d-flex">
                  Submittal Type
                  <span
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => handleSorting("item_desc")}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.52832 1.58331V10.6111"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.4731 12.4166V3.38885"
                        stroke="#36454F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="ml-3">
                  <span
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("item_desc");
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 1.30312C0 0.584375 0.584375 0 1.30313 0H14.6969C15.4156 0 16 0.584375 16 1.30312C16 1.60312 15.8969 1.89375 15.7063 2.125L10.5 8.51562V12.9906C10.5 13.5469 10.0469 14 9.49063 14C9.2625 14 9.04063 13.9219 8.8625 13.7812L5.97188 11.4875C5.67188 11.25 5.5 10.8906 5.5 10.5094V8.51562L0.29375 2.125C0.103125 1.89375 0 1.60312 0 1.30312ZM1.71875 1.5L6.83125 7.775C6.94063 7.90937 7 8.075 7 8.25V10.3875L9 11.975V8.25C9 8.07812 9.05937 7.90937 9.16875 7.775L14.2812 1.5H1.71875Z"
                        fill="#36454F"
                      />
                    </svg>
                  </span>
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
            {props.projectType === "ufgs" && (
              <th className="small-font">
                <span className="has-sorting">
                  <div className="d-flex">
                    Classification{" "}
                    <span
                      style={{ cursor: "pointer", marginLeft: "6px" }}
                      onClick={() => handleSorting("classification")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.52832 1.58331V10.6111"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.4731 12.4166V3.38885"
                          stroke="#36454F"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <span
                    className="ml-3"
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("classification");
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 1.30312C0 0.584375 0.584375 0 1.30313 0H14.6969C15.4156 0 16 0.584375 16 1.30312C16 1.60312 15.8969 1.89375 15.7063 2.125L10.5 8.51562V12.9906C10.5 13.5469 10.0469 14 9.49063 14C9.2625 14 9.04063 13.9219 8.8625 13.7812L5.97188 11.4875C5.67188 11.25 5.5 10.8906 5.5 10.5094V8.51562L0.29375 2.125C0.103125 1.89375 0 1.60312 0 1.30312ZM1.71875 1.5L6.83125 7.775C6.94063 7.90937 7 8.075 7 8.25V10.3875L9 11.975V8.25C9 8.07812 9.05937 7.90937 9.16875 7.775L14.2812 1.5H1.71875Z"
                        fill="#36454F"
                      />
                    </svg>
                  </span>
                </span>
              </th>
            )}
            {props.projectType !== "ufgs" && (
              <>
                {/* <th className='small-font'>
                <span className="has-sorting" >
                  Grouping <i className={sorting.column === 'package' ? sorting.order === 'asc' ? 'sort-i' : 'sort-d' : ''} onClick={() => handleSorting('package')}></i>
                </span>
              </th> */}
                <th className="log-description small-font">
                  <span className="has-sorting">
                    <div className="d-flex">
                      Submittal Description{" "}
                      <span
                        style={{ cursor: "pointer", marginLeft: "6px" }}
                        onClick={() => handleSorting("para_context")}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.30556 4.36109L3.52778 1.58331L0.75 4.36109"
                            stroke="#36454F"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.52832 1.58331V10.6111"
                            stroke="#36454F"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.2504 9.63885L10.4726 12.4166L7.69482 9.63885"
                            stroke="#36454F"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.4731 12.4166V3.38885"
                            stroke="#36454F"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </span>
                </th>
              </>
            )}

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
        <tbody style={{ fontSize: "12px" }}>
          {logData.map((log, index) => {
            let pdfIndex = props.pdfData.index;
            const showPdf = !(pdfIndex && pdfIndex !== index) && pdfIndex !== 0;
            return (
              <tr
                className={
                  log.user_id !== 1 || index % 2 !== 0 ? "highlight-row" : ""
                }
                style={{ lineHeight: 1.2 }}
                key={index}
              >
                <td
                  className={`${
                    editRow === index ? "activeTh" : ""
                  } ticket-checkbox reduce-height`}
                >
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
                        htmlFor={`ticketRow-${index}`}
                      ></label>
                    </div>
                  </div>
                </td>

                <td
                  className={`${
                    editRow === index ? "activeTh" : ""
                  } reduce-height`}
                >
                  <div className="action-items">
                    {
                      <>
                        {editRow === index ? (
                          <>
                            <div
                              onClick={() =>
                                handleUpdateLog()
                              }
                              style={{ marginRight: "5px", cursor: "pointer" }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12.4162 3.84491L5.51162 10.7497L1.58325 6.82137"
                                  stroke="#2F5AA3"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div
                              style={{ marginRight: "5px", cursor: "pointer" }}
                              onClick={() => {
                                setEditRow("");
                                setFormValid({
                                  spec_section: true,
                                  para_no: true,
                                  para_context: true,
                                  type: true,
                                  item_desc: true,
                                });
                                setRowData({
                                  comments: "",
                                  date_approved: "",
                                  date_issued: "",
                                  // id: 1,
                                  item_desc: "",
                                  package: "",
                                  para_context: "",
                                  para_no: "",
                                  project_id: "",
                                  spec_section: "",
                                  status: "",
                                  type: "",
                                });
                                // setDateApproved('');
                                // setDateIssued('');
                                // setStatus({});
                                setNewRowIndex(null);
                                newRowIndex === index &&
                                  props.setLogData(
                                    deleteElement(props.logData, index),
                                  );
                                newRowIndex === index + 1 &&
                                  props.setLogData(
                                    deleteElement(props.logData, index),
                                  );
                                newRowIndex === index + 1 &&
                                  props.setPdfData({...props.pdfData, index: props.pdfData.index - 1})
                              }}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M0.244078 0.244078C0.569515 -0.0813592 1.09715 -0.0813592 1.42259 0.244078L5 3.82149L8.57741 0.244078C8.90285 -0.0813592 9.43049 -0.0813592 9.75592 0.244078C10.0814 0.569515 10.0814 1.09715 9.75592 1.42259L6.17851 5L9.75592 8.57741C10.0814 8.90285 10.0814 9.43049 9.75592 9.75592C9.43049 10.0814 8.90285 10.0814 8.57741 9.75592L5 6.17851L1.42259 9.75592C1.09715 10.0814 0.569515 10.0814 0.244078 9.75592C-0.0813592 9.43049 -0.0813592 8.90285 0.244078 8.57741L3.82149 5L0.244078 1.42259C-0.0813592 1.09715 -0.0813592 0.569515 0.244078 0.244078Z"
                                  fill="#A32F2F"
                                />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <>
                            <span
                              onClick={() => handleEditToggle(log, index)}
                              style={{ cursor: "pointer" }}
                            >
                              <svg
                                id={"Edit-Tooltip-" + index + 1}
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M0.666748 2.33332C0.666748 1.41285 1.41294 0.666657 2.33341 0.666657H8.16675C8.62698 0.666657 9.00008 1.03975 9.00008 1.49999C9.00008 1.96023 8.62698 2.33332 8.16675 2.33332H2.33341V15.6667H15.6667V9.83332C15.6667 9.37308 16.0398 8.99999 16.5001 8.99999C16.9603 8.99999 17.3334 9.37308 17.3334 9.83332V15.6667C17.3334 16.5871 16.5872 17.3333 15.6667 17.3333H2.33341C1.41295 17.3333 0.666748 16.5871 0.666748 15.6667V2.33332ZM13.4562 0.666657C13.6773 0.666614 13.8894 0.754465 14.0458 0.910863L17.0895 3.9559C17.4147 4.28131 17.4147 4.80875 17.0895 5.13416L8.47163 13.7558C8.31534 13.9121 8.10332 14 7.88225 14H4.83341C4.37318 14 4.00008 13.6269 4.00008 13.1667V10.1333C4.00008 9.91244 4.08774 9.70063 4.24381 9.54438L12.8668 0.911087C13.023 0.75463 13.2351 0.666699 13.4562 0.666657ZM13.4566 2.67898L5.66675 10.4782V12.3333H7.53696L15.3218 4.54503L13.4566 2.67898Z"
                                  fill="#36454F"
                                />
                              </svg>
                            </span>
                            <span>
                              <Tooltip
                                placement="left"
                                target={"Edit-Tooltip-" + index + 1}
                                isOpen={editRowTooltip === index + 1}
                                toggle={() =>
                                  setEditRowTooltip(
                                    editRowTooltip
                                      ? editRowTooltip === index + 1
                                        ? null
                                        : index + 1
                                      : index + 1,
                                  )
                                }
                              >
                                Edit Row
                              </Tooltip>
                            </span>
                          </>
                        )}
                        {/* <Link
                        style={{ fontWeight: 'normal' }}
                        className="btn btn-secondary btn-sm"
                        to={{ pathname: `/pdf-view`, search: `?url=${log?.doc_link}&textLoc=${log.text_loc}` }}
                        target="_blank" >
                        Pdf
                      </Link> */}
                        {pdfIndex === index ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ marginRight: "5px" }}
                            onClick={() => {
                              props.setLogInViewer(null);
                              props.setPdfData({
                                url: "",
                                textLoc: {},
                                index: "",
                                docId: null,
                              })
                            }}
                          >
                            Close Pdf
                          </button>
                        ) : (
                          newRowIndex !== index &&
                          showPdf && (
                            <>
                              <span
                                onClick={() => {
                                  handleViewPdf(
                                    log.doc_link,
                                    log.text_loc,
                                    index,
                                    log.doc_id,
                                  );
                                  props.setLogInViewer(log);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <svg
                                  id={"Pdf-Tooltip-" + index + 1}
                                  width="16"
                                  height="20"
                                  viewBox="0 0 16 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M0.5 2.50001C0.5 1.57954 1.24619 0.833344 2.16667 0.833344H10.5C10.721 0.833344 10.933 0.921141 11.0893 1.07742L15.2559 5.24409C15.4122 5.40037 15.5 5.61233 15.5 5.83334V17.5C15.5 18.4205 14.7538 19.1667 13.8333 19.1667H2.16667C1.2462 19.1667 0.5 18.4205 0.5 17.5V2.50001ZM10.1548 2.50001H2.16667V17.5H13.8333V6.17852L10.1548 2.50001ZM4.66667 7.50001C4.66667 7.03977 5.03976 6.66668 5.5 6.66668H10.5C10.9602 6.66668 11.3333 7.03977 11.3333 7.50001V10.8299C11.3333 11.2899 10.9606 11.6629 10.5006 11.6632L6.33333 11.6661V14.1667C6.33333 14.6269 5.96024 15 5.5 15C5.03976 15 4.66667 14.6269 4.66667 14.1667V7.50001ZM6.33593 9.99943L9.66667 9.99713V8.33334H6.3342L6.33593 9.99943Z"
                                    fill="#36454F"
                                  />
                                </svg>
                              </span>
                              <span>
                                <Tooltip
                                  placement="top"
                                  target={"Pdf-Tooltip-" + index + 1}
                                  isOpen={pdfTooltip === index + 1}
                                  toggle={() =>
                                    setPdfTooltip(
                                      pdfTooltip
                                        ? pdfTooltip === index + 1
                                          ? null
                                          : index + 1
                                        : index + 1,
                                    )
                                  }
                                >
                                  View Pdf
                                </Tooltip>
                              </span>
                            </>
                          )
                        )}
                        {!props.selectedLogData.length && (
                          <>
                            <AddButton
                              onClick={() => {
                                if (!newRowIndex) {
                                  handleAddRow(log);
                                } else if (newRowIndex === index + 1) {
                                  handleAddRow(log);
                                }
                              }}
                              id={"Tooltip-" + index + 1}
                            />
                            <span>
                              <Tooltip
                                placement="right"
                                target={"Tooltip-" + index + 1}
                                isOpen={addRowTooltip === index + 1}
                                toggle={() =>
                                  setaddRowTooltip(
                                    addRowTooltip
                                      ? addRowTooltip === index + 1
                                        ? null
                                        : index + 1
                                      : index + 1,
                                  )
                                }
                              >
                                Add Row below
                              </Tooltip>
                            </span>
                          </>
                        )}
                      </>
                    }
                  </div>
                </td>

                <td
                  className={`${
                    editRow === index ? "activeTh" : ""
                  } reduce-height`}
                >
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className={`form-control ${formValid.spec_section ? '' : 'form-required'}`}
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
                {props.projectType === "ufgs" && (
                  <>
                    <td
                      className={`${
                        editRow === index ? "activeTh" : ""
                      } reduce-height`}
                    >
                      {log.div_no}
                    </td>
                    <td
                      className={`${
                        editRow === index ? "activeTh" : ""
                      } reduce-height`}
                    >
                      {log.sd_no}
                    </td>
                  </>
                )}
                {props.projectType !== "ufgs" && (
                  <td
                    className={`${
                      editRow === index ? "activeTh" : ""
                    } reduce-height`}
                  >
                    {editRow === index ? (
                      <input
                        placeholder="Enter"
                        className={`form-control ${formValid.para_no ? '' : 'form-required'}`}
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
                )}
                {props.projectType !== "ufgs" && (
                  <td
                    className={`${
                      editRow === index ? "activeTh" : ""
                    } reduce-height`}
                  >
                    {editRow === index ? (
                      <input
                        placeholder="Enter"
                        className={`form-control ${formValid.type ? '' : 'form-required'}`}
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
                )}
                {props.projectType === "ufgs" && (
                  <td className="reduce-height"> {log.sd_title} </td>
                )}
                <td
                  className={`reduce-height ${
                    editRow === index ? "activeTh" : ""
                  }`}
                >
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className={`form-control ${formValid.item_desc ? '' : 'form-required'}`}
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
                {props.projectType === "ufgs" && (
                  <td
                    className={`${editRow === index ? "activeTh" : ""}`}
                    style={{ textAlign: "center" }}
                  >
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
                  </td>
                )}
                {props.projectType !== "ufgs" && (
                  <>
                    {/* <td>
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
                  </td> */}
                    <td
                      className={`${
                        editRow === index ? "activeTh" : ""
                      } reduce-height`}
                    >
                      {editRow === index && JSON.parse(log.full_edit) ? (
                        <input
                          placeholder="Enter"
                          className={`form-control ${formValid.para_context ? '' : 'form-required'}`}
                          type="text"
                          value={rowData.para_context}
                          // style={{ border: 'none' }}
                          onChange={(e) =>
                            setRowData({
                              ...rowData,
                              para_context: e.target.value,
                            })
                          }
                        />
                      ) : editRow === index ? (
                        <input
                          placeholder="Enter"
                          className={`form-control ${formValid.para_context ? '' : 'form-required'}`}
                          type="text"
                          value={rowData.para_context}
                          // style={{ border: 'none' }}
                          onChange={(e) =>
                            setRowData({
                              ...rowData,
                              para_context: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div
                          className={
                            "log-desc " +
                            (showMore === index ? "show-content" : "")
                          }
                        >
                          {log.para_context}
                          {log.para_context.length > 85 && (
                            <span
                              className="showmore-wrap"
                              onClick={() =>
                                setModal(showMore === index ? null : index)
                              }
                            >
                              {showMore === index ? (
                                <CollapseButton />
                              ) : (
                                <ExpandButton />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </>
                )}
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
        selectedFilterValue={props?.selectedFilterValue}
        filterColumn={filterColumn}
        setFilterValues={setFilterValues}
        filterValues={filterValues}
        projectId={props.projectId}
        setLogData={props.setLogData}
        orderColumn={sorting.column || ""}
        order={sorting.order === "desc" ? "asc" : "desc" || ""}
        selectedLogData={props.selectedLogData}
        listId={props.listId}
        setSelectedLogData={props.setSelectedLogData}
        qaDashboard={props?.qaDashboard}
        setTotalCount={setTotalCount}
        page={props?.page}
        rowsPerPage={props?.rowsPerPage}
      />
      {errorMessage && (
        <div className="nologs-wrapper d-flex align-items-center justify-content-center w-100">
          <span className="d-flex align-items-center justify-content-center">
            {errorMessage}
          </span>
        </div>
      )}
    </div>
  );
}
