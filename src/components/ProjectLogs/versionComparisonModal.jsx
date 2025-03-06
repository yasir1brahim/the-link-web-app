import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { getVersionComparison } from '../../api/ProjectLogs/api';
import ComparisonItem from './comparisonItem';
const VersionComparisonModal = ({
    showVersionComparisonModal,
    toggleVersionComparisonModal,
    availableVersions,
    availableMasterformatNumbers,
}) => {
    const [oldVersion, setOldVersion] = useState(null);
    const [newVersion, setNewVersion] = useState(null);
    const [masterformatNumber, setMasterformatNumber] = useState(null);
    const [deletions, setDeletions] = useState([]);
    const [additions, setAdditions] = useState([]);
    const [modifications, setModifications] = useState([]);
    const [unchanged, setUnchanged] = useState([]);

    const handleGetVersionComparison = async () => {
        if (!oldVersion || !newVersion || !masterformatNumber) {
            console.log('oldVersion', oldVersion);
            console.log('newVersion', newVersion);
            console.log('masterformatNumber', masterformatNumber);
            alert('Please select two versions to compare and a MasterFormat number');
            return;
        }
        // TODO: Add loading state
        const response = await getVersionComparison(oldVersion, newVersion, masterformatNumber);
        console.log('response', response);
        setDeletions(response.data.deletions);
        setAdditions(response.data.additions);
        setModifications(response.data.modifications);
        setUnchanged(response.data.unchanged);
    }
    const dividerStyle = {
        width: '2px',
        padding: '0px',
        backgroundColor: '#333',
        borderLeft: '2px solid #333',
        borderRight: '2px solid #333'
    }

  return (
    <Modal
      isOpen={showVersionComparisonModal}
      fade={false}
      toggle={toggleVersionComparisonModal}
      className="new-user modal-xl"
    >
      <ModalHeader toggle={toggleVersionComparisonModal}>Version Comparison</ModalHeader>
      <ModalBody>
        <Form>
            <FormGroup>
                <Label>Old Version</Label>
                <Input type="select" value={oldVersion || ''} onChange={(e) => setOldVersion(e.target.value)}>
                    <option value="">Select a version...</option>
                    {availableVersions.map((version) => (
                        <option key={version.id} value={version.id}>{version.version_name}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label>New Version</Label>
                <Input type="select" value={newVersion || ''} onChange={(e) => setNewVersion(e.target.value)}>
                    <option value="">Select a version...</option>
                    {availableVersions.map((version) => (
                        <option key={version.id} value={version.id}>{version.version_name}</option>
                    ))}
                </Input>
            </FormGroup>
            <FormGroup>
                <Label>Masterformat Number</Label>
                <Input type="select" value={masterformatNumber || ''} onChange={(e) => setMasterformatNumber(e.target.value)}>
                    <option value="">Select a MasterFormat number...</option>
                    {availableMasterformatNumbers.map((number) => (
                        <option key={number} value={number}>{number}</option>
                    ))}
                </Input>
            </FormGroup>
            <div className="d-flex justify-content-between">
                <Button color="secondary" className="mb-3" onClick={toggleVersionComparisonModal}>Cancel</Button>
                <Button color="primary" className="mb-3" onClick={handleGetVersionComparison}>Get Version Comparison</Button>
            </div>
        </Form>
        <div className="d-flex justify-content-between">
            <div className="d-flex flex-column">
                <h5>{oldVersion?.version_name || ''}</h5>
            </div>
            <div className="d-flex flex-column">
                <h5>{newVersion?.version_name || ''}</h5>
            </div>
        </div>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Para No.</th>
                    <th>Submittal Title</th>
                    <th>Submittal Description</th>
                    <th style={dividerStyle}></th>
                    <th>Para No.</th>
                    <th>Submittal Title</th>
                    <th>Submittal Description</th>
                </tr>
            </thead>
            <tbody>
                {deletions.map((deletion) => (
                    <ComparisonItem key={deletion.id} submittalItem={deletion} isDeletion={true} dividerStyle={dividerStyle} />
                ))}
            </tbody>
        </table>
      </ModalBody>
    </Modal>
  )
}

export default VersionComparisonModal;