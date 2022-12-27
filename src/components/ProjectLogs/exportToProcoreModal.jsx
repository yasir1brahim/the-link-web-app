import React, { useEffect, useState } from "react";
import { get } from "lodash";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import axiosInstance from "../../config/axios";
import { useNavigate } from "react-router";

const ExportToProcoreModal = () => {
  const [openModal, setOpenModal] = useState(true);
  const toggle = () => setOpenModal(!openModal);
  const accesToken = localStorage.getItem("procore_access_token");
  const [selectStatus, setSelectStatus] = useState("");
  const [status, setStatus] = useState([]);
  const navigate = useNavigate();

  const companyId = localStorage.getItem("companyId");
  const projectId = localStorage.getItem("projectId");
  const customerId = localStorage.getItem('customerId');
  const logType = localStorage.getItem('logType');

  useEffect(() => {
    const getProcoreStatus = async () => {
      try {
        await axios({
          method: "get",
          url: `https://sandbox.procore.com/rest/v1.0/companies/${companyId}/submittal_statuses`,
          headers: {
            Authorization: `Bearer ${accesToken}`,
          },
        }).then((res) => {
          setStatus(get(res, "data"));
        });
      } catch (error) {
        toast.error("Something went wrong!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };
    if (companyId) {
      getProcoreStatus();
    }
  }, [companyId]);

  const handleExportToProcore = async () => {
    const selectedRows = sessionStorage.getItem('selectedRows');
    try {
      await axiosInstance({
        method: "post",
        url: "/procore/create_submittals",
        data: {
          project_id: projectId,
          records: selectedRows && selectedRows.length > 0 ? JSON.parse(selectedRows) : "All", // array of ids
          status_id: get(selectStatus,`${[0]}.value`),
        },
      }).then((resp)=>{
        if(resp.status === 200){
          toast.success('the records are successfully exported');
          toggle();
          navigate(`/project-logs?projectId=${projectId}&customerId=${customerId}&logType=${logType}`)
        };
        });
    } catch (error) {
      toast.error("Something went wrong!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="procore-modal">
      <Modal isOpen={openModal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Looks Good !</ModalHeader>
        <ModalBody className="procore-modal-body">
          {status && status.length > 0 && (
            <SelectDropdown
              value={selectStatus}
              selected={selectStatus}
              setSelected={setSelectStatus}
              options={status?.map((st) => {
                return {
                  label: st.name,
                  value: st.id,
                };
              })}
              className="form-control"
            />
          )}
          {selectStatus && (
            <Button color="secondary" onClick={handleExportToProcore}>
              Export To Procore
            </Button>
          )}
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
    </div>
  );
};

export default ExportToProcoreModal;
