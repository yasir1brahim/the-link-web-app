import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { getVersionComparison } from '../../api/ProjectLogs/api';
import ComparisonItem from './comparisonItem';
import CircularProgress from '@mui/material/CircularProgress';

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
    const [isLoading, setIsLoading] = useState(false);
    const handleGetVersionComparison = async () => {
        if (!oldVersion || !newVersion || !masterformatNumber) {
            return;
        }
        setIsLoading(true);
        const response = await getVersionComparison(oldVersion, newVersion, masterformatNumber);
        console.log('response', response);
        setDeletions(response.data.deletions);
        setAdditions(response.data.additions);
        setModifications(response.data.modifications);
        setUnchanged(response.data.unchanged);
        setIsLoading(false);
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
      style={{maxWidth: '95%', width: '95%', maxHeight: '95vh'}}
      className="new-user version-comparison-modal"
    >
      <ModalHeader toggle={toggleVersionComparisonModal}>Version Comparison</ModalHeader>
      <ModalBody>
        <Form>
            <Row>
                <Col>
                    <FormGroup>
                        <Label>Old Version</Label>
                        <Input type="select" value={oldVersion || ''} onChange={(e) => {
                            setOldVersion(e.target.value);
                            handleGetVersionComparison();
                        }}>
                            <option value="">Select a version...</option>
                            {availableVersions.map((version) => (
                                <option key={version.id} value={version.id}>{version.version_name}</option>
                            ))}
                        </Input>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label>New Version</Label>
                        <Input type="select" value={newVersion || ''} onChange={(e) => {
                            setNewVersion(e.target.value);
                            handleGetVersionComparison();
                        }}>
                            <option value="">Select a version...</option>
                            {availableVersions.map((version) => (
                                <option key={version.id} value={version.id}>{version.version_name}</option>
                            ))}
                        </Input>
                    </FormGroup>
                </Col>
            </Row>
            <FormGroup>
                <Label>Masterformat Number</Label>
                <Input type="select" value={masterformatNumber || ''} onChange={(e) => {
                    setMasterformatNumber(e.target.value);
                    handleGetVersionComparison();
                }}>
                    <option value="">Select a MasterFormat number...</option>
                    {availableMasterformatNumbers.map((number) => (
                        <option key={number} value={number}>{number}</option>
                    ))}
                </Input>
            </FormGroup>
        </Form>
        {(!oldVersion || !newVersion || !masterformatNumber) && (
            <Row className="mt-5 mb-5 ml-5 mr-5"><p style={{margin: 'auto'}}>Select two versions and a MasterFormat number to compare differences</p></Row>
        )}
        {isLoading && <Row className="mt-5 mb-5 ml-5 mr-5"><CircularProgress style={{margin: 'auto'}}/></Row>}
        {oldVersion && newVersion && masterformatNumber && !isLoading && (
            <TwoPaneComparison deletions={deletions} additions={additions} modifications={modifications} unchanged={unchanged} oldVersion={oldVersion} newVersion={newVersion} dividerStyle={dividerStyle} />
        )}
        
      </ModalBody>
    </Modal>
  )
}


const TwoPaneComparison = ({ deletions, additions, modifications, unchanged, oldVersion, newVersion, dividerStyle }) => {
    const empty = !deletions.length && !additions.length && !modifications.length && !unchanged.length;
    return (
        <>
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
                {empty && <tr><td colSpan="7" style={{textAlign: 'center'}}>No submittals in these versions</td></tr>}
                {deletions.map((deletion) => (
                    <ComparisonItem key={deletion.id} oldSubmittalItem={deletion} isDeletion={true} dividerStyle={dividerStyle} />
                ))}
                {additions.map((addition) => (
                    <ComparisonItem key={addition.id} newSubmittalItem={addition} isAddition={true} dividerStyle={dividerStyle} />
                ))}
                {modifications.map((modification) => (
                    <ComparisonItem 
                        key={modification.id}
                        oldSubmittalItem={modification.old_submittal} 
                        newSubmittalItem={modification.new_submittal} 
                        isModification={true} 
                        dividerStyle={dividerStyle} 
                        paragraphDifferences={modification.paragraph_number_differences}
                        textDifferences={modification.content_differences}
                    />
                ))}
                {unchanged.map((unchanged) => (
                    <ComparisonItem 
                        key={unchanged.id}
                        oldSubmittalItem={unchanged}
                        newSubmittalItem={unchanged}
                        isUnchanged={true}
                        dividerStyle={dividerStyle}
                    />
                ))}
            </tbody>
        </table>
        </>
    )
}
export default VersionComparisonModal;