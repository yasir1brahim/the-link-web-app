// import React, { useState, useEffect } from 'react';
// import Header from '../shared/Header/Header';
// import Loader from '../shared/Loader/Loader';
// import NavbarTop from '../shared/NavbarTop/NavbarTop';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import axiosInstance from '../../config/axios';
// import { UploadDocuments } from './UploadDocuments';
// import handleError from '../../config/errorHandler';

// const ProjectsDetails = () => {
//   const [modal, setModal] = useState(false);
//   const [errorModal, toggleErrorModal] = useState(false);
//   const [successModal, toggleSuccessModal] = useState(false);
//   const toggleModal = () => setModal(!modal);
//   const { state } = useLocation();
//   const [projectData, setProjectData] = useState([]);
//   const [pdfFile, setPdfFile] = useState({});
//   const [fileData, setFileData] = useState({});
//   const navigate = useNavigate();
//   const [pageRefresh, setPageRefresh] = useState(false);
//   const [isLoading, setLoading] = useState(false);
//   const [isUploadLoading, setUploadLoading] = useState(false);
//   const [docParsed, setDocParsed] = useState(0);

//   useEffect(() => {
//     if (!modal) {
//       setPdfFile({});
//     }
//   }, [modal]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       const response = await axiosInstance({
//         method: 'get',
//         url: `/project_data/${state.project?.project_id}`,
//       });
//       setProjectData(response.data.message);
//       setDocParsed(response.data.doc_parsed);
//       setLoading(false);
//       console.log(response.data.message);
//     };

//     fetchData().catch((error) => {
//       setLoading(false);
//       handleError(error)
//     });
//   }, [state?.project, pageRefresh]);

//   const backToUpload = () => {
//     toggleErrorModal(false);
//     setModal(true);
//   };
//   const handleSubmit = async () => {
//     console.log(pdfFile);
//     try {
//       setUploadLoading(true);
//       const data = new FormData();
//       data.append('project_id', state.project?.project_id);
//       state?.project?.project_type === 'ufgs' && data.append('project_type', state.project?.project_type);
//       Object.values(pdfFile)?.forEach((file) => data.append('files', file));
//       const response = await axiosInstance({
//         method: 'post',
//         url: '/upload_file',
//         data,
//       });
//       if (response.data) {
//         console.log(response.data);
//         setUploadLoading(false);
//         setFileData(response.data.message);
//         setModal(false);
//         toggleSuccessModal(true);
//         setPageRefresh(!pageRefresh);
//       }
//     } catch (error) {
//       setUploadLoading(false);
//       toggleErrorModal(true);
//       setModal(false);
//       handleError(error)
//     }
//   };

//   const handleViewLog = (project, logType) => {
//     navigate(`/project-logs?projectDetails=${project?.project_id},${state.customerId},${logType}`, {
//       state: {
//         project,
//         projectId: project?.project_id,
//         projectName: state.project?.project_name,
//         customerId: state.customerId,
//         logType
//       },
//     });
//   };

//   return (
//     <>
//       <div className="page-wrap">
//         <NavbarTop />
//         <div className="page-wrap-content projects-details-wrapper">
//           <Header
//             title={`Project Details/  ${
//               state?.project?.project_name || ''
//             }`}
//             showBtn={'Upload Specs'}
//             toggleModal={toggleModal}
//             breadcrumb={'Project Details'}
//             breadcrumb2={'View Projects'}
//           />

//           <div className="projects-details-content">
//             <div className="project-details">
//               {projectData.length === 0 ? (
//                 /* when there are Zero Users */
//                 <div className="noprojects-wrapper d-flex align-items-center justify-content-center w-100">
//                   <span className="d-flex align-items-center justify-content-center">
//                     {/* <AddUser /> Create Users/Employees, then Add a Project */}
//                     No Project Data Found.
//                   </span>
//                 </div>
//               ) : (
//                 <div className="l-table-wrapper">
//                   <table className="table">
//                     <thead>
//                       <tr>
//                         <th>
//                           <span>
//                             Requirement Types <i className=""></i>
//                           </span>
//                         </th>
//                         {/* <th>
//                           <span>
//                             Status<i className="sort-d"></i>
//                           </span>
//                         </th>
//                         <th>
//                           <span>
//                             Logs Created<i className="sort-i"></i>
//                           </span>
//                         </th> */}
//                         <th>
//                           <span>
//                             Total Items
//                             {/* <i className="sort-i"></i> */}
//                           </span>
//                         </th>
//                         {/* <th>Action</th> */}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {projectData.map((project) => {
//                         return (
//                           <tr>
//                             <td>{project.type}</td>
//                             {/* <td>{project.status}</td>
//                             <td>{project.logs_created}</td> */}
//                             <td>{project.total_logs}</td>
//                             {/* <td>
//                               <div className="action-wrapper">
//                                 <button
//                                   type="button"
//                                   className="btn btn-secondary btn-sm"
//                                   onClick={() => handleViewLog(project)}
//                                   disabled={project.total_logs === '0'}
//                                 >
//                                   View Logs
//                                 </button>
//                               </div>
//                             </td> */}
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//               <div className="table-footer-content">
//                 <div style={{textAlign: 'center'}}>
//                   <button
//                     type="button"
//                     className="btn btn-secondary btn-sm"
//                     style={{display: 'inline-block'}}
//                     onClick={() => handleViewLog(state.project, 'Classified')}
//                     disabled={
//                       !projectData
//                         .map((project) => (project.total_logs > 0 ? true : false))
//                         .filter((value) => value === true).length
//                     }
//                   >
//                     View Requirement Log
//                   </button>
//                   {/* <button
//                     type="button"
//                     className="btn btn-secondary btn-sm"
//                     style={{display: 'inline-block', marginLeft: '10px'}}
//                     onClick={() => handleViewLog(state.project, 'Unclassified')}
//                     disabled={
//                       !projectData
//                         .map((project) => (project.total_logs > 0 ? true : false))
//                         .filter((value) => value === true).length
//                     }
//                   >
//                     View Unclassified Log
//                   </button> */}
//                 </div>
//                 <p>
//                   Documents Uploaded: <span>{docParsed}</span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <UploadDocuments
//           modal={modal}
//           toggleModal={toggleModal}
//           setPdfFile={setPdfFile}
//           pdfFile={pdfFile}
//           handleSubmit={handleSubmit}
//           isUploadLoading={isUploadLoading}
//           errorModal={errorModal}
//           toggleErrorModal={toggleErrorModal}
//           backToUpload={backToUpload}
//           successModal={successModal}
//           toggleSuccessModal={toggleSuccessModal}
//           fileData={fileData}
//         />
//       </div>
//       <Loader showComponentLoader={isLoading} />
//       <ToastContainer
//         position="bottom-center"
//         autoClose={5000}
//         hideProgressBar
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </>
//   );
// };

// export default ProjectsDetails;
