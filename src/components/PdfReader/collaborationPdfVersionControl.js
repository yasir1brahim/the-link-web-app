/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../config/axios';
import WebViewer from '@pdftron/webviewer';
import { validateS3Link, isS3LinkExpiredError } from '../../utils/s3LinkValidator.js';
import { useS3LinkValidation } from '../../hooks/useS3LinkValidation.js';

const CollaborationPdfVersionControl = ({ docId, projectName }) => {
  const viewer = useRef(null);
  const { handleError, ErrorModal } = useS3LinkValidation();

  useEffect(() => {
    loadPDF();
  }, []);

  const loadPDF = async () => {
    const pdfUrl = 'http://d1ke0zqcx0inzb.cloudfront.net/original/project_292_03_3816_-HP_UNBONDED_POST-TENSIONED_CONCRETE.pdf';
    
    // Simple S3 validation
    try {
      const isValid = await validateS3Link(pdfUrl);
      if (!isValid) {
        handleError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        return;
      }
    } catch (error) {
      console.log('S3 validation failed, continuing with PDF load');
    }

    WebViewer(
      {
        fullAPI: true,
        disableMultiViewerComparison: false,
        path: '/webviewer/lib',
        licenseKey:
          'Thelinkai  Inc :PWS:Thelinkai  Inc ::B+2:9D34C842CB60BB40A8EF77436A7DEE579B3C140AD8EFE6EE4ED826BD',
        initialDoc: pdfUrl
      },
      viewer.current
    ).then(async (instance) => {
      const { UI, Core } = instance;
      // const { Annotations } = Core;
      // const { Color } = Annotations;
      const { documentViewer, annotationManager, PDFNet } = instance.Core;
      instance.UI.enableFeatures([instance.UI.Feature.InlineComment]);
      
      // Error handling
      documentViewer.addEventListener("documentError", (error) => {
        if (isS3LinkExpiredError(error)) {
          handleError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        } else {
          handleError({ message: 'Unable to load the PDF document. Please try again.' });
        }
      });

      const userData = [
        {
          value: 'Hugh Seaton',
          email: 'hugh.seaton@thelink.ai'
        },
        {
          value: 'Bhabani',
          email: 'bhabani@getcarnera.com'
        },
        {
          value: 'Nikhil',
          email: 'nikhil@getcarnera.com'
        },
        {
          value: 'Pranshul',
          email: 'pranshul@getcarnera.com'
        },
        {
          value: 'Siddharth',
          email: 'sid@getcarnera.com'
        }
      ];
      instance.UI.mentions.setUserData(userData);
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
        'strikeoutToolGroupButton'
      ]);
      instance.UI.openElements('notesPanel');
      instance.UI.mentions.on('mentionChanged', async (mentions, action) => {
        if (action === 'add') {
          // a new mention was just added to a comment
          const annot = annotationManager.getAnnotationById(
            mentions[0]?.annotId
          );
          await axiosInstance({
            method: 'post',
            url: '/comments/notify',
            data: {
              email_id: mentions[0]?.email,
              message: annot?.cqa,
              redirect_url: window.location.href,
              project_name: projectName
            }
          });
        }

        if (action === 'modify') {
          // the mentioned names in a comment didn't change, but the surrounding text was changed
        }

        if (action === 'delete') {
          // a mention was just deleted from a comment
        }

        console.log(mentions);
        console.log(window.location);
      });
      annotationManager.addEventListener(
        'annotationChanged',
        async (annotations, action, { imported }) => {
          // If the event is triggered by importing then it can be ignored
          // This will happen when importing the initial annotations
          // from the server or individual changes from other users
          if (imported) return;

          const xfdfString = await annotationManager.exportAnnotationCommand();
          console.log('aa', annotations[0].qt);
          await axiosInstance({
            method: 'post',
            url: '/saveMetadata',
            data: {
              doc_id: 2360,
              edited_by: parseInt(localStorage.getItem('userId')),
              data: [{ id: annotations[0].qt, xfdf_string: xfdfString }],
              pdf_type: 'pdftron'
            }
          });
        }
      );
      const [documentViewer1, documentViewer2] = Core.getDocumentViewers();

      documentViewer1.addEventListener('documentLoaded', () => {
        const fetchData = async () => {
          const response = await axiosInstance({
            method: 'get',
            url: `/getMetadata/2360`
          });
          if (response.status === 200) {
            console.log('resss', response.data, response.data.data[0]);
            response.data.data?.map(async (item) => {
              const annotations =
                await annotationManager.importAnnotationCommand(
                  item.xfdf_string
                );
              console.log('annotations', annotations);
              annotations.forEach((annotation) => {
                annotationManager.redrawAnnotation(annotation);
              });
            });
          }
        };
        fetchData().catch((error) => {
          console.log(error);
        });
      });

      documentViewer2?.addEventListener('documentLoaded', () => {
        const fetchData = async () => {
          const response = await axiosInstance({
            method: 'get',
            url: `/getMetadata/2360`
          });
          if (response.status === 200) {
            console.log('resss', response.data, response.data.data[0]);
            response.data.data?.map(async (item) => {
              const annotations =
                await annotationManager.importAnnotationCommand(
                  item.xfdf_string
                );
              console.log('annotations', annotations);
              annotations.forEach((annotation) => {
                annotationManager.redrawAnnotation(annotation);
              });
            });
          }
        };
        fetchData().catch((error) => {
          console.log(error);
        });
      });

      UI.addEventListener(UI.Events.MULTI_VIEWER_READY, () => {
        const startCompare = async () => {
          const shouldCompare =
            documentViewer1?.getDocument() && documentViewer2?.getDocument();
          if (shouldCompare) {
            // Check if both documents loaded before comparing
            // const beforeColor = new Color(21, 205, 131, 0.4);
            // const afterColor = new Color(255, 73, 73, 0.4);
            // const options = { beforeColor, afterColor };
            // const { doc1Annotations, doc2Annotations, diffCount } =
            //   await documentViewer1?.startSemanticDiff(documentViewer2, options);
          }
        };
        documentViewer1.addEventListener('documentLoaded', startCompare);
        // documentViewer2.addEventListener("documentLoaded", startCompare);
      });
      UI.enableFeatures([UI.Feature.MultiViewerMode]);

      // create a new pdf for comparison
      await PDFNet.initialize();

      const newDoc = await PDFNet.PDFDoc.create();
      await newDoc.lock();

      const doc1 = await PDFNet.PDFDoc.createFromURL(
        './files/semantic_test_doc_1.pdf'
      );
      const doc2 = await PDFNet.PDFDoc.createFromURL(
        './files/semantic_test_doc_2.pdf'
      );
      await newDoc.appendTextDiffDoc(doc1, doc2);

      await newDoc.unlock();

      instance.UI.loadDocument(newDoc);

      // wait until the document has been loaded
      documentViewer.addEventListener('documentLoaded', () => {
        instance.UI.setLayoutMode(instance.UI.LayoutMode.FacingContinuous);
      });
    });
  };
  return (
    <>
      <ErrorModal />
      <div
        style={{ height: '100vh' }}
        ref={viewer}
        id="pdf-div"
        className="full-window-div border border-gray-100 h-screen"
        // onDocumentLoad={loadPDF()}
      ></div>
    </>
  );
};
export default CollaborationPdfVersionControl;
