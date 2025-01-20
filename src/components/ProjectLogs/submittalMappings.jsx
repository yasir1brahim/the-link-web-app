import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axios';
import { ToastContainer } from 'react-toastify';
import { get } from 'lodash';
import NavbarTop from '../shared/NavbarTop/NavbarTop';

import { Button } from 'reactstrap';
import SelectDropDownV2 from '../shared/SelectDropDownV2/SelectDropDownV2';
import { ReactComponent as Logo } from '../../assets/images/procore-vector-logo.svg';
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
  const [procoreSubTypes, setProcoreSubTypes] = useState([]);
  //   const [procoreSubDropDownMappings, setProcoreSubDropDownMappings] = useState([]);
  const [onEdit, setOnEdit] = useState(false);
  // const [openExportToProcoreModal, setOpenExportToProcoreModal] =
  //   useState(false);
  // const [allMappings, setAllMappings] = useState({});
  //   const [selectedProcoreSubmittal, setSelectedProcoreSubmittal] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSubmittalMappings = async () => {
      try {
        setLoading(true);
        await axiosInstance({
          method: 'get',
          url: `/api/deliverables/procore/submittal_mappings/${customerId}/`
        }).then((res) => {
          setLinkSubMappings(get(res, 'data.data.link_sub_mapping'));
          setProcoreSubTypes(get(res, 'data.data.procore_submittal_types'));
          // setAllMappings(get(res, "data.data"));
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    };

    if (customerId) {
      handleSubmittalMappings();
    }
  }, [customerId]);

  // function used to map the procore submittals to link subimttals
  const onSelectProcoreDropdown = (linkId, procoreValue) => {
    if (linkSubMappings && linkSubMappings.length > 0) {
      const objectToUpdate = linkSubMappings[linkId];
      const updatedObject = { ...objectToUpdate, procore_type: procoreValue };
      linkSubMappings.splice(linkId, 1, updatedObject);
      setLinkSubMappings(linkSubMappings);
    }
  };

  const showDefaultPlacholder = (procoreType) => {
    if (procoreSubTypes && procoreSubTypes.length > 0) {
      const valueToShow = procoreSubTypes.find(
        (type) => type.name === procoreType
      );
      return valueToShow?.name;
    }
  };

  const procoreMappings = async () => {
    const mappingsobject = { mappings: linkSubMappings };

    try {
      setLoading(true);
      await axiosInstance({
        method: 'post',
        url: `/api/deliverables/procore/submittal_mappings/${customerId}/`,
        data: mappingsobject
      }).then((res) => {
        // if (get(res, "status") === 200) {
        //   setOpenExportToProcoreModal(true);
        // }
        return res;
      });
      setLoading(false);
      navigate(`/company-profile?companyId=${customerId}`);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="page-wrap">
      <NavbarTop 
        userRole={'admin'}
        teamId={customerId}
      />
      {/* {openExportToProcoreModal && allMappings && (
        <ExportToProcoreModal mappings={allMappings} companyId={companyId}></ExportToProcoreModal>
      )} */}
        <div className="button-wrap">
          <Button onClick={() => setOnEdit(true)}>Edit</Button>
          <Button onClick={() => procoreMappings()} style={{marginLeft: '5px'}}> Save Mapping</Button>
        </div>
        <span style={{marginLeft: '20px'}}><b>*</b> Use “Edit” to change nomenclature if necessary. Then click “Save Mapping” to finalize Procore integration</span>
      <div style={{ width: '350px', display: 'flex', margin: 'auto' }}>
        <LinkLogo /> <ArrowRight /> <Logo style={{ marginLeft: '30px' }} />
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
              <th>Submittal Types from Procore</th>
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
                  {!onEdit && <td>{get(x, 'procore_type')}</td>}
                  {procoreSubTypes && procoreSubTypes.length > 0 && onEdit ? (
                    <td>
                      <SelectDropDownV2
                        options={procoreSubTypes}
                        onChange={(e) =>
                          onSelectProcoreDropdown(k, get(e, '[0].name'))
                        }
                        style={{ marginTop: '20px' }}
                        placeholder={showDefaultPlacholder(
                          get(x, 'procore_type')
                        )}
                        defaultInputValue={showDefaultPlacholder(
                          get(x, 'procore_type')
                        )}
                      />
                    </td>
                  ) : (
                    <td>{get(x, `procore_submittal_types`)}</td>
                  )}
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
