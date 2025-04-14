// import moment from 'moment';
import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
// import DateSelector from '../shared/DateSelector/DateSelector';
// import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { toast } from "react-toastify";
import { FilterTable } from "./filterTable";
import { ReactComponent as EditButton } from "../../assets/images/edit-button.svg";
import { ReactComponent as AddButton } from "../../assets/images/circle-add.svg";
import { ReactComponent as PdfButton } from "../../assets/images/file-pdf.svg";
import { ReactComponent as SaveButton } from "../../assets/images/label-approve.svg";
import { ReactComponent as CancelButton } from "../../assets/images/label-reject.svg";
import { ReactComponent as ExpandButton } from "../../assets/images/down-arrow.svg";
import { ReactComponent as CollapseButton } from "../../assets/images/up-arrow.svg";
import { ReactComponent as Sparkles } from "../../assets/images/sparkles.svg";
import { Tooltip } from "@mui/material";
import handleError from "../../config/errorHandler";
import { SortIcon } from "../shared/icons/sortIcon";
import { FilterIcon } from "../shared/icons/filterIcon";
import { useRef } from "react";
import { updateSubmittalItem, addSubmittalItem } from "../../api/ProjectLogs/api";

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
    setRowData,
    loading,
    applyFilters,
    isCombining,
    setIsCombining,
    combiningQueue,
    combiningResult,
    setCombiningResult,
    areSameValues,
  } = props;
  // const [dateIssued, setDateIssued] = useState('');
  // const [dateApproved, setDateApproved] = useState('');
  // const [statusValue, setStatus] = useState({});
  // const [groupingValue, setGroupingValue] = useState({});
  // const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState({ column: "", order: "desc" });
  const [filterModal, setFilterModal] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");

  // const navigate = useNavigate();

  const [formValid, setFormValid] = useState({
    spec_section: true,
    para_no: true,
    para_context: true,
    type: true,
    item_desc: true,
  });

  const [showMore, setShowMore] = useState([]);
  const [shouldShowExpansionButton, setShouldShowExpansionButton] = useState(
    []
  );
  const rowRefs = useRef([]);
  const logRowRefs = useRef([]);
  const stickyHeaderRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    setShowMore(Array(props.logData.length).fill(false));
  }, [props.logData]);

  useEffect(() => {
    const hasClamping = (el) => {
      const { clientHeight, scrollHeight, textContent } = el;
      // console.log(clientHeight, scrollHeight, textContent);
      return clientHeight !== scrollHeight;
    };

    const checkButtonAvailability = () => {
      const newShowExpansionButton = [];
      for (let i = 0; i < rowRefs.current.length; i++) {
        if (rowRefs.current[i]) {
          // Save current state to reapply later if necessary.
          const hadTextOverflowClass =
            rowRefs.current[i].classList.contains("text-overflow");
          // Make sure that CSS clamping is applied if applicable.
          if (!hadTextOverflowClass)
            rowRefs.current[i].classList.add("text-overflow");
          // Check for clamping and show or hide button accordingly.
          newShowExpansionButton.push(hasClamping(rowRefs.current[i]));
          // Sync clamping with local state.
          if (!hadTextOverflowClass)
            rowRefs.current[i].classList.remove("text-overflow");
        }
      }
      setShouldShowExpansionButton(newShowExpansionButton);
    };

    // const debouncedCheck = lodash.debounce(checkButtonAvailability, 50);

    checkButtonAvailability();
    // window.addEventListener("resize", debouncedCheck);

    // return () => {
    //   window.removeEventListener("resize", debouncedCheck);
    // };
  }, [rowRefs, props.logData]);

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
      if (
        rowData.spec_section === "" ||
        rowData.para_no === "" ||
        rowData.para_context === "" ||
        rowData.type === "" ||
        rowData.item_desc === ""
      ) {
        setFormValid({
          ...formValid,
          spec_section: rowData.spec_section === "" ? false : true,
          para_no: rowData.para_no === "" ? false : true,
          para_context: rowData.para_context === "" ? false : true,
          type: rowData.type === "" ? false : true,
          item_desc: rowData.item_desc === "" ? false : true,
        });
        return;
      }

      setEditRow("");
      if (newRowIndex) {
        console.log("rowData", rowData);
        await addSubmittalItem(
          props.projectId,
          rowData.spec_section, 
          rowData.para_no, 
          rowData.para_context, 
          rowData.item_desc, 
          rowData.type, 
          rowData.added_under_submittal_id,
          props.projectVersionId
        );
      } else {
        await updateSubmittalItem(
          props.projectId,
          rowData.id, 
          rowData.spec_section, 
          rowData.para_no, 
          rowData.para_context, 
          rowData.item_desc, 
          rowData.type, 
          props.projectVersionId
        );
      }
      setNewRowIndex(null);
      props.fetchLogData(
        props.page,
        props.rowsPerPage,
        props.searchValue,
        props.listId,
        null,
        null,
        null,
        props.projectVersionId
      );
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
    try {
      props.fetchLogData(
        props.page,
        props.rowsPerPage,
        props.searchValue,
        props.listId,
        filterValues,
        columnName,
        sortingOrder === "desc" ? "asc" : "desc",
        props.projectVersionId
      );
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

  const handleIgnorePdfView = (e)=>{
    e.stopPropagation();
  }

  const handleViewPdf = (
    pdfUrl,
    textLocation,
    rowIndex,
    docId,
    submittalId,
    additionalTextLocations
  ) => {
    props.setPdfData({
      ...props.pdfData,
      url: pdfUrl,
      textLoc: textLocation,
      index: rowIndex,
      docId: docId,
      submittalId: submittalId,
      additionalTextLocations: additionalTextLocations,
    });
    props.setSubmittalIdParam(submittalId);
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
            dashIndex !== -1 ? log.para_no.slice(0, dashIndex) : log.para_no
          )
        );
      //Now we are making an array containing the ascii character values of elements after '-' in paraNos
      const charArray = paraNos.map((paraNo) =>
        paraNo.search("-") !== -1
          ? paraNo.codePointAt(paraNo.search("-") + 1)
          : 96
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
                Math.max(...charArray) + 1
              )}`,
        // customer_id: props.customerId, user_id: localStorage.getItem('userId'), para_context: ''
        submittal_number: null,

        // Only used to help BE determine what to do when inserted
        added_under_submittal_id: log.id,
      };
      const result = insertElement(props.logData, index + 1, logObj);
      props.setFilteredLogData(result);

      setNewRowIndex(index + 1);
      handleEditToggle(logObj, index + 1);
      if (props.pdfData?.url) {
        let docElement = document.getElementsByClassName("l-table-wrapper");
        docElement[0].scrollTo(890, 0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message, {
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
  useEffect(() => {
    setEditRow("");
  }, [props.searchValue]);

  const tableRef = useRef(null);
  const parentRef = useRef(null);
  const [tableWidths, setTableWidths] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  });

  const minWidths = {
    1: 105,
    2: 85,
    3: 145,
    4: 150,
    5: 85,
    6: 190,
    7: 190,
    8: 520,
  };
  useEffect(() => {
    if (parentRef.current !== null) {
      setTableWidths({
        1: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.06),
          minWidths[1]
        ),
        2: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.045),
          minWidths[2]
        ),
        3: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.045),
          minWidths[3]
        ),
        4: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.045),
          minWidths[4]
        ),
        5: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.045),
          minWidths[5]
        ),
        6: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.1),
          minWidths[6]
        ),
        7: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.1),
          minWidths[7]
        ),
        8: parentRef.current.offsetWidth - 993,
      });
    }
  }, [parentRef.current]);

  const handleMouseDown = (e, colIndex) => {
    const startX = e.clientX;
    const startWidth =
      tableRef.current.querySelectorAll("th")[colIndex].offsetWidth;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(
        startWidth + (e.clientX - startX),
        minWidths[colIndex]
      );
      tableRef.current.querySelectorAll("th")[
        colIndex
      ].style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const formatSpecSection = (specSection) => {
    if (typeof specSection !== "string") return specSection;
    const fiveOrSixDigitString = specSection.slice(0, 2) + " " + specSection.slice(2, 4) + " " + specSection.slice(4);
    if (specSection.length > 6) {
      return fiveOrSixDigitString + "." + specSection.slice(6);
    }
    return fiveOrSixDigitString;
  };

  const formatSubmittalNumber = (number) => {
    const nonNullNumber = number ?? "";
    const str = nonNullNumber.toString();
    return str.endsWith('.0') ? str.slice(0, -2) : str;
  };

  useEffect(() => {
    if (logRowRefs.current[props.pdfData.index]) {
      const rowElement = logRowRefs.current[props.pdfData.index];
      const containerElement = parentRef.current;
      const stickyHeaderHeight = stickyHeaderRef.current?.offsetHeight || 0; // Get sticky header height
      // Get the top position of the row relative to the container
      const rowTop = rowElement.offsetTop;
      // Scroll the container, adjusting for the sticky header
      containerElement.scrollTo({
        top: rowTop - stickyHeaderHeight, // Adjust by sticky header height
        behavior: 'smooth',
      });
    }
  }, [props.pdfData.index])
  return (
    <div
      className="l-table-wrapper"
      style={{
        maxHeight: "calc(100vh - 240px)",
      }}
      ref={parentRef}
    >
      <table className="table logs-table" ref={tableRef}>
        <thead>
          <tr ref={stickyHeaderRef}>
            <th className="ticket-checkbox small-font">
              <div className="form-group">
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    name="ticketHeading"
                    id="ticketHeading"
                    onChange={props.handleSelectAll}
                    checked={props.isSelectAll}
                    disabled={isCombining}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="ticketHeading"
                  ></label>
                </div>
              </div>
            </th>

            <th
              className="text-center small-font"
              style={{ width: `${tableWidths[1]}px` }}
            >
              <div className="d-flex">
                <span className="w-100">Actions</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 1)}
                >
                  |
                </div>
              </div>
            </th>

            <th
              className="para-no small-font"
              style={{ width: `${tableWidths[2]}px` }}
            >
              <div className="d-flex">
                <span>Submittal #</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 2)}
                >
                  |
                </div>
              </div>
            </th>

            <th className="small-font" style={{ width: `${tableWidths[3]}px` }}>
              <span className="has-sorting">
                <div className="d-flex">
                  Spec Section{" "}
                  <span
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => handleSorting("spec_section")}
                  >
                    <SortIcon />
                  </span>
                  <span
                    className="ml-1"
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("spec_section");
                    }}
                  >
                    <FilterIcon
                      isActive={
                        filterValues.spec_section.length > 0 ? true : false
                      }
                    />
                  </span>
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 2)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>
            <th
              className="para-no small-font"
              style={{ width: `${tableWidths[4]}px` }}
            >
              <div className="d-flex">
                <span>Section Title</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 3)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="para-no small-font"
              style={{ width: `${tableWidths[5]}px` }}
            >
              <div className="d-flex">
                <span>Paragraph</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 4)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="small-font"
              style={{ width: `${tableWidths[6]}px` }}
            >
              <span className="has-sorting">
                <div className="d-flex">
                  Submittal Type{" "}
                  <span
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => handleSorting("type")}
                  >
                    <SortIcon />
                  </span>
                  <span
                    className="ml-1"
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("type");
                    }}
                  >
                    <FilterIcon
                      isActive={filterValues.type.length > 0 ? true : false}
                    />
                  </span>
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 5)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>
            <th className="small-font" style={{ width: `${tableWidths[7]}px` }}>
              <span className="has-sorting">
                <div className="d-flex">
                  Submittal Title
                  <span
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => handleSorting("item_desc")}
                  >
                    <SortIcon />
                  </span>
                  <span
                    className="ml-1"
                    onClick={() => {
                      setFilterModal(true);
                      setFilterColumn("item_desc");
                    }}
                  >
                    <FilterIcon
                      isActive={
                        filterValues.item_desc.length > 0 ? true : false
                      }
                    />
                  </span>
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 6)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>

            <th
              className="log-description small-font"
              style={{ width: `${tableWidths[8]}px` }}
            >
              <span className="has-sorting">
                <div className="d-flex">
                  Submittal Description{" "}
                  <span
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => handleSorting("para_context")}
                  >
                    <SortIcon />
                  </span>
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 7)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>
          </tr>
        </thead>
        <tbody style={{ fontSize: "12px" }}>
          {logData.map((log, index) => {
            let pdfIndex = props.pdfData?.index;
            const showPdf = !(pdfIndex && pdfIndex !== index) && pdfIndex !== 0;
            const isCombineTarget = combiningQueue[0]?.index === index;
            return (
              <tr
                className={
                  log.user_id !== 1 || index % 2 !== 0 ? 'highlight-row' : ''
                }
                style={{
                  lineHeight: 1.2,
                  backgroundColor: pdfIndex === index ? '#f8f8fa' : 'white',
                  // Adjust the row style when the row is being combined
                  ...(isCombining
                    ? {
                        opacity: props.selected.includes(log.id) ? null : 0.4,
                        backgroundColor: isCombineTarget ? '#f8f8fa' : 'white',
                        textDecoration:
                          // Only mark selected items that are not the "main" row
                          combiningQueue.findIndex((item) => item.index === index) > 0
                            ? 'line-through'
                            : null
                      }
                    : {})
                }}
                key={index}
                ref={(el) => (logRowRefs.current[index] = el)}
              >
                <td
                  className={`${
                    editRow === index ? 'activeTh' : ''
                  } ticket-checkbox reduce-height`}
                  onClick={handleIgnorePdfView}
                >
                  <div className="form-group">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        name={`ticketRow-${index}`}
                        id={`ticketRow-${index}`}
                        checked={
                          !!props.selected
                            ? props.selected?.includes(log.id)
                            : false
                        }
                        onChange={() => props?.handleSelect(log.id)}
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
                    editRow === index ? 'activeTh' : ''
                  } reduce-height actions-td padding-0`}
                  onClick={handleIgnorePdfView}
                >
                  <div className="action-items">
                    {
                      <>
                        {isCombining ? (
                          isCombineTarget && (combiningQueue.length > 1) && (
                            // If the row is being combined
                            <>
                              <div
                                onClick={() => props.handleCombineRows()}
                                style={{
                                  marginRight: '5px',
                                  cursor: 'pointer'
                                }}
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
                                style={{
                                  marginRight: '5px',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setIsCombining(false)}
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
                          )
                        ) : editRow === index ? (
                          // If the row is being edited
                          <>
                            <div
                              onClick={() => handleUpdateLog()}
                              style={{ marginRight: '5px', cursor: 'pointer' }}
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
                              style={{ marginRight: '5px', cursor: 'pointer' }}
                              onClick={() => {
                                setEditRow('');
                                setFormValid({
                                  spec_section: true,
                                  para_no: true,
                                  para_context: true,
                                  type: true,
                                  item_desc: true
                                });
                                setRowData({
                                  comments: '',
                                  date_approved: '',
                                  date_issued: '',
                                  // id: 1,
                                  item_desc: '',
                                  package: '',
                                  para_context: '',
                                  para_no: '',
                                  project_id: '',
                                  spec_section: '',
                                  status: '',
                                  type: ''
                                });
                                // setDateApproved('');
                                // setDateIssued('');
                                // setStatus({});
                                setNewRowIndex(null);
                                newRowIndex === index &&
                                  props.setLogData(
                                    deleteElement(props.logData, index)
                                  );
                                newRowIndex === index + 1 &&
                                  props.setLogData(
                                    deleteElement(props.logData, index)
                                  );
                                newRowIndex === index + 1 &&
                                  props.setPdfData({
                                    ...props.pdfData,
                                    index: props.pdfData?.index - 1
                                  });
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
                          // If the row is not being edited
                          <>
                            <Tooltip title={!isCombining
                              ? 'Edit Row'
                              : 'Cannot edit while combining'} arrow>
                              <span
                                onClick={() => !isCombining && handleEditToggle(log, index)}
                                style={{ cursor: "pointer" }}
                              >
                                <svg
                                  id={"Edit-Tooltip-" + index + 1}
                                  width="16"
                                  height="16"
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
                            </Tooltip>
                          </>
                        )}
                        {pdfIndex === index && !isCombining ? (
                          <div
                            onClick={() => {
                              props.setLogInViewer(null);
                              props.setPdfData({
                                url: "",
                                textLoc: {},
                                index: "",
                                docId: null,
                                submittalId: null,
                                additionalTextLocations: [],
                              });
                              props.setSubmittalIdParam(null);
                            }}
                            style={{ cursor: "pointer" }}
                            className="pdf-button"
                          >
                            <Tooltip title="Close Pdf" arrow>
                              <svg id={"Pdf-Tooltip-" + index + 1} width="18px" height="18px" viewBox="0 0 1.08 1.08" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path width="48" height="48" fill="white" fill-opacity="0.01" d="M0 0H1.08V1.08H0V0z"/>
                                <path d="M1.08 0H0v1.08h1.08z" fill="white" fill-opacity="0.01"/>
                                <path d="M0.225 0.09h0.45l0.225 0.225v0.63a0.045 0.045 0 0 1 -0.045 0.045H0.225a0.045 0.045 0 0 1 -0.045 -0.045V0.135a0.045 0.045 0 0 1 0.045 -0.045Z" fill="#36454F" stroke="#000000" stroke-width="0.09" stroke-linejoin="round"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.405 0.405h0.27v0.18L0.405 0.585z" stroke="white" stroke-width="0.09" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M0.405 0.405v0.36" stroke="white" stroke-width="0.07" stroke-linecap="round"/>
                              </svg>
                            </Tooltip>
                          </div>
                        ) : (
                          newRowIndex !== index &&
                          !isCombining &&
                          showPdf && (
                            <span
                              onClick={() => {
                                handleViewPdf(
                                  log.doc_link,
                                  log.text_loc,
                                  index,
                                  log.doc_id,
                                  log.id,
                                  log.additional_text_locations,
                                );
                                props.setLogInViewer(log);
                              }}
                              style={{ cursor: "pointer" }}
                              className="pdf-button"
                            >
                              <Tooltip title="View Pdf" arrow>
                                <svg id={"Pdf-Tooltip-" + index + 1} width="18px" height="18px" viewBox="0 0 1.08 1.08" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path width="48" height="48" fill="white" fill-opacity="0.01" d="M0 0H1.08V1.08H0V0z"/>
                                  <path d="M1.08 0H0v1.08h1.08z" fill="white" fill-opacity="0.01"/>
                                  <path d="M0.225 0.09h0.45l0.225 0.225v0.63a0.045 0.045 0 0 1 -0.045 0.045H0.225a0.045 0.045 0 0 1 -0.045 -0.045V0.135a0.045 0.045 0 0 1 0.045 -0.045Z" fill="white" stroke="#000000" stroke-width="0.07" stroke-linejoin="round"/>
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0.405 0.405h0.27v0.18L0.405 0.585z" stroke="#36454F" stroke-width="0.09" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M0.405 0.405v0.36" stroke="#36454F" stroke-width="0.09" stroke-linecap="round"/>
                                </svg>
                              </Tooltip>
                            </span>
                          )
                        )}
                        {props.listId === null && editRow === "" && !isCombining && (
                          <Tooltip title={isCombining
                            ? 'Cannot add new row while combining rows'
                            : 'Add Row Below'} arrow>
                            <AddButton
                              onClick={() => {
                                if (isCombining) return;
                                if (!newRowIndex) {
                                  handleAddRow(log);
                                }
                              }}
                              id={"Tooltip-" + index + 1}
                            />
                          </Tooltip>
                        )}

                        {log.parsing_method === 'AI_SUBMITTAL' && <Sparkles />}
                      </>
                    }
                  </div>
                </td>

                <td
                  className={`${
                    editRow === index ? 'activeTh' : ''
                  } reduce-height`}
                >
                  {formatSubmittalNumber(log.submittal_number)}
                </td>

                <td
                  className={`${
                    editRow === index ? 'activeTh' : ''
                  } reduce-height`}
                  style={{
                    fontWeight: `${log.parsing_method === 'PLACEHOLDER' ? 'bold' : 'normal'}`
                  }}
                >
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className={`form-control ${
                        formValid.spec_section ? '' : 'form-required'
                      }`}
                      type="text"
                      value={rowData.spec_section}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, spec_section: e.target.value })
                      }
                    />
                  ) : (
                    formatSpecSection(log.spec_section)
                    + (isCombining &&
                       isCombineTarget &&
                       !areSameValues('spec_section')
                      ? '+' : ''
                    )
                  )}
                </td>
                <td
                  className={`${
                    editRow === index ? 'activeTh' : ''
                  } reduce-height`}
                >
                  {log.section_title}
                </td>
                <td
                  className={`${
                    editRow === index ? 'activeTh' : ''
                  } reduce-height`}
                >
                  {editRow === index ? (
                    <input
                      placeholder="Enter"
                      className={`form-control ${
                        formValid.para_no ? '' : 'form-required'
                      }`}
                      type="text"
                      value={rowData.para_no}
                      // style={{ border: 'none' }}
                      onChange={(e) =>
                        setRowData({ ...rowData, para_no: e.target.value })
                      }
                    />
                  ) : (
                    log.para_no
                    + (isCombining &&
                        isCombineTarget &&
                        combiningQueue.length > 1
                      ? '+' : ''
                    )
                  )}
                </td>
                <td
                  className={`${
                    editRow === index ? 'activeTh' : ''
                  } reduce-height`}
                >
                  {isCombining && isCombineTarget ? (
                    // Combining rows with different spec section values
                    <>
                      <input
                        placeholder="Enter"
                        type="text"
                        value={combiningResult.type}
                        className="form-control"
                        onChange={(e) =>
                          setCombiningResult((value) => {
                            return { ...value, type: e.target.value };
                          })
                        }
                      />
                    </>
                  ) : editRow === index ? (
                    <input
                      placeholder="Enter"
                      className={`form-control ${
                        formValid.type ? '' : 'form-required'
                      }`}
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
                <td
                  className={`reduce-height ${
                    editRow === index ? 'activeTh' : ''
                  }`}
                >
                  {isCombining && isCombineTarget ? (
                    // Combining rows with different spec section values
                    <>
                      <input
                        placeholder="Enter"
                        type="text"
                        value={combiningResult.item_desc}
                        className="form-control"
                        onChange={(e) =>
                          setCombiningResult((value) => {
                            return { ...value, item_desc: e.target.value };
                          })
                        }
                      />
                    </>
                  ) : editRow === index ? (
                    <input
                      placeholder="Enter"
                      className={`form-control ${
                        formValid.item_desc ? '' : 'form-required'
                      }`}
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
                <>
                  <td
                    className={`${
                      editRow === index ? 'activeTh' : ''
                    } reduce-height`}
                    style={{
                      fontWeight: `${log.parsing_method === 'PLACEHOLDER' ? 'bold' : 'normal'}`
                    }}
                  >
                    {isCombining && isCombineTarget ? (
                      <div
                        className={
                          'log-desc ' +
                          (
                            isCombineTarget
                              ? 'show-content'
                              : showMore[index]
                                ? 'show-content'
                                : 'text-overflow'
                          )
                        }
                        style={{ whiteSpace: 'pre-wrap' }}
                        ref={(element) => rowRefs.current.push(element)}
                      >
                        {combiningResult.para_context}
                        {shouldShowExpansionButton[index] && (
                          <span
                            className="showmore-wrap"
                            onClick={() =>
                              setShowMore(
                                showMore.with(index, !showMore[index])
                              )
                            }
                          >
                            {showMore[index] ? (
                              <CollapseButton />
                            ) : (
                              <ExpandButton />
                            )}
                          </span>
                        )}
                      </div>
                    ) : editRow === index ? (
                      <input
                        placeholder="Enter"
                        className={`form-control ${
                          formValid.para_context ? '' : 'form-required'
                        }`}
                        type="text"
                        value={rowData.para_context}
                        // style={{ border: 'none' }}
                        onChange={(e) =>
                          setRowData({
                            ...rowData,
                            para_context: e.target.value
                          })
                        }
                      />
                    ) : editRow === index ? (
                      <input
                        placeholder="Enter"
                        className={`form-control ${
                          formValid.para_context ? '' : 'form-required'
                        }`}
                        type="text"
                        value={rowData.para_context}
                        // style={{ border: 'none' }}
                        onChange={(e) =>
                          setRowData({
                            ...rowData,
                            para_context: e.target.value
                          })
                        }
                      />
                    ) : (
                      <div
                        className={
                          'log-desc ' +
                          (showMore[index] ? 'show-content' : 'text-overflow')
                        }
                        ref={(element) => rowRefs.current.push(element)}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {log.para_context}
                        {shouldShowExpansionButton[index] && (
                          <span
                            className="showmore-wrap"
                            onClick={() =>
                              setShowMore(
                                showMore.with(index, !showMore[index])
                              )
                            }
                          >
                            {showMore[index] ? (
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
        listId={props.listId}
        qaDashboard={props?.qaDashboard}
        setTotalCount={setTotalCount}
        page={props?.page}
        rowsPerPage={props?.rowsPerPage}
        setLogIdList={props?.setLogIdList}
        setSelected={props?.setSelected}
        applyFilters={applyFilters}
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
