/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';
import axiosInstance from '../../config/axios';

const ProjectLogsReader = ({ url, textLoc, docId }) => {
  const viewer = useRef(null);

  useEffect(() => {
    if (url) {
      loadPDF();
    }
  }, [url]);

  const handleDocumentLoaded = async (annotationManager) => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'post',
        url: `/pdf/v2/getMetadata`,
        data: {
          doc_id: docId
        }
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

  const loadPDF = () => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey:
          'Thelinkai, Inc. (thelink.ai):PWS:Thelinkai::B+2:D0333312DD61815C33A681734AA1DD04DD5EB88FFD89F8DBFE1FBDE14C08D8EFE6EE4ED826BD',
        initialDoc: url,
        extension: 'pdf'
      },
      viewer.current
    ).then(async (instance) => {
      instance.UI.enableFeatures([instance.UI.Feature.InlineComment]);
      handleDocumentLoaded(instance.Core.annotationManager);

      //Below code scrolls the pdf to the location of the text on load
      instance.Core.documentViewer.addEventListener('documentLoaded', ()=>{
        instance.Core.documentViewer.displayPageLocation(textLoc?.page_no, textLoc?.x, textLoc?.y)
      })

      instance.UI.disableElements([
        'downloadButton',
        'printButton',
        'viewControlsDivider2',
        'rotateHeader',
        'rotateCounterClockwiseButton',
        'rotateClockwiseButton',
        'selectToolButton',
        'toolbarGroup-View',
        'toolbarGroup-Shapes',
        'toolbarGroup-Edit',
        'toolbarGroup-FillAndSign',
        'toolbarGroup-Forms',
        'underlineToolGroupButton',
        'shapeToolGroupButton',
        'freeHandHighlightToolGroupButton',
        'freeHandToolGroupButton',
        'stickyToolGroupButton',
        'squigglyToolGroupButton',
        'strikeoutToolGroupButton',
        'toolbarGroup-Insert',
        'toolsHeader',
        'ribbons',
        'textUnderlineToolButton',
        'textSquigglyToolButton',
        'textStrikeoutToolButton',
        'linkButton',
        'toggleNotesButton'
      ]);
    });
  };
  return (
    <>
      <div
        style={{ height: '72vh' }}
        ref={viewer}
        id="pdf-div"
        className="full-window-div border border-gray-100 h-screen"
        // onDocumentLoad={loadPDF()}
      ></div>
    </>
  );
};
export default ProjectLogsReader;
