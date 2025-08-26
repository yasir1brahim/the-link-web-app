/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";
import axiosInstance from "../../config/axios";
import { validateS3Link, isS3LinkExpiredError } from "../../utils/s3LinkValidator.js";
import { useS3LinkValidation } from "../../hooks/useS3LinkValidation.js";

const ProjectLogsReader = ({
  url,
  textLoc,
  docId,
  additionalTextLocations,
  setPdfData,
  setSubmittalIdParam,
  handleAddNewRow,
  handleAppendToSelectedRow,
  setLogInViewer,
  loading,
  setLoading,
  onError,
}) => {
  const [webViewer, setWebViewer] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const { handleError, ErrorModal } = useS3LinkValidation();

  useEffect(() => {
    if (url) {
      (async () => {
        // Clean up existing PDF viewer
        const pdfViewer = document.getElementById("pdf-div");
        if (pdfViewer) {
          pdfViewer.innerHTML = '';
        }

        setCurrentUrl(url);
        await loadPDF();
      })();
    }
  }, [url]);

  useEffect(() => {
    if (url === currentUrl && webViewer) {
      updateTxtView();
    }
  }, [textLoc]);

  const handleClose = () => {
    setLogInViewer(null);
    setPdfData({
      url: "",
      textLoc: {},
      index: "",
      docId: null,
      submittalId: null,
      additionalTextLocations: [],
    });
    setSubmittalIdParam(null);
  };

  const handleDocumentLoaded = async (annotationManager) => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: "post",
        url: `/pdf/v2/getMetadata`,
        data: {
          doc_id: docId,
        },
      });
      if (response.status === 200) {
        response.data.data?.map(async (item) => {
          const annotations = await annotationManager.importAnnotationCommand(
            item.xfdf_string
          );
          annotations.forEach((annotation) => {
            annotationManager.redrawAnnotation(annotation);
          });
        });
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  };

  const updateTxtView = (_webViewer) => {
    let tmpViewer = _webViewer ?? webViewer;

    tmpViewer.Core.annotationManager.deleteAnnotations(annotations);

    if (tmpViewer && textLoc?.page_no && textLoc?.x && textLoc?.y) {
      tmpViewer.Core.documentViewer.displayPageLocation(
        textLoc?.page_no,
        textLoc?.x,
        textLoc?.y
      );

      // Add rectangular highlight
      const annotationManager = tmpViewer.Core.annotationManager;
      const Annotations = tmpViewer.Core.Annotations;
      const _annotations = [];
      const rectangleAnnot = new Annotations.RectangleAnnotation({
        PageNumber: textLoc?.page_no,
        X: textLoc?.x,
        Y: textLoc?.y,
        Width: textLoc?.width ?? 10000,
        Height: textLoc?.height ?? 30,
        Color: new Annotations.Color(213, 231, 62, 0.25),
        FillColor: new Annotations.Color(213, 231, 62, 0.25),
      });
      _annotations.push(rectangleAnnot);
      annotationManager.addAnnotation(rectangleAnnot);
      annotationManager.redrawAnnotation(rectangleAnnot);

      for (let i = 0; i < additionalTextLocations?.length; i++) {
        const additionalTextLocation = additionalTextLocations[i];
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: additionalTextLocation?.page_no,
          X: additionalTextLocation?.x,
          Y: additionalTextLocation?.y,
          Width: additionalTextLocation?.width,
          Height: additionalTextLocation?.height,
          Color: new Annotations.Color(213, 231, 62, 0),
          FillColor: new Annotations.Color(213, 231, 62, 0.25),
        });
        _annotations.push(rectangleAnnot);
        annotationManager.addAnnotation(rectangleAnnot);
        annotationManager.redrawAnnotation(rectangleAnnot);
      }

      setAnnotations(_annotations);
    }
  };

  const loadPDF = async () => {
    // Simple S3 validation
    try {
      const isValid = await validateS3Link(url);
      if (!isValid) {
        handleError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        return;
      }
    } catch (error) {
      console.log('S3 validation failed, continuing with PDF load');
    }

    try {
      setLoading(true);
      
      const pdfViewer = document.getElementById("pdf-div");
      const newPdfViewer = document.createElement("div");
      newPdfViewer.style.height = "calc(100vh - 240px)";
      newPdfViewer.style.position = "relative";
      newPdfViewer.style.overflow = "hidden";
      newPdfViewer.style.width = "100%";

      const viewer = pdfViewer.appendChild(newPdfViewer);

      const _webViewer = await WebViewer(
        {
          path: "/webviewer/lib",
          licenseKey:
            "Thelinkai, Inc. (thelink.ai):PWS:Thelinkai::B+2:D0333312DD61815C33A681734AA1DD04DD5EB88FFD89F8DBFE1FBDE14C08D8EFE6EE4ED826BD",
          initialDoc: url,
          extension: "pdf",
          css: "./index.css",
        },
        viewer
      );
      setWebViewer(_webViewer);

      _webViewer.UI.enableFeatures([_webViewer.UI.Feature.InlineComment]);
      handleDocumentLoaded(_webViewer.Core.annotationManager);
      _webViewer.UI.setZoomLevel("100%");

      _webViewer.Core.documentViewer.addEventListener("documentLoaded", () => {
        updateTxtView(_webViewer);
        setLoading(false);
      });

      // Error handling
      _webViewer.Core.documentViewer.addEventListener("documentError", (error) => {
        if (isS3LinkExpiredError(error)) {
          handleError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        } else {
          handleError({ message: 'Unable to load the PDF document. Please try again.' });
        }
      });

      // UI Customization - Hide extra toolbar elements
      _webViewer.UI.disableElements([
        "downloadButton",
        "printButton",
        "viewControlsDivider2",
        "rotateHeader",
        "rotateCounterClockwiseButton",
        "rotateClockwiseButton",
        "toolbarGroup-View",
        "toolbarGroup-Shapes",
        "toolbarGroup-Edit",
        "toolbarGroup-FillAndSign",
        "toolbarGroup-Forms",
        "underlineToolGroupButton",
        "shapeToolGroupButton",
        "freeHandHighlightToolGroupButton",
        "freeHandToolGroupButton",
        "stickyToolGroupButton",
        "squigglyToolGroupButton",
        "strikeoutToolGroupButton",
        "toolbarGroup-Insert",
        "toolsHeader",
        "ribbons",
        "textUnderlineToolButton",
        "textSquigglyToolButton",
        "textStrikeoutToolButton",
        "linkButton",
        "toggleNotesButton",
      ]);

      // Custom close button
      const closeButton = () => {
        return (
          <div
            onClick={() => {
              setWebViewer(null);
              handleClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              columnGap: "5px",
              marginRight: "10px",
            }}
          >
            Close
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-xbox-x"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 21a9 9 0 0 0 9 -9a9 9 0 0 0 -9 -9a9 9 0 0 0 -9 9a9 9 0 0 0 9 9z" />
              <path d="M9 8l6 8" />
              <path d="M15 8l-6 8" />
            </svg>
          </div>
        );
      };

      const customCloseButton = {
        type: "customElement",
        render: closeButton,
      };

      const newDivider = {
        type: "divider",
        hidden: ["mobile"],
      };

      _webViewer.UI.setHeaderItems((header) => {
        header.push(newDivider);
      });

      _webViewer.UI.setHeaderItems((header) => {
        header.push(customCloseButton);
      });

      _webViewer.UI.disableElements(["textHighlightToolButton"]);
      _webViewer.UI.disableElements(["copyTextButton"]);

      // Custom context menu items
      const contextMenuItems = _webViewer.UI.textPopup.getItems();
      const lastItem = contextMenuItems[contextMenuItems.length - 1];
      _webViewer.UI.textPopup.add(
        {
          type: "actionButton",
          label: "Add New Row",
          img: `<svg
                width="20"
                height="20"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <g
                  transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path
                    d="M50 250 l0 -110 30 0 c29 0 30 -1 30 -52 0 -51 0 -51 -20 -33 -34 31 -36 6 -2 -28 l32 -32 32 32 c34 34 32 59 -2 28 -20 -18 -20 -18 -20 33 l0 52 80 0 c47 0 80 4 80 10 0 6 -43 10 -110 10 l-110 0 0 90 0 90 180 0 180 0 0 -65 c0 -37 4 -65 10 -65 6 0 10 32 10 75 l0 75 -200 0 -200 0 0 -110z"
                  />
                  <path
                    d="M351 186 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124 -149 87z m104 -31 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 70 86 105 135 55z"
                  />
                  <path
                    d="M390 135 c0 -20 -5 -25 -25 -25 -14 0 -25 -4 -25 -10 0 -5 11 -10 25 -10 20 0 25 -5 25 -25 0 -14 5 -25 10 -25 6 0 10 11 10 25 0 20 5 25 25 25 14 0 25 5 25 10 0 6 -11 10 -25 10 -20 0 -25 5 -25 25 0 14 -4 25 -10 25 -5 0 -10 -11 -10 -25z"
                  />
                </g>
              </svg>`,
          onClick: () =>
            handleAddNewRow(_webViewer.Core.documentViewer.getSelectedText()),
        },
        lastItem.dataElement
      );
      _webViewer.UI.textPopup.add(
        {
          type: "actionButton",
          label: "Append to Selected Row",
          img: `<svg
                width="20"
                height="20"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <g
                  transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path
                    d="M85 470 c-31 -33 -27 -54 5 -25 20 18 20 18 20 -33 0 -51 -1 -52 -30 -52 l-30 0 0 -110 0 -110 120 0 c73 0 120 4 120 10 0 6 -43 10 -110 10 l-110 0 0 90 0 90 180 0 180 0 0 -65 c0 -37 4 -65 10 -65 6 0 10 32 10 75 l0 75 -160 0 -160 0 0 52 c0 51 0 51 20 33 32 -29 36 -8 5 25 -16 17 -32 30 -35 30 -3 0 -19 -13 -35 -30z"
                  />
                  <path
                    d="M351 186 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124 -149 87z m104 -31 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 70 86 105 135 55z"
                  />
                  <path
                    d="M390 135 c0 -20 -5 -25 -25 -25 -14 0 -25 -4 -25 -10 0 -5 11 -10 25 -10 20 0 25 -5 25 -25 0 -14 5 -25 10 -25 6 0 10 11 10 25 0 20 5 25 25 25 14 0 25 5 25 10 0 6 -11 10 -25 10 -20 0 -25 5 -25 25 0 14 -4 25 -10 25 -5 0 -10 -11 -10 -25z"
                  />
                </g>
              </svg>`,
          onClick: () =>
            handleAppendToSelectedRow(
              _webViewer.Core.documentViewer.getSelectedText()
            ),
        },
        lastItem.dataElement
      );
    } catch (error) {
      setLoading(false);
      handleError({ message: 'Failed to load PDF viewer.' });
    }
  };

  return (
    <>
      <ErrorModal />
      <div 
        id="pdf-div" 
        style={{
          height: 'calc(100vh - 240px)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      ></div>
    </>
  );
};

export default ProjectLogsReader;
