import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { getVersionComparison, getFilteredVersionComparison } from '../../api/ProjectLogs/api';
import { TwoPaneComparisonItem, SinglePaneComparisonItem } from './comparisonItem';
import CircularProgress from '@mui/material/CircularProgress';
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const VersionComparisonModal = ({
    showVersionComparisonModal,
    toggleVersionComparisonModal,
    availableVersions,
    availableMasterformatNumbers,
    versionComparisonSearchFlagActive
}) => {
    const [oldVersion, setOldVersion] = useState(null);
    const [oldVersionName, setOldVersionName] = useState('');
    const [newVersion, setNewVersion] = useState(null);
    const [newVersionName, setNewVersionName] = useState('');
    const [onlyDifferences, setOnlyDifferences] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [masterformatNumber, setMasterformatNumber] = useState(null);

    const [fullComparison, setFullComparison] = useState([]);
    const [masterformatNumbersWithDifferences, setMasterformatNumbersWithDifferences] = useState(availableMasterformatNumbers);
    const [differences, setDifferences] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetVersionComparison = async () => {
        if (!oldVersion || !newVersion || !masterformatNumber) {
            return;
        }
        setIsLoading(true);
        const response = await getVersionComparison(oldVersion, newVersion, masterformatNumber);
        console.log('response', response);
        setDifferences(response.data.differences);
        setIsLoading(false);
    }

    const clearFilters = () => {
        setOnlyDifferences(false);
        setSearchTerm('');
        setFullComparison([]);
        setMasterformatNumbersWithDifferences(availableMasterformatNumbers);
    }

    useEffect(() => {
        setFullComparison([]);
        setMasterformatNumbersWithDifferences(availableMasterformatNumbers);
    }, [onlyDifferences, searchTerm]);

    const handleGetFilteredVersionComparison = async () => {
        setMasterformatNumber(null);
        if (!oldVersion || !newVersion) {
            alert('Please select two versions to compare');
            return;
        }
        if (!onlyDifferences && !searchTerm) {
            clearFilters();
            handleGetVersionComparison();
            return;
        }
        setIsLoading(true);
        const response = await getFilteredVersionComparison(oldVersion, newVersion, onlyDifferences, searchTerm);
        console.log('response', response);
        setFullComparison(response.data.comparison);
        setMasterformatNumbersWithDifferences(response.data.masterformat_numbers_with_desired_differences);
        setIsLoading(false);
    }

    useEffect(() => {
        if (fullComparison.length > 0) {
            const item = fullComparison.filter(item => item.masterformat_number === masterformatNumber)
            if (item.length > 0) {
                setDifferences(item[0].differences);
            } else {
                setDifferences([]);
            }
        } else {
            handleGetVersionComparison();
        }
    }, [masterformatNumber]);

    const dividerStyle = {
        width: '2%',
        padding: '0px',
        backgroundColor: 'white',
        border: 'none',
        borderTop: 'none',
        borderBottom: 'none',
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
                        <Label>Old Version *</Label>
                        <Input type="select" value={oldVersion || ''} onChange={(e) => {
                            setOldVersion(e.target.value);
                            setOldVersionName(e.target.options[e.target.selectedIndex].text);
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
                        <Label>New Version *</Label>
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
            <Row>
                <Col>
                    <FormGroup>
                        <Label>Only show differences</Label>
                        <Input type="checkbox" checked={onlyDifferences} onChange={(e) => setOnlyDifferences(e.target.checked)} />
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label>Search</Label>
                        <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </FormGroup>
                </Col>
                <Col>
                    <Button onClick={handleGetFilteredVersionComparison}>Filter</Button>
                </Col>
            </Row>
            
            <FormGroup>
                <Label>Spec Section *</Label>
                <MasterformatNumberSelector availableMasterformatNumbers={masterformatNumbersWithDifferences} masterformatNumber={masterformatNumber} setMasterformatNumber={setMasterformatNumber} />
            </FormGroup>
        </Form>
        {(!oldVersion || !newVersion || !masterformatNumber) && (
            <Row className="mt-5 mb-5 ml-5 mr-5"><p style={{margin: 'auto'}}>Select two versions and a spec section to compare differences</p></Row>
        )}
        {isLoading && <Row className="mt-5 mb-5 ml-5 mr-5"><CircularProgress style={{margin: 'auto'}}/></Row>}
        {oldVersion && newVersion && masterformatNumber && !isLoading && (
            <>
                <TwoPaneComparison 
                    differences={differences} 
                    oldVersion={oldVersion} 
                    oldVersionName={oldVersionName}
                    newVersion={newVersion} 
                    newVersionName={newVersionName}
                    dividerStyle={dividerStyle} 
                />
                <MasterformatNumberPager availableMasterformatNumbers={masterformatNumbersWithDifferences} currentMasterformatNumber={masterformatNumber} setMasterformatNumber={setMasterformatNumber} />
            </>
        )}
      </ModalBody>
    </Modal>
  )
}


const TwoPaneComparison = ({ 
    differences, 
    oldVersion, 
    oldVersionName, 
    newVersion, 
    newVersionName, 
    dividerStyle 
}) => {
    const empty = !differences.length;
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
                {differences.map(difference => {
                    if (difference.difference_type === 'deletion') {
                        return (
                            <TwoPaneComparisonItem key={difference.id} oldSubmittalItem={difference.old_submittal} isDeletion={true} dividerStyle={dividerStyle} />
                        )
                    } else if (difference.difference_type === 'addition') {
                        return (
                            <TwoPaneComparisonItem key={difference.id} newSubmittalItem={difference.new_submittal} isAddition={true} dividerStyle={dividerStyle} />
                        )
                    } else if (difference.difference_type === 'modification') {
                        return (
                            <TwoPaneComparisonItem 
                                key={difference.id} 
                                oldSubmittalItem={difference.old_submittal} 
                                newSubmittalItem={difference.new_submittal} 
                                isModification={true} 
                                dividerStyle={dividerStyle} 
                                paragraphDifferences={difference.paragraph_number_differences}
                                textDifferences={difference.content_differences}
                            />
                        )
                    } else if (difference.difference_type === 'unchanged') {
                        return (
                            <TwoPaneComparisonItem 
                                key={difference.id}
                                oldSubmittalItem={difference.old_submittal}
                                newSubmittalItem={difference.new_submittal}
                                isUnchanged={true}
                                dividerStyle={dividerStyle}
                            />
                        )
                    }
                })}
            </tbody>
        </table>
        </>
    )
}


const formatSpecSection = (specSection) => {
    if (typeof specSection !== "string") return specSection;
    return specSection.slice(0, 2) + " " + specSection.slice(2, 4) + " " + specSection.slice(4);
};

const MasterformatNumberSelector = ({ availableMasterformatNumbers, masterformatNumber, setMasterformatNumber, centerText = false }) => {
    return (
        <Input type="select" style={{minWidth: '125px', textAlign: centerText ? 'center' : 'left', textAlignLast: centerText ? 'center' : 'left'}} value={masterformatNumber || ''} onChange={(e) => {
            setMasterformatNumber(e.target.value);
        }}>
            <option value="">Select a spec section...</option>
            {availableMasterformatNumbers.map((number) => (
                <option key={number} value={number}>{formatSpecSection(number)}</option>
            ))}
        </Input>
    )
}

const MasterformatNumberPager = ({ availableMasterformatNumbers, currentMasterformatNumber, setMasterformatNumber }) => {
    const index = availableMasterformatNumbers.findIndex(number => number === currentMasterformatNumber);
    return (
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: 'auto', paddingBottom: '10px'}}>
            <Button 
                style={{display: 'flex', alignItems: 'center', justifyContent: 'left', minWidth: '125px'}} 
                onClick={() => setMasterformatNumber(availableMasterformatNumbers[index - 1])}
                disabled={index === 0}
            >
                <ArrowBack style={{marginRight: '5px'}}/>
                {formatSpecSection(availableMasterformatNumbers[index - 1])}
            </Button>
            <div style={{display: 'flex', width: '125px'}}>
                <MasterformatNumberSelector availableMasterformatNumbers={availableMasterformatNumbers} masterformatNumber={currentMasterformatNumber} setMasterformatNumber={setMasterformatNumber} />
            </div>
            <Button 
                style={{display: 'flex', alignItems: 'center', justifyContent: 'right', minWidth: '125px'}} 
                onClick={() => setMasterformatNumber(availableMasterformatNumbers[index + 1])}
                disabled={index === availableMasterformatNumbers.length - 1}
            >
                {formatSpecSection(availableMasterformatNumbers[index + 1])}
                <ArrowForward style={{marginLeft: '5px'}}/>
            </Button>
        </div>
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