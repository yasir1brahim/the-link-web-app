import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { getVersionComparison } from '../../api/ProjectLogs/api';
import { TwoPaneComparisonItem, SinglePaneComparisonItem } from './comparisonItem';
import CircularProgress from '@mui/material/CircularProgress';
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";


const VersionComparisonModal = ({
    showVersionComparisonModal,
    toggleVersionComparisonModal,
    availableVersions,
    availableMasterformatNumbers,
}) => {
    const [oldVersion, setOldVersion] = useState(null);
    const [oldVersionName, setOldVersionName] = useState('');
    const [newVersion, setNewVersion] = useState(null);
    const [newVersionName, setNewVersionName] = useState('');
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

    useEffect(() => {
        handleGetVersionComparison();
    }, [oldVersion, newVersion, masterformatNumber]);

    const dividerStyle = {
        width: '2%',
        padding: '0px',
        backgroundColor: 'white',
        border: 'none',
        borderTop: 'none',
        borderBottom: 'none',
    }

    const setOldVersionFromInput = (inputChangeEvent) => {
        setOldVersion(inputChangeEvent.target.value);
        setOldVersionName(inputChangeEvent.target.options[inputChangeEvent.target.selectedIndex].text);
    }

    const setNewVersionFromInput = (inputChangeEvent) => {
        setNewVersion(inputChangeEvent.target.value);
        setNewVersionName(inputChangeEvent.target.options[inputChangeEvent.target.selectedIndex].text);
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
      <ModalBody style={{maxHeight: '95vh', height: '95vh'}}>
        <Form>
            <Row>
                <Col>
                    <FormGroup>
                        <Label>Old Version</Label>
                        <SelectDropdown
                            label={'Old Version'}
                            setSelected={setOldVersionFromInput}
                            selected={oldVersion}
                            defaultInputValue={oldVersion}
                            options={availableVersions.map((version) => {
                                return {
                                    value: version?.id,
                                    label: version?.version_name,
                                };
                            })}
                            className="form-control"
                        />
                        {/* <Input type="select" value={oldVersion || ''} onChange={(e) => {
                            setOldVersion(e.target.value);
                            setOldVersionName(e.target.options[e.target.selectedIndex].text);
                        }}>
                            <option value="">Select a version...</option>
                            {availableVersions.map((version) => (
                                <option key={version.id} value={version.id}>{version.version_name}</option>
                            ))}
                        </Input> */}
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label>New Version</Label>
                        <Input type="select" value={newVersion || ''} onChange={(e) => {
                            setNewVersion(e.target.value);
                            setNewVersionName(e.target.options[e.target.selectedIndex].text);
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
            <TwoPaneComparison 
                deletions={deletions} 
                additions={additions} 
                modifications={modifications} 
                unchanged={unchanged} 
                oldVersion={oldVersion} 
                oldVersionName={oldVersionName}
                newVersion={newVersion} 
                newVersionName={newVersionName}
                dividerStyle={dividerStyle} 
            />
        )}
        
      </ModalBody>
    </Modal>
  )
}


const TwoPaneComparison = ({ 
    deletions, 
    additions, 
    modifications, 
    unchanged, 
    oldVersion, 
    oldVersionName, 
    newVersion, 
    newVersionName, 
    dividerStyle 
}) => {
    const empty = !deletions.length && !additions.length && !modifications.length && !unchanged.length;
    return (
        <>
        <div className="table-titles" style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <h5>{oldVersionName}</h5>
            </div>
            <div style={{ width: '2%' }}></div>  {/* Spacer to align with divider */}
            <div style={{ flex: 1 }}>
                <h5>{newVersionName}</h5>
            </div>
        </div>
        <table className="table table-bordered">
            <colgroup>
                {/* Left side columns */}
                <col style={{ width: '5%' }} />  {/* Para No. */}
                <col style={{ width: '10%' }} />  {/* Submittal Title */}
                <col style={{ width: '34%' }} />  {/* Submittal Description */}
                {/* Divider */}
                <col style={{ width: '2%' }} />   {/* Divider column */}
                {/* Right side columns */}
                <col style={{ width: '5%' }} />  {/* Para No. */}
                <col style={{ width: '10%' }} />  {/* Submittal Title */}
                <col style={{ width: '34%' }} />  {/* Submittal Description */}
            </colgroup>
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
                    <TwoPaneComparisonItem key={deletion.id} oldSubmittalItem={deletion} isDeletion={true} dividerStyle={dividerStyle} />
                ))}
                {additions.map((addition) => (
                    <TwoPaneComparisonItem key={addition.id} newSubmittalItem={addition} isAddition={true} dividerStyle={dividerStyle} />
                ))}
                {modifications.map((modification) => (
                    <TwoPaneComparisonItem 
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
                    <TwoPaneComparisonItem 
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


const SinglePaneComparison = ({ deletions, additions, modifications, unchanged, oldVersion, newVersion }) => {
    const empty = !deletions.length && !additions.length && !modifications.length && !unchanged.length;
    return (
        <>
        <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Para No.</th>
                    <th>Submittal Title</th>
                    <th>Submittal Description</th>
                </tr>
            </thead>
            <tbody>
                {empty && <tr><td colSpan="7" style={{textAlign: 'center'}}>No submittals in these versions</td></tr>}
                {deletions.map((deletion) => (
                    <SinglePaneComparisonItem key={deletion.id} submittalItem={deletion} isDeletion={true} />
                ))}
                {additions.map((addition) => (
                    <SinglePaneComparisonItem key={addition.id} submittalItem={addition} isAddition={true} />
                ))}
                {modifications.map((modification) => (
                    <SinglePaneComparisonItem 
                        key={modification.id}
                        submittalItem={modification.new_submittal} 
                        isModification={true} 
                        paragraphDifferences={modification.paragraph_number_differences}
                        textDifferences={modification.content_differences}
                    />
                ))}
                {unchanged.map((unchanged) => (
                    <SinglePaneComparisonItem 
                        key={unchanged.id}
                        submittalItem={unchanged}
                        isUnchanged={true}
                    />
                ))}
            </tbody>
        </table>
        </>
    )
}

export default VersionComparisonModal;