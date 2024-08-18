/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import WebViewer from "@pdftron/webviewer";
import axiosInstance from "../../config/axios";

const ProjectLogsReader = ({ url, textLoc, docId, additionalTextLocations, setPdfData, handleAddNewRow, handleAppendToSelectedRow, setLogInViewer }) => {
  const viewer = useRef(null);

  useEffect(() => {
    if (url) {
      loadPDF();
    }
  }, [url]);

  const handleClose = () => {
    setLogInViewer(null);
    setPdfData({
      url: "",
      textLoc: {},
      index: "",
      docId: null,
      additionalTextLocations: [],
    });
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
            item.xfdf_string,
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

  const loadPDF = () => {
    WebViewer(
      {
        path: "/webviewer/lib",
        licenseKey:
          "Thelinkai, Inc. (thelink.ai):PWS:Thelinkai::B+2:D0333312DD61815C33A681734AA1DD04DD5EB88FFD89F8DBFE1FBDE14C08D8EFE6EE4ED826BD",
        initialDoc: url,
        extension: "pdf",
        css: "./index.css",
      },
      viewer.current,
    ).then(async (instance) => {
      console.log("additionalTextLocations", additionalTextLocations);
      instance.UI.enableFeatures([instance.UI.Feature.InlineComment]);
      handleDocumentLoaded(instance.Core.annotationManager);
      instance.UI.setZoomLevel('100%');
      //Below code scrolls the pdf to the location of the text on load
      instance.Core.documentViewer.addEventListener("documentLoaded", () => {
        instance.Core.documentViewer.displayPageLocation(
          textLoc?.page_no,
          textLoc?.x,
          textLoc?.y,
        );
        
        // Add rectangular highlight
        const annotationManager = instance.Core.annotationManager;
        const Annotations = instance.Core.Annotations;
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: textLoc?.page_no,
          X: textLoc?.x,
          Y: textLoc?.y,
          Width: textLoc?.width,
          Height: textLoc?.height,
          Color: new Annotations.Color(213, 231, 62, 0),
          FillColor: new Annotations.Color(213, 231, 62, 0.25),
        });
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
          annotationManager.addAnnotation(rectangleAnnot);
          annotationManager.redrawAnnotation(rectangleAnnot);
        }
      });
      instance.UI.updateElement("menuButton", {
        img: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.33325 5H16.6666M3.33325 10H16.6666M3.33325 15H16.6666" stroke="#36454F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          `,
        title: "Menu",
      });
      instance.UI.updateElement("leftPanelButton", {
        img: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1_5083)">
          <path d="M17.5001 2.5C17.7211 2.5 17.9331 2.5878 18.0893 2.74408C18.2456 2.90036 18.3334 3.11232 18.3334 3.33333V16.6667C18.3334 16.8877 18.2456 17.0996 18.0893 17.2559C17.9331 17.4122 17.7211 17.5 17.5001 17.5H2.50008C2.27907 17.5 2.06711 17.4122 1.91083 17.2559C1.75455 17.0996 1.66675 16.8877 1.66675 16.6667V3.33333C1.66675 3.11232 1.75455 2.90036 1.91083 2.74408C2.06711 2.5878 2.27907 2.5 2.50008 2.5H17.5001ZM5.83341 4.16667H3.33341V15.8333H5.83341V4.16667ZM16.6667 4.16667H7.50008V15.8333H16.6667V4.16667Z" fill="#36454F"/>
          </g>
          <defs>
          <clipPath id="clip0_1_5083">
          <rect width="20" height="20" fill="white"/>
          </clipPath>
          </defs>
          </svg>
          `,
        title: "Panel",
      });
      instance.UI.updateElement("viewControlsButton", {
        img: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1_5087)">
          <path d="M7.1625 10.6766C7.05684 10.232 7.05684 9.76877 7.1625 9.32412L6.33583 8.84662L7.16917 7.40329L7.99583 7.88079C8.32764 7.56652 8.72872 7.33473 9.16667 7.20413V6.24996H10.8333V7.20413C11.2767 7.33579 11.6767 7.57079 12.0042 7.88079L12.8308 7.40329L13.6642 8.84662L12.8375 9.32412C12.943 9.7685 12.943 10.2314 12.8375 10.6758L13.6642 11.1533L12.8308 12.5966L12.0042 12.1191C11.6724 12.4334 11.2713 12.6652 10.8333 12.7958V13.75H9.16667V12.7958C8.72872 12.6652 8.32764 12.4334 7.99583 12.1191L7.16917 12.5966L6.33583 11.1533L7.1625 10.6766ZM10 11.25C10.3315 11.25 10.6495 11.1183 10.8839 10.8838C11.1183 10.6494 11.25 10.3315 11.25 9.99996C11.25 9.66844 11.1183 9.35049 10.8839 9.11607C10.6495 8.88165 10.3315 8.74996 10 8.74996C9.66848 8.74996 9.35054 8.88165 9.11612 9.11607C8.8817 9.35049 8.75 9.66844 8.75 9.99996C8.75 10.3315 8.8817 10.6494 9.11612 10.8838C9.35054 11.1183 9.66848 11.25 10 11.25ZM12.5 3.33329H4.16667V16.6666H15.8333V6.66663H12.5V3.33329ZM2.5 2.49329C2.5 2.03663 2.8725 1.66663 3.3325 1.66663H13.3333L17.5 5.83329V17.4941C17.5008 17.6036 17.48 17.7121 17.4388 17.8135C17.3976 17.9149 17.3369 18.0072 17.2601 18.0851C17.1832 18.163 17.0918 18.225 16.991 18.2676C16.8901 18.3102 16.7819 18.3325 16.6725 18.3333H3.3275C3.10865 18.3318 2.89918 18.2442 2.74435 18.0895C2.58951 17.9349 2.50175 17.7255 2.5 17.5066V2.49329Z" fill="#36454F"/>
          </g>
          <defs>
          <clipPath id="clip0_1_5087">
          <rect width="20" height="20" fill="white"/>
          </clipPath>
          </defs>
          </svg>
          `,
        title: "View controls",
      });

      instance.UI.disableElements([
        // "panToolButton",
        "downloadButton",
        "printButton",
        "viewControlsDivider2",
        "rotateHeader",
        "rotateCounterClockwiseButton",
        "rotateClockwiseButton",
        // "selectToolButton",
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

      const closeButton = () => {
        return (
          <div
            onClick={() => handleClose()}
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

      instance.UI.setHeaderItems((header) => {
        header.push(newDivider);
      });

      instance.UI.setHeaderItems((header) => {
        header.push(customCloseButton);
      });

      instance.UI.disableElements(['textHighlightToolButton']);
      instance.UI.disableElements(['copyTextButton']);

      const contextMenuItems = instance.UI.textPopup.getItems();
      const lastItem = contextMenuItems[contextMenuItems.length - 1];
      instance.UI.textPopup.add({
        type: 'actionButton',
        label: 'Add New Row',
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
        onClick: () => handleAddNewRow(instance.Core.documentViewer.getSelectedText())
      },
      lastItem.dataElement);
      instance.UI.textPopup.add({
        type: 'actionButton',
        label: 'Append to Selected Row',
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
        onClick: () => handleAppendToSelectedRow(instance.Core.documentViewer.getSelectedText())
      },
      lastItem.dataElement);
    });
  };
  return (
    <>
      <div
        style={{ height: "calc(100vh - 270px)", position: "relative" }}
        ref={viewer}
        id="pdf-div"
        className="full-window-div  h-screen"
        // onDocumentLoad={loadPDF()}
      ></div>
    </>
  );
};
export default ProjectLogsReader;
