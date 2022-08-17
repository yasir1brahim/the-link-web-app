import React from "react";
import ViewSDKClient from "../../ViewSDKClient";
const RenderMenu = ({ url, textLoc }) => {
  const loadPDF = () => {
    const viewSDKClient = new ViewSDKClient();
    viewSDKClient.ready().then(() => {
      const previewFilePromise = viewSDKClient.previewFile(
        "pdf-div",
        {
          defaultViewMode: "FIT_WIDTH",
          showAnnotationTools: false,
          showLeftHandPanel: false,
          showPageControls: true,
          showDownloadPDF: false,
          showPrintPDF: false,
          enableAnnotationAPIs: true,
          includePDFAnnotations: true
        },
        url,
      );
      previewFilePromise.then(adobeViewer => {
        adobeViewer.getAPIs().then(apis => {
          apis.gotoLocation(textLoc.page_no, textLoc.x, textLoc.y)
            .then(() => console.log("Success"))
            .catch(error => console.log(error));
        });
      })
    });
  };
  return (
    <div className="mt-28">
      <div
     style = {{height:"100vh"}}
        id="pdf-div"
        className="full-window-div border border-gray-100 h-screen"
        onDocumentLoad={loadPDF()}
      ></div>
    </div>
  );
};
export default RenderMenu;