import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const DrawingFilesModal = ({ isOpen, toggle, drawingFiles = [] }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="modal-lg">
      <ModalHeader toggle={toggle}>Drawing Files</ModalHeader>
      <ModalBody>
        {drawingFiles.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-striped" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 8px' }}>File Name</th>
                </tr>
              </thead>
              <tbody>
                {drawingFiles.map((file) => (
                  <tr key={file.id}>
                    <td style={{ fontSize: '14px', padding: '12px 8px' }}>
                      {file.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No drawing files uploaded yet.
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DrawingFilesModal;
