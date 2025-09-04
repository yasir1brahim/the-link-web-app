import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { EditIcon } from "../shared/icons/editIcon";
import { LaunchIcon } from '../shared/icons/launchIcon';
import { ArchiveIcon } from '../shared/icons/archiveIcon';
import { AddIcon } from '../shared/icons/AddIcon';
import StyledTooltip from '../shared/StyledTooltip/StyledTooltip';


const VersionDropdown = ({ 
    availableVersions, 
    currentVersionId, 
    currentVersionName,
    onSelectVersion, 
    onPressEdit,
    onPressAddNewVersion,
    onPressArchive,
    handleViewArchivedVersions
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    const isCurrentVersion = (versionId) => {
        return parseInt(versionId) === parseInt(currentVersionId);
    }

    return (
        <Dropdown isOpen={isOpen} toggle={toggle}>
            <DropdownToggle caret style={{ backgroundColor: 'white', border: '1px solid #e0eaf7', width: '400px' }}>
                {currentVersionName}
            </DropdownToggle>
            <DropdownMenu style={{ backgroundColor: 'white', width: '400px' , zIndex:'1500'}}>
                {availableVersions.map(version => {
                    const isCurrent = isCurrentVersion(version.id);
                    return (
                        <DropdownItem 
                            key={version.id} 
                            onClick={() => { 
                                if (!isCurrent) {
                                    onSelectVersion(version.id); 
                                    setIsOpen(false); 
                                }
                            }}
                            style={{ 
                                backgroundColor: isCurrent ? '#f8f9fa' : 'white', 
                                cursor: isCurrent ? 'default' : 'pointer', 
                                border: 'none', 
                                borderRadius: 0, 
                                padding: '8px 16px',
                                opacity: isCurrent ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isCurrent) {
                                    e.currentTarget.style.backgroundColor = '#e0eaf7';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isCurrent ? '#f8f9fa' : 'white';
                            }}
                        >
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '24px' }}>
                                <div style={{ 
                                    flex: 1, 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    marginRight: '12px',
                                    color: isCurrent ? '#6c757d' : 'inherit'
                                }}>
                                    {version.version_name}
                                    {isCurrent && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6c757d' }}>(Current)</span>}
                                </div>
                                <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <StyledTooltip title={isCurrent ? "Current Version" : "View"} arrow>
                                    <span 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (!isCurrent) {
                                                onSelectVersion(version.id); 
                                                setIsOpen(false); 
                                            }
                                        }} 
                                        style={{ 
                                            cursor: isCurrent ? 'default' : 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            opacity: isCurrent ? 0.5 : 1
                                        }}
                                    >
                                        <LaunchIcon />
                                    </span>
                                    </StyledTooltip>
                                    <StyledTooltip title="Edit" arrow>
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); onPressEdit(version.id); setIsOpen(false); }} 
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <EditIcon />
                                    </span>
                                    </StyledTooltip>

                                    {availableVersions.length > 1 && (
                                        <StyledTooltip title="Archive" arrow>
                                        <span 
                                            onClick={(e) => { e.stopPropagation(); onPressArchive(version.id); setIsOpen(false); }} 
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <ArchiveIcon />
                                        </span>
                                        </StyledTooltip>
                                    )}
                                </div>
                            </div>
                        </DropdownItem>
                    );
                })}
                <DropdownItem
                    style={{ backgroundColor: 'white', borderTop: '1px solid #e0eaf7', border: 'none', borderRadius: 0, padding: '8px 16px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    onClick={() => { onPressAddNewVersion(); setIsOpen(false); }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AddIcon /> Add New Version
                    </div>
                </DropdownItem>
                <DropdownItem
                    style={{ backgroundColor: 'white', borderTop: '1px solid #e0eaf7', border: 'none', borderRadius: 0, padding: '8px 16px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    onClick={() => { handleViewArchivedVersions(); setIsOpen(false); }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LaunchIcon /> View Archived Versions
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default VersionDropdown;