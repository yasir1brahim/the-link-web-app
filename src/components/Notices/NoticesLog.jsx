// import moment from 'moment';
import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
// import DateSelector from '../shared/DateSelector/DateSelector';
// import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { FilterTable } from "../ProjectLogs/filterTable";
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

export default function NoticesLog(props) {
  const {
    noticesData,
    newRowIndex,
    filterValues,
    setFilterValues,
    setTotalCount,
    errorMessage,
    setNewRowIndex,
    rowData,
    setRowData,
    applyFilters,
    fetchNoticesData,
  } = props;
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
    setShowMore(Array(props.noticesData.length).fill(false));
  }, [props.noticesData]);

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
  }, [rowRefs, props.noticesData]);

  const handleEditToggle = (log, index) => {
    setRowData(log);
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

      if (newRowIndex) {
        await addSubmittalItem(
          props.projectId,
          rowData.spec_section, 
          rowData.para_no, 
          rowData.para_context, 
          rowData.item_desc, 
          rowData.type, 
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
        );
      }
      setNewRowIndex(null);
      props.setPageRefresh(!props.pageRefresh);
      props.setLogInViewer(null);
      props.setPdfData({
        url: "",
        textLoc: {},
        index: "",
        docId: null,
        submittalId: null,
        additionalTextLocations: [],
      });
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
      props.fetchNoticesData(
        props.page,
        props.rowsPerPage,
        props.searchValue,
        props.listId,
        filterValues,
        columnName,
        sortingOrder === "desc" ? "asc" : "desc"
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
  });

  const minWidths = {
    1: 105,
    2: 145,
    3: 150,
    4: 85,
    5: 190,
    6: 190,
    7: 520,
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
          minWidths[3]
        ),
        3: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.045),
          minWidths[4]
        ),
        4: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.045),
          minWidths[5]
        ),
        5: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.1),
          minWidths[6]
        ),
        6: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.1),
          minWidths[7]
        ),
        7: parentRef.current.offsetWidth - 993,
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
    return specSection.slice(0, 2) + " " + specSection.slice(2, 4) + " " + specSection.slice(4);
  };

  const formatParagraphNumber = (listOfParagraphElements) => {
    var formattedNumber = "";
    for (const element of listOfParagraphElements) {
      formattedNumber += element;
      if (element.slice(-1) !== ".") {
        formattedNumber += ".";
      }
    }
    return formattedNumber;
  };

  const formatDiscriminators = (listOfDiscriminators) => {
    return listOfDiscriminators.join(", ");
  };

  const formatNoticeText = (noticeLines) => {
    const texts = noticeLines.map((line) => line.text);
    return texts.join(" ");
  }

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

            <th className="small-font" style={{ width: `${tableWidths[2]}px` }}>
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
              style={{ width: `${tableWidths[3]}px` }}
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
              style={{ width: `${tableWidths[4]}px` }}
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
              style={{ width: `${tableWidths[5]}px` }}
            >
              <span className="has-sorting">
                <div className="d-flex">
                  Notice Type{" "}
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
            <th className="small-font" style={{ width: `${tableWidths[6]}px` }}>
              <span className="has-sorting">
                <div className="d-flex">
                  Highlights
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
              style={{ width: `${tableWidths[7]}px` }}
            >
              <span className="has-sorting">
                <div className="d-flex">
                  Notice Text{" "}
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
          {noticesData.map((log, index) => {
            let pdfIndex = props.pdfData?.index;
            const showPdf = !(pdfIndex && pdfIndex !== index) && pdfIndex !== 0;
            return (
              <tr
                className={
                  log.user_id !== 1 || index % 2 !== 0 ? 'highlight-row' : ''
                }
                style={{
                  lineHeight: 1.2,
                  backgroundColor: pdfIndex === index ? '#f8f8fa' : 'white',
                }}
                key={index}
                ref={(el) => (logRowRefs.current[index] = el)}
              >
                <td
                  className={`ticket-checkbox reduce-height`}
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
                  className={`reduce-height actions-td padding-0`}
                  onClick={handleIgnorePdfView}
                >
                  <div className="action-items">
                    {
                      <>
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
                                  props.setNoticesData(
                                    deleteElement(props.noticesData, index)
                                  );
                                newRowIndex === index + 1 &&
                                  props.setNoticesData(
                                    deleteElement(props.noticesData, index)
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
                        {pdfIndex === index ? (
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

                        {log.parsing_method === 'AI_SUBMITTAL' && <Sparkles />}
                      </>
                    }
                  </div>
                </td>

                <td
                  className={`reduce-height`}
                >
                  {formatSpecSection(log.spec_section ?? "")}
                </td>
                <td
                  className={`reduce-height`}
                >
                  {log.section_title ?? ""}
                </td>
                <td
                  className={`reduce-height`}
                >
                  {formatParagraphNumber(log['excerpt_anchors'][0]['anchor'] ?? [])}
                </td>
                <td
                  className={`reduce-height`}
                >
                  {log.notice_type ?? ""}
                </td>
                <td
                  className={`reduce-height`}
                >
                  {log.highlight_heuristic_match ? log.highlight_heuristic_match : formatDiscriminators(log.highlight_discriminators)}
                </td>
                <>
                  <td
                    className={`reduce-height`}
                  >
                      <div
                        className={
                          'log-desc ' +
                          (showMore[index] ? 'show-content' : 'text-overflow')
                        }
                        ref={(element) => rowRefs.current.push(element)}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {formatNoticeText(log['excerpt_anchors'][0]['lines'] ?? [])}
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
        setNoticesData={props.setNoticesData}
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
