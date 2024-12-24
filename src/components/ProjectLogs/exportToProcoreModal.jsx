import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import axiosInstance from '../../config/axios';
import { useNavigate } from 'react-router';
import Loader from '../shared/Loader/Loader';
import handleError from '../../config/errorHandler';

const ExportToProcoreModal = (props) => {
  const [openModal, setOpenModal] = useState(true);
  const toggle = () => setOpenModal(!openModal);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const projectId = localStorage.getItem('projectId');

  const handleExportToProcore = async () => {
    var exportAll = false;
    var selectedRows = [];
    if (selectStatus === 'All') {
      exportAll = true;
    } else {
      selectedRows = localStorage
            .getItem('selectedRows')
            ?.split(',')
            ?.map((row) => JSON.parse(row));
    }
    try {
      setLoading(true);
      await axiosInstance({
        method: 'post',
        url: '/procore/create_submittals',
        data: {
          project_id: Number(projectId),
          records: selectedRows, // array of ids
          export_all: exportAll
        }
      }).then((resp) => {
        if (resp.status === 200) {
          toast.success('Successfully exported to Procore!', {
            position: 'bottom-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          });
          toggle();
          navigate(
            `/project-logs?projectDetails=${projectId}`
          );
          localStorage.setItem('selectedRows', '');
        }
      });
      setLoading(false);
    } catch (error) {
      localStorage.setItem('selectedRows', '');
      navigate(
        `/project-logs?projectDetails=${projectId}`
      );
      handleError(error);
    }
  };

  return (
    <div className="procore-modal">
      <Modal isOpen={openModal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Select status !</ModalHeader>
        <ModalBody className="procore-modal-body">
          
            <Button color="secondary" onClick={handleExportToProcore}>
              Export To Procore
            </Button>
        </ModalBody>
      </Modal>
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
      {isLoading && <Loader showComponentLoader={true} />}
    </div>
  );
};

export default ExportToProcoreModal;