import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col, Card, CardHeader, CardBody, Collapse } from 'reactstrap';
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
    if (versionComparisonSearchFlagActive) {
        return <VersionComparisonModalWithSearch
            showVersionComparisonModal={showVersionComparisonModal}
            toggleVersionComparisonModal={toggleVersionComparisonModal}
            availableVersions={availableVersions}
            availableMasterformatNumbers={availableMasterformatNumbers}
        />
    } else {
        return <VersionComparisonModalWithoutSearch
            showVersionComparisonModal={showVersionComparisonModal}
            toggleVersionComparisonModal={toggleVersionComparisonModal}
            availableVersions={availableVersions}
            availableMasterformatNumbers={availableMasterformatNumbers}
        />
    }
}

const VersionComparisonModalWithSearch = ({
    showVersionComparisonModal,
    toggleVersionComparisonModal,
    availableVersions,
    availableMasterformatNumbers
}) => {
    const [oldVersion, setOldVersion] = useState(null);
    const [oldVersionName, setOldVersionName] = useState('');
    const [newVersion, setNewVersion] = useState(null);
    const [newVersionName, setNewVersionName] = useState('');
    const [onlyDifferences, setOnlyDifferences] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [masterformatNumber, setMasterformatNumber] = useState(null);
    const [filterMessage, setFilterMessage] = useState('');
    const [fullComparison, setFullComparison] = useState([]);
    const [masterformatNumbersWithDifferences, setMasterformatNumbersWithDifferences] = useState(availableMasterformatNumbers);
    const [differences, setDifferences] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filterCollapseOpen, setFilterCollapseOpen] = useState(true);
    const toggleFilterCollapse = () => setFilterCollapseOpen(!filterCollapseOpen);

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
        handleGetVersionComparison();
    }

    const handleGetFilteredVersionComparison = async () => {
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
        if (masterformatNumber == null) {
            if (response.data.comparison.length > 0) {
                setMasterformatNumber(response.data.comparison[0].masterformat_number);
                setDifferences(response.data.comparison[0].differences);
            } else {
                setDifferences([]);
            }
        }
        else if (response.data.masterformat_numbers_with_desired_differences.includes(masterformatNumber)) {
            setDifferences(response.data.comparison.filter(item => item.masterformat_number === masterformatNumber)[0].differences);
            setMasterformatNumbersWithDifferences(response.data.masterformat_numbers_with_desired_differences);
        } else {
            setDifferences([]);
            setMasterformatNumbersWithDifferences([masterformatNumber, ...response.data.masterformat_numbers_with_desired_differences]);
        }
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

    useEffect(() => {
        setFilterMessage(constructFilterMessage());
    }, [fullComparison, isLoading]);

    const constructFilterMessage = () => {
        if (!onlyDifferences && !searchTerm) {
            return ``;
        } else if (onlyDifferences && !searchTerm) {
            if (isLoading) {
                return 'Hiding unchanged submittals...';
            } else {
                return `Found ${fullComparison ? fullComparison.reduce((acc, item) => acc + item.differences.length, 0) : 0} changes across ${fullComparison?.length || ''} spec section${fullComparison?.length === 1 ? '' : 's'}`;
            }
        } else if (onlyDifferences && searchTerm) {
            if (isLoading) {
                return `Searching for changes containing keyword: ${searchTerm}...`;
            } else {
                return `Found ${fullComparison ? fullComparison.reduce((acc, item) => acc + item.differences.length, 0) : 0} changes containing "${searchTerm}" across ${fullComparison?.length || ''} spec section${fullComparison?.length === 1 ? '' : 's'}`;
            }
        } else if (!onlyDifferences && searchTerm) {
            if (isLoading) {
                return `Searching for submittals containing keyword: ${searchTerm}...`;
            } else {
                return `Found ${fullComparison ? fullComparison.reduce((acc, item) => acc + item.differences.length, 0) : 0} submittals containing "${searchTerm}" across ${fullComparison?.length || ''} spec section${fullComparison?.length === 1 ? '' : 's'}`;
            }
        }
    }

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
            <Card className="mb-3">
                <CardHeader 
                    onClick={toggleFilterCollapse} 
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}
                >
                    <strong>Display options</strong>
                    <span style={{marginLeft: '10px'}}>{filterCollapseOpen ? '▼' : '►'}</span>
                </CardHeader>
                <Collapse isOpen={filterCollapseOpen}>
                    <CardBody>
                        <Row style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Col>
                                <FormGroup style={{display: 'flex', flexDirection: 'column', alignItems: 'left', marginBottom: '0px', paddingLeft: '5px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}} onClick={() => setOnlyDifferences(false)}>
                                        <Input 
                                            type="radio" 
                                            name="showDifferences" 
                                            style={{
                                                width: '24px', 
                                                height: '24px', 
                                                marginRight: '8px', 
                                                marginTop: '0px', 
                                                marginLeft: '0px',
                                            }} 
                                            checked={!onlyDifferences} 
                                            onChange={() => setOnlyDifferences(false)} 
                                        />
                                        <Label style={{marginBottom: '0px', fontSize: '90%'}}>Show unchanged submittal items</Label>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', marginRight: '15px'}} onClick={() => setOnlyDifferences(true)}>
                                        <Input 
                                            type="radio" 
                                            name="showDifferences" 
                                            style={{
                                                width: '24px', 
                                                height: '24px', 
                                                marginRight: '8px', 
                                                marginTop: '0px', 
                                                marginLeft: '0px',
                                            }} 
                                            checked={onlyDifferences} 
                                            onChange={() => setOnlyDifferences(true)} 
                                        />
                                        <Label style={{marginBottom: '0px', fontSize: '90%'}}>Hide unchanged submittal items</Label>
                                    </div>
                                </FormGroup>
                            </Col>
                            <Col>
                                <FormGroup style={{marginBottom: '0px'}}>
                                    <label htmlFor="searchTerm">
                                        Filter to submittal items containing keyword:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="searchTerm"
                                        aria-describedby="searchTerm"
                                        placeholder="Keyword"
                                        defaultValue={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row style={{display: 'flex', justifyContent: 'flex-start', marginTop: '15px', marginLeft: '0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}>
                            <Button color="primary" style={{minWidth: '125px'}} onClick={handleGetFilteredVersionComparison}>Apply</Button>
                            {fullComparison.length > 0 && <Button color="secondary" style={{minWidth: '125px', marginLeft: '20px'}} onClick={clearFilters}>Reset</Button>}
                        </Row>
                    </CardBody>
                </Collapse>
            </Card>

            <Row style={{display: 'flex', justifyContent: 'flex-start', marginTop: '5px', marginBottom: '15px', marginLeft: '0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}><i>{filterMessage}</i></Row>

            
            {!isLoading && <FormGroup>
                <Label>Spec Section *</Label>
                <MasterformatNumberSelector availableMasterformatNumbers={masterformatNumbersWithDifferences} masterformatNumber={masterformatNumber} setMasterformatNumber={setMasterformatNumber} />
            </FormGroup>}
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
                    filteredByDifferences={onlyDifferences}
                    filteredByKeyword={!!searchTerm}
                />
                <MasterformatNumberPager availableMasterformatNumbers={masterformatNumbersWithDifferences} currentMasterformatNumber={masterformatNumber} setMasterformatNumber={setMasterformatNumber} />
            </>
        )}
      </ModalBody>
    </Modal>
  )
}


const VersionComparisonModalWithoutSearch = ({
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
                <Label>Spec Section</Label>
                <MasterformatNumberSelector availableMasterformatNumbers={availableMasterformatNumbers} masterformatNumber={masterformatNumber} setMasterformatNumber={setMasterformatNumber} />
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
                <MasterformatNumberPager availableMasterformatNumbers={availableMasterformatNumbers} currentMasterformatNumber={masterformatNumber} setMasterformatNumber={setMasterformatNumber} />
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
    dividerStyle,
    filteredByDifferences = false,
    filteredByKeyword = false,
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
                {empty && <tr><td colSpan="7" style={{textAlign: 'center'}}>
                    {filteredByKeyword ? 'No differences matching keyword' : filteredByDifferences ? 'No differences in this spec section' : 'No submittals in this spec section'}
                </td></tr>}
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