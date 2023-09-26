/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../config/axios';
import WebViewer from '@pdftron/webviewer';

const CollaborationPdfReader = ({
  //   docId,
  projectName,
  collabDocs,
  userList
}) => {
  const fullName = localStorage.getItem('fullName');
  const viewer = useRef(null);
  const [documentId, _setDocId] = useState('');
  let sectionId = '';
  let docId = '';
  const docIdRef = React.useRef(documentId);
  const setDocId = (data) => {
    docIdRef.current = data;
    _setDocId(data);
  };

  useEffect(() => {
    if (collabDocs && collabDocs.length > 0) {
      loadPDF();
    }
  }, [collabDocs]);

  const handleDocumentLoaded = async (docId, sectionNumber) => {
    try {
      const response = await axiosInstance({
        method: 'post',
        url: `/pdf/v2/getMetadata`,
        data: {
          doc_id: docId,
          section_no: sectionNumber
        }
      });
      let xfdfString = '';
      const dataLength = response.data.data.length;
      if (dataLength) {
        xfdfString = response.data.data[0].xfdf_string;
      }
      return xfdfString;
    } catch (e) {
      console.log(e);
    }
    setDocId(docId);
  };

  const loadPDF = () => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey:
          'Thelinkai, Inc. (thelink.ai):PWS:Thelinkai::B+2:D0333312DD61815C33A681734AA1DD04DD5EB88FFD89F8DBFE1FBDE14C08D8EFE6EE4ED826BD',
        initialDoc: collabDocs[0].section_file_path,
        extension: 'pdf',
        documentXFDFRetriever: () =>
          handleDocumentLoaded(
            docId || collabDocs[0].doc_id,
            sectionId || collabDocs[0].section_no
          )
      },
      viewer.current
    ).then(async (instance) => {
      instance.UI.enableFeatures([instance.UI.Feature.InlineComment]);
      const { documentViewer, annotationManager } = instance.Core;
      const annotHistoryManager = documentViewer.getAnnotationHistoryManager();

      const saveXfdfString = async (documentId, sectionId, xfdfString) => {
        try {
          //   if (docIdRef?.current === collabDocs[0].doc_id) {
          await axiosInstance({
            method: 'post',
            url: '/pdf/v2/saveMetadata',
            data: {
              doc_id: documentId,
              edited_by: parseInt(localStorage.getItem('userId')),
              section_no: sectionId,
              data: [{ id: sectionId, xfdf_string: xfdfString }],
              pdf_type: 'pdftron'
            }
          });
          //   }
        } catch (error) {
          console.log(error);
        }
      };
      annotationManager.addEventListener(
        'annotationChanged',
        async (annotations, action, { imported }) => {
          if (imported) return;

          const xfdfString = await annotationManager.exportAnnotations({
            links: false,
            widgets: false
          });
          saveXfdfString(
            docId || collabDocs[0].doc_id,
            sectionId || collabDocs[0].section_no,
            xfdfString
          );
        }
      );

      collabDocs.map((cd, index) => {
        const div = document.getElementById('chub-item-container');
        const loadDocumentButton = document.createElement('div');
        loadDocumentButton.className = `side-nav-chub-item ${
          index % 2 !== 0 ? 'highlight-row' : ''
        }`;
        loadDocumentButton.innerHTML = cd.section_no;
        div.appendChild(loadDocumentButton);
        loadDocumentButton.addEventListener('click', () => {
          sectionId = cd.section_no;
          docId = cd.doc_id;
          instance.UI.loadDocument(`${cd.section_file_path}`, {
            documentId: `${cd.doc_id}`
          });
        });
        return true;
      });

      // const userDatas = userList?.map((user) => ({
      //   value: user.full_name,
      //   email: user.email_address
      // }));

      const userDatas = [
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
        },
        {
          value: 'Task',
          email: 'tasks@thelink.ai'
        }
      ];

      instance.UI.mentions.setUserData(userDatas);

      //Changes label of highlight button to comment for select text menu
      instance.UI.updateElement('textHighlightToolButton', {
        label: 'Comment',
        img: 'icon-tool-comment-fill'
      });

      // instance.UI.setToolbarGroup('toolbarGroup-Annotate'); // set default toolbar group to annotate
      instance.UI.setHeaderItems(function (header) {
        // get the tools overlay
        const toolsOverlay = header
          .getHeader('toolbarGroup-Annotate')
          .get('toolsOverlay');
        // header.getHeader('toolbarGroup-Annotate').delete('toolsOverlay');
        // add the line tool to the top header
        header.getHeader('default').push(
          {
            type: 'toolGroupButton',
            toolGroup: 'highlightTools',
            dataElement: 'highlightToolGroupButton',
            title: 'annotation.highlight'
          },
          { type: 'divider' },
          // Undo Button
          {
            type: 'actionButton',
            style: { marginLeft: '0px' },
            dataElement: 'undoButton',
            title: 'action.undo',
            img: 'icon-operation-undo',
            onClick: () => {
              annotHistoryManager.undo();
            },
            isNotClickableSelector: () => !annotHistoryManager.canUndo()
          },
          // Redo Button
          {
            type: 'actionButton',
            dataElement: 'redoButton',
            title: 'action.redo',
            img: 'icon-operation-redo',
            onClick: () => {
              annotHistoryManager.redo();
            },
            isNotClickableSelector: () => !annotHistoryManager.canRedo()
          },
          { type: 'toolButton', toolName: 'AnnotationEraserTool' },
          { type: 'divider' },
          { type: 'spacer' }
          // {
          //   type: 'customElement',
          //   Title: 'Save Pdf',
          //   render: () => {
          //     return (
          //       <span
          //         style={{
          //           display: 'flex',
          //           alignItems: 'center',
          //           border: '0.5px solid #202a44',
          //           padding: '3px',
          //           borderRadius: '2px',
          //           cursor: 'pointer'
          //         }}
          //         onClick={() => {
          //           annotationManager
          //             .exportAnnotations({ links: false, widgets: false })
          //             .then(function (xfdfString) {
          //               saveXfdfString(
          //                 docId || collabDocs[0].doc_id,
          //                 sectionId || collabDocs[0].section_no,
          //                 xfdfString
          //               ).then(function () {
          //                 toast.success('Annotations saved successfully!', {
          //                   position: 'bottom-center',
          //                   autoClose: 5000,
          //                   hideProgressBar: true,
          //                   closeOnClick: true,
          //                   pauseOnHover: true,
          //                   draggable: true,
          //                   progress: undefined
          //                 });
          //               });
          //             });
          //         }}
          //       >
          //         <svg
          //           xmlns="http://www.w3.org/2000/svg"
          //           width="24"
          //           height="24"
          //           viewBox="0 0 24 24"
          //         >
          //           <path d="M0 0h24v24H0z" fill="none" />
          //           <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
          //         </svg>
          //         Save Changes
          //       </span>
          //     );
          //   }
          // }
        );
        // add the tools overlay to the top header
        header.push(toolsOverlay);
      });
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
        'freeTextToolGroupButton',
        'noteState',
        'highlightToolButton2',
        'highlightToolButton3',
        'highlightToolButton4',
        'toolStylePopup'
      ]);
      instance.UI.NotesPanel.enableAutoExpandCommentThread();
      instance.UI.openElements(['notesPanel']);
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
              project_name: projectName,
              sender_name: fullName,
              selected_text: ''
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
    });
  };
  return (
    <>
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
export default CollaborationPdfReader;
