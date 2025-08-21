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
import ClassificationChip from "./ClassificationChip";
import DocumentDeletedModal from "../ProjectLogs/DocumentDeletedModal";
export default function FullSpecLog(props) {
  const {
    specItemData,
    newRowIndex,
    filterValues,
    setFilterValues,
    setTotalCount,
    errorMessage,
    setNewRowIndex,
    rowData,
    setRowData,
    applyFilters,
    fetchSpecItemData,
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
  const [showDocumentDeletedModal, setShowDocumentDeletedModal] = useState(false);
  const rowRefs = useRef([]);
  const logRowRefs = useRef([]);
  const stickyHeaderRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    setShowMore(Array(props.specItemData.length).fill(false));
  }, [props.specItemData]);

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
  }, [rowRefs, props.specItemData]);


  const handleSorting = async (columnName) => {
    let sortingOrder = sorting.column === columnName ? sorting.order : "desc";
    try {
      props.fetchSpecItemData(
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
    // Check if the document has been deleted (empty pdfUrl)
    if (!pdfUrl || pdfUrl === "") {
      setShowDocumentDeletedModal(true);
      return;
    }

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

  const tableRef = useRef(null);
  const parentRef = useRef(null);
  const [tableWidths, setTableWidths] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const minWidths = {
    1: 100,
    2: 805,
    3: 190,
    4: 190,
  };
  useEffect(() => {
    if (parentRef.current !== null) {
      setTableWidths({
        1: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.05),
          minWidths[1]
        ),
        2: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.75),
          minWidths[2]
        ),
        3: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.1),
          minWidths[3]
        ),
        4: Math.max(
          Math.round(parentRef.current.offsetWidth * 0.1),
          minWidths[4]
        ),
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
            <th
              className="text-center small-font"
              style={{ width: `${tableWidths[1]}px` }}
            >
              <div className="d-flex">
                <span className="w-100">Actions</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 0)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="text-center small-font"
              style={{ width: `${tableWidths[1]}px` }}
            >
              <div className="d-flex">
                <span className="w-100">Spec Section</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 0)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="text-center small-font"
              style={{ width: `${tableWidths[1]}px` }}
            >
              <div className="d-flex">
                <span className="w-100">Section Title</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 0)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="text-center small-font"
              style={{ width: `${tableWidths[1]}px` }}
            >
              <div className="d-flex">
                <span className="w-100">Part</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 0)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="text-center small-font"
              style={{ width: `${tableWidths[1]}px` }}
            >
              <div className="d-flex">
                <span className="w-100">Paragraph Number</span>
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 0)}
                >
                  |
                </div>
              </div>
            </th>
            <th
              className="small-font"
              style={{ width: `${tableWidths[3]}px` }}
            >
              <span className="has-sorting">
                <div className="d-flex">
                  Topic{" "}
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 2)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>
            <th className="small-font" style={{ width: `${tableWidths[4]}px` }}>
              <span className="has-sorting">
                <div className="d-flex">
                  Item
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 3)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>
            <th
              className="log-description small-font"
              style={{ width: `${tableWidths[2]}px` }}
            >
              <span className="has-sorting">
                <div className="d-flex">
                  Item Text{" "}
                  <div
                    className="resizer"
                    onMouseDown={(e) => handleMouseDown(e, 1)}
                  >
                    |
                  </div>
                </div>
              </span>
            </th>
          </tr>
        </thead>
        <tbody style={{ fontSize: "12px" }}>
          {specItemData.map((log, index) => {
            let pdfIndex = props.pdfData?.index;
            console.log("row:", log);
            const showPdf = !(pdfIndex && pdfIndex !== index) && pdfIndex !== 0;
            return (
              <tr
                className={
                  log.user_id !== 1 || index % 2 !== 0 ? 'highlight-row' : ''
                }
                style={{
                  lineHeight: 1.2,
                  backgroundColor: pdfIndex === index ? '#f8f8fa' : 'white',
                  height: '35px',
                }}
                key={index}
                ref={(el) => (logRowRefs.current[index] = el)}
              >
                <td
                  className={`reduce-height actions-td padding-0`}
                  onClick={handleIgnorePdfView}
                >
                  <div className="action-items">
                    {
                      <>
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
                                  log.document_section_link,
                                  log.text_location,
                                  index,
                                  log.document.document_id,
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
                  {log.spec_section ?? ""}
                </td>

                <td
                  className={`reduce-height`}
                >
                  {log.section_title ?? ""}
                </td>
                <td
                  className={`reduce-height`}
                >
                  {log.spec_section_part ?? ""}
                </td>
                <td
                  className={`reduce-height`}
                >
                  {log.paragraph_number ?? ""}
                </td>
                <td
                  className={`reduce-height`}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {log.topic ? log.topic.map((topic, index) => (
                      <ClassificationChip index={index} classification={topic} />
                    )) : ""}
                  </div>
                </td>
                <td
                  className={`reduce-height`}
                >
                  {log.item_type ? log.item_type.map((itemType, index) => (
                      <ClassificationChip index={index} classification={itemType} />
                    )) : ""}
                </td>
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
                      {log['item_content'] ?? ""}
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
        setSpecItemData={props.setSpecItemData}
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
      <DocumentDeletedModal
        isOpen={showDocumentDeletedModal}
        toggle={() => setShowDocumentDeletedModal(false)}
      />
    </div>
  );
}
