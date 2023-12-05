import React from 'react'
import { useSearchParams } from 'react-router-dom';
import Header from '../shared/Header/Header'
import NavbarTop from '../shared/NavbarTop/NavbarTop'
// import GettingStartedPage from './specgpt/pages/GettingStartedPage';
import ChatPage from './specgpt/pages/ChatPage';

export const SpecGpt = () => {
    const [searchParams] = useSearchParams();
    const projectDetails = searchParams.get('projectDetails')?.split(',');
    const projectName = projectDetails?.length >= 4 ? projectDetails[3] : null;
    const customerId =
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
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
        <ChatPage/>
        </div>
    </div>
  )
}
