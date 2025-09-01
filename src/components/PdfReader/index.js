import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axios';
import ViewSDKClient from '../../ViewSDKClient';
import { validateS3Link, isS3LinkExpiredError } from '../../utils/s3LinkValidator.js';
import { useS3LinkValidation } from '../../hooks/useS3LinkValidation.js';

const RenderMenu = ({ url, textLoc, docId }) => {
  const [docAnnotations, setAnnotations] = useState([]);
  const [newAnnotations, setNewAnnotations] = useState([]);
  const { handleError, ErrorModal } = useS3LinkValidation();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'post',
        url: `/pdf/v2/getMetadata`,
        data: {
          doc_id: docId
        }
      });
      setAnnotations(response.data.data);
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [docId]);

  useEffect(() => {
    if (newAnnotations.length) {
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
        setAnnotations(newAnnotations);
      };

      fetchData().catch((error) => {
        console.log(error);
      });
    }
  }, [newAnnotations, docId]);

  const loadPDF = async () => {
    // Clean up existing PDF viewer
    const pdfDiv = document.getElementById('pdf-div');
    if (pdfDiv) {
      pdfDiv.innerHTML = '';
    }
    
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

    const viewSDKClient = new ViewSDKClient();
    
    viewSDKClient.ready().then(() => {
      const previewFilePromise = viewSDKClient.previewFile(
        'pdf-div',
        {
          defaultViewMode: 'FIT_WIDTH',
          showAnnotationTools: true,
          showLeftHandPanel: false,
          showPageControls: true,
          showDownloadPDF: false,
          showPrintPDF: false,
          enableAnnotationAPIs: true,
          includePDFAnnotations: true,
          showFullScreen: true
        },
        url,
        setNewAnnotations,
        handleError
      );

      previewFilePromise.then((adobeViewer) => {
        adobeViewer.getAnnotationManager().then((annotationManager) => {
          annotationManager
            .setConfig({
              showCommentsPanel: false
            })
            .then(() => console.log('Success'))
            .catch((error) => console.log(error));
        });
      });

      previewFilePromise.then((adobeViewer) => {
        adobeViewer.getAnnotationManager().then((annotationManager) => {
          annotationManager
            .getAnnotations()
            .then((result) => {
              result.length && setNewAnnotations(result);
            })
            .catch((error) => console.log(error));
        });
      });

      previewFilePromise.then((adobeViewer) => {
        adobeViewer.getAnnotationManager().then((annotationManager) => {
          annotationManager
            .addAnnotations(docAnnotations)
            .then(() =>
              previewFilePromise.then((adobeViewer) => {
                adobeViewer.getAPIs().then((apis) => {
                  apis
                    .gotoLocation(textLoc.page_no, textLoc.x, textLoc.y)
                    .then(() => console.log('Success'))
                    .catch((error) => console.log(error));
                });
              })
            )
            .catch((error) => console.log(error));
        });
      });
      
      previewFilePromise.then((adobeViewer) => {
        adobeViewer.getAPIs().then((apis) => {
          apis
            .gotoLocation(textLoc.page_no, textLoc.x, textLoc.y)
            .then(() => console.log('Success'))
            .catch((error) => console.log(error));
        });
      });
    });
  };

  return (
    <>
      <ErrorModal />
      <div
        id="pdf-div"
        className="full-window-div border border-gray-100 h-screen"
        style={{
          height: 'calc(100vh - 240px)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
        onDocumentLoad={loadPDF()}
      ></div>
    </>
  );
};

export default RenderMenu;
