import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, FormGroup, Label, CustomInput } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EXCEL_HEADER_OPTIONS } from './../../constants';
import { CircularProgress } from '@mui/material';
import { getExcelExportHeader, upsertExcelExportHeader } from '../../api/ProjectLogs/api';


const ManageExcelExport = ({ manageExcelExportModal, toggleManageExcelExportModal }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    setItems(reorderedItems);
  };
  const handleCheckboxChange = (index) => {
    const updatedItems = [...items];
    updatedItems[index].default = !updatedItems[index].default;
    setItems(updatedItems);
  };
  const getExcelExportHeaderData = async () => {
    setIsLoading(true);
    const excelHeaderResp = await getExcelExportHeader();
    if (excelHeaderResp.data.options.length > 0) {
      setItems(excelHeaderResp.data.options);
    } else {
      setItems(EXCEL_HEADER_OPTIONS);
    }
    setIsLoading(false);
  }
  useEffect(() => {
    getExcelExportHeaderData();
  }, [])
  const handleSave = () => {
    handleUpsertExcelExportHeader();
    toggleManageExcelExportModal();
  };
  const handleUpsertExcelExportHeader = async () => {
    const upsertExcelHeaderResp = await upsertExcelExportHeader(items);
    if (upsertExcelHeaderResp.status === 200) {
      toast.success('Excel Export Header Updated Successfully', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
    }
  }
  return (
    <>
      <Modal
        isOpen={manageExcelExportModal}
        fade={false}
        toggle={toggleManageExcelExportModal}
        className="new-user modal-mg"
      >
        <ModalHeader toggle={toggleManageExcelExportModal}>
          Manage Excel Export
        </ModalHeader>
        <ModalBody>
          {isLoading && <CircularProgress sx={{ margin: '5px' }} size={16} />}
          <div className="create-user-content">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Row>
                      {items.map((item, index) => (
                        <Col key={item.id} xs="12" md="12">
                          <Draggable draggableId={item.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <FormGroup check>
                                  <Label check>
                                    <CustomInput
                                      type="checkbox"
                                      id={`checkbox-${item.id}`}
                                      label={item.name}
                                      checked={item.default}
                                      onChange={() => handleCheckboxChange(index)}
                                    />
                                  </Label>
                                </FormGroup>
                              </div>
                            )}
                          </Draggable>
                        </Col>
                      ))}
                    </Row>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleManageExcelExportModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
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
    </>
  );
};
export default ManageExcelExport;