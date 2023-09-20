/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../config/axios';
import WebViewer from '@pdftron/webviewer';

const CollaborationPdfReader = ({
  docId,
  projectName,
  collabDocs,
  userList
}) => {
  const fullName = localStorage.getItem('fullName');
  const viewer = useRef(null);
  // const [documentId, setDocId] = useState(collabDocs[0]?.id)
  const [documentId, _setDocId] = useState('');
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

  const handleDocumentLoaded = async (
    docId,
    annotationManager,
    sectionNumber
  ) => {
    setDocId(docId);
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'post',
        url: `/pdf/v2/getMetadata`,
        data: {
          doc_id: docId,
          section_no: sectionNumber
        }
      });
      if (response.status === 200) {
        response.data.data?.map(async (item) => {
          const annotations = await annotationManager.importAnnotationCommand(
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
  };

  const loadPDF = () => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey:
          'Thelinkai, Inc. (thelink.ai):PWS:Thelinkai::B+2:D0333312DD61815C33A681734AA1DD04DD5EB88FFD89F8DBFE1FBDE14C08D8EFE6EE4ED826BD',
        initialDoc: collabDocs[0].section_file_path,
        extension: 'pdf'
      },
      viewer.current
    ).then(async (instance) => {
      instance.UI.enableFeatures([instance.UI.Feature.InlineComment]);
      const { documentViewer, annotationManager } = instance.Core;
      const annotHistoryManager = documentViewer.getAnnotationHistoryManager();

      handleDocumentLoaded(
        collabDocs[0].doc_id,
        annotationManager,
        collabDocs[0].section_no
      );
      annotationManager.addEventListener(
        'annotationChanged',
        async (annotations, action, { imported }) => {
          if (imported) return;

          const xfdfString = await annotationManager.exportAnnotationCommand();
          if (docIdRef?.current === collabDocs[0].doc_id) {
            await axiosInstance({
              method: 'post',
              url: '/pdf/v2/saveMetadata',
              data: {
                doc_id: collabDocs[0].doc_id,
                edited_by: parseInt(localStorage.getItem('userId')),
                section_no: collabDocs[0].section_no,
                data: [{ id: annotations[0].qt, xfdf_string: xfdfString }],
                pdf_type: 'pdftron'
              }
            });
          }
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
          // documentViewer.removeEventListener("documentLoaded")
          instance.UI.loadDocument(`${cd.section_file_path}`, {
            documentId: `${cd.doc_id}`
          });
          handleDocumentLoaded(cd?.doc_id, annotationManager, cd.section_no);
          annotationManager.addEventListener(
            'annotationChanged',
            async (annotations, action, { imported }) => {
              // If the event is triggered by importing then it can be ignored
              // This will happen when importing the initial annotations
              // from the server or individual changes from other users
              if (imported) return;

              const xfdfString =
                await annotationManager.exportAnnotationCommand();
              console.log('aa', annotations[0].qt, cd, docIdRef);
              if (docIdRef?.current === cd.doc_id) {
                await axiosInstance({
                  method: 'post',
                  url: '/pdf/v2/saveMetadata',
                  data: {
                    doc_id: cd.doc_id,
                    edited_by: parseInt(localStorage.getItem('userId')),
                    section_no: cd.section_no,
                    data: [{ id: annotations[0].qt, xfdf_string: xfdfString }],
                    pdf_type: 'pdftron'
                  }
                });
              }
            }
          );
        });
        return true;
      });

      // const userDatas = userList?.map((user) => ({
      //   value: user.full_name,
      //   email: user.email_address
      // }));

      const userDatas = [
        {
          value: "Hugh Seaton",
          email: "hugh.seaton@thelink.ai",
        },
        {
          value: "Bhabani",
          email: "bhabani@getcarnera.com",
        },
        {
          value: "Nikhil",
          email: "nikhil@getcarnera.com",
        },
        {
          value: "Pranshul",
          email: "pranshul@getcarnera.com",
        },
        {
          value: "Siddharth",
          email: "sid@getcarnera.com",
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
        'freeTextToolGroupButton'
      ]);
      instance.UI.NotesPanel.enableAutoExpandCommentThread();
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
              project_name: projectName,
              sender_name: fullName,
              selected_text: ""
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
      // annotationManager.addEventListener(
      //   "annotationChanged",
      //   async (annotations, action, { imported }) => {
      //     // If the event is triggered by importing then it can be ignored
      //     // This will happen when importing the initial annotations
      //     // from the server or individual changes from other users
      //     if (imported) return;

      //     const xfdfString = await annotationManager.exportAnnotationCommand();
      //     console.log("aa", annotations[0].qt);
      //     await axiosInstance({
      //       method: "post",
      //       url: "/saveMetadata",
      //       data: {
      //         doc_id: 2360,
      //         edited_by: parseInt(localStorage.getItem("userId")),
      //         data: [{ id: annotations[0].qt, xfdf_string: xfdfString }],
      //         pdf_type: "pdftron",
      //       },
      //     });
      //   }
      // );

      // documentViewer.addEventListener("documentLoaded", () => {
      //   console.log('document deets', instance.Core.documentViewer.getDocument());
      //   const fetchData = async () => {
      //     const response = await axiosInstance({
      //       method: "get",
      //       url: `/getMetadata/${documentId || '2360'}`,
      //     });
      //     if (response.status === 200) {
      //       console.log("resss", response.data, response.data.data[0]);
      //       response.data.data?.map(async (item) => {
      //         const annotations =
      //           await annotationManager.importAnnotationCommand(
      //             item.xfdf_string
      //           );
      //         console.log("annotations", annotations);
      //         annotations.forEach((annotation) => {
      //           annotationManager.redrawAnnotation(annotation);
      //         });
      //       });
      //     }
      //   };
      //   fetchData().catch((error) => {
      //     console.log(error);
      //   });
      // });
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
