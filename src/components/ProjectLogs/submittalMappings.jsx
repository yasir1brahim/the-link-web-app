import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axios';
import { ToastContainer } from 'react-toastify';
import { get } from 'lodash';
import NavbarTop from '../shared/NavbarTop/NavbarTop';

import { Button } from 'reactstrap';
import SelectDropDownV2 from '../shared/SelectDropDownV2/SelectDropDownV2';
// import ExportToProcoreModal from "./exportToProcoreModal";
import { ReactComponent as LinkLogo } from '../../assets/images/logo-dark.svg';
import { ReactComponent as ArrowRight } from '../../assets/images/border-arrow.svg';
import Loader from '../shared/Loader/Loader';
import handleError from '../../config/errorHandler';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const SubmittalMappings = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId');
  const [isLoading, setLoading] = useState(false);
  const [linkSubMappings, setLinkSubMappings] = useState([]);
  //   const [procoreSubDropDownMappings, setProcoreSubDropDownMappings] = useState([]);
  const [onEdit, setOnEdit] = useState(false);
  // const [openExportToProcoreModal, setOpenExportToProcoreModal] =
  //   useState(false);
  // const [allMappings, setAllMappings] = useState({});
  //   const [selectedProcoreSubmittal, setSelectedProcoreSubmittal] = useState();
  const navigate = useNavigate();

  return (
    <div className="page-wrap">
      <NavbarTop />
      {/* {openExportToProcoreModal && allMappings && (
        <ExportToProcoreModal mappings={allMappings} companyId={companyId}></ExportToProcoreModal>
      )} */}
        <div className="button-wrap">
          <Button onClick={() => setOnEdit(true)}>Edit</Button>
        </div>
      <div className="project-logs-wrapper log-table-width submittal-table">
        <table>
          <tbody>
            <tr
              style={{
                border: '10px solid #202A44',
                background: '#202A44',
                color: '#ffffff'
              }}
            >
              <th>Submittal Types from Link</th>
            </tr>
            {linkSubMappings.length > 0 &&
              linkSubMappings.map((x, k) => (
                <tr
                  key={k}
                  style={{
                    borderBottom: '1px solid black',
                    lineHeight: '40px'
                  }}
                >
                  <td>{get(x, 'link_submittal')}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
      {isLoading && <Loader showComponentLoader={true} />}
    </div>
  );
};

export default SubmittalMappings;
