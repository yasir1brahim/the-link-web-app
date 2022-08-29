import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
import ViewSDKClient from "../../ViewSDKClient";
const RenderMenu = ({ url, textLoc, docId }) => {
  const [docAnnotations, setAnnotations] = useState([])
  const [newAnnotations, setNewAnnotations] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/getMetadata/${docId}`,
      });
      setAnnotations(response.data.data);
    };

    fetchData().catch((error) => {
      console.log(error)
    });
  }, [docId])

  useEffect(() => {
    if(newAnnotations.length) {
      const fetchData = async () => {
        await axiosInstance({
            method: 'post',
            url: '/saveMetadata',
            data: {
              doc_id: docId,
              edited_by: localStorage.getItem('userId'),
              data: newAnnotations
            }
          });
          setAnnotations(newAnnotations)
      };
  
      fetchData().catch((error) => {
        console.log(error)
      });

    }
  }, [newAnnotations, docId])

  const loadPDF = () => {
    const viewSDKClient = new ViewSDKClient();
    viewSDKClient.ready().then(() => {
      const previewFilePromise = viewSDKClient.previewFile(
        "pdf-div",
        {
          defaultViewMode: "FIT_WIDTH",
          showAnnotationTools: true,
          showLeftHandPanel: false,
          showPageControls: true,
          showDownloadPDF: true,
          showPrintPDF: false,
          enableAnnotationAPIs: true,
          includePDFAnnotations: true,
          showFullScreen: true,
          exitPDFViewerType: 'RETURN'


        },
        url, setNewAnnotations
      );
     
      previewFilePromise.then(adobeViewer => {
        adobeViewer.getAPIs().then(apis => {
          apis.gotoLocation(textLoc.page_no, textLoc.x, textLoc.y)
            .then(() => console.log("Success"))
            .catch(error => console.log(error));
        });
      })
      previewFilePromise.then(adobeViewer => {
        adobeViewer.getAnnotationManager().then(annotationManager => {
          annotationManager.getAnnotations()
            .then(result => {
              result.length && setNewAnnotations(result)
              console.log('annotation:', result)
            }
            )
            .catch(error => console.log(error));
        });
      });

      previewFilePromise.then(adobeViewer => {
        adobeViewer.getAnnotationManager().then(annotationManager => {
          annotationManager.addAnnotations(docAnnotations)
            .then(() => console.log("Success"))
            .catch(error => console.log(error));
        });
      });
    });
  };
  return (
    <>
      <div
        // style={{ height: "100vh" }}
        id="pdf-div"
        className="full-window-div border border-gray-100 h-screen"
        onDocumentLoad={loadPDF()}
      ></div>
    </>

  );
};
export default RenderMenu;