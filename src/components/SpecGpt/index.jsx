import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import Header from '../shared/Header/Header'
import Loader from '../shared/Loader/Loader';
import NavbarTop from '../shared/NavbarTop/NavbarTop'
// import GettingStartedPage from './specgpt/pages/GettingStartedPage';
import ChatPage from './specgpt/pages/ChatPage';

export const SpecGpt = () => {
    const [searchParams] = useSearchParams();
    const projectDetails = searchParams.get('projectDetails')?.split(',');
    const projectName = projectDetails?.length >= 4 ? projectDetails[3] : null;
    const customerId =
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
    const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;
    const [docsLoaded, setDocsLoaded] = useState(true);
  const specGptUser = localStorage.getItem('isSpecGptUser') === 'true'

  const checkDocsStatus = async () => {
    if (
      specGptUser
    ) {
      try {
        const response = await axiosInstance({
          method: 'get',
          url: '/spec-gpt/docsIndexed',
          params: {
            project_id: projectId
          }
        });
        const { docsIndexed } = response.data;
        setDocsLoaded(docsIndexed);
      } catch (error) {
        console.error('Error checking docs status:', error);
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkDocsStatus();

    // Set up interval to check docs status every 10 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      checkDocsStatus();
    }, 120000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="page-wrap">
        <NavbarTop/>
        <div className="project-logs-wrapper log-table-width">
        <Header
          // title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
          // centerText={'Commercial'}
          breadcrumb={'View Projects'}
          breadcrumbUrl={`/project-list?id=${customerId}`}
          breadcrumb2={'Spec GPT'}
          showBtn={'Upload Additional'}
        //   toggleModal={toggleModal}
          btnSize={'small'}
            title={projectName || ''}
        //   docParsed={docParsed}
        //   qaDashboard={state?.qaDashboard}
          navBtn={'specGpt'}
        />
        {/* <GettingStartedPage /> */}
       {<ChatPage docsLoaded={docsLoaded}/>}
        </div>
    </div>
  )
}
