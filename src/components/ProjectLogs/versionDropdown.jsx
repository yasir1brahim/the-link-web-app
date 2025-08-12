import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { EditIcon } from "../shared/icons/editIcon";
import { LaunchIcon } from '../shared/icons/launchIcon';
import { ArchiveIcon } from '../shared/icons/archiveIcon';
import { AddIcon } from '../shared/icons/AddIcon';


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


    return (
        <Dropdown isOpen={isOpen} toggle={toggle}>
            <DropdownToggle caret style={{ backgroundColor: 'white', border: '1px solid #e0eaf7', width: '400px' }}>
                {currentVersionName}
            </DropdownToggle>
            <DropdownMenu style={{ backgroundColor: 'white', width: '400px' , zIndex:'1500'}}>
                {availableVersions.map(version => (
                    <DropdownItem 
                        key={version.id} 
                        onClick={() => { onSelectVersion(version.id); setIsOpen(false); }}
                        style={{ backgroundColor: 'white', cursor: 'pointer', border: 'none', borderRadius: 0, padding: '8px 16px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '24px' }}>
                            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '12px' }}>{version.version_name}</div>
                            <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span 
                                    onClick={(e) => { e.stopPropagation(); onSelectVersion(version.id); setIsOpen(false); }} 
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <LaunchIcon />
                                </span>
                                <span 
                                    onClick={(e) => { e.stopPropagation(); onPressEdit(version.id); setIsOpen(false); }} 
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <EditIcon />
                                </span>
                                {availableVersions.length > 1 && (
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); onPressArchive(version.id); setIsOpen(false); }} 
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <ArchiveIcon />
                                    </span>
                                )}
                            </div>
                        </div>
                    </DropdownItem>
                ))}
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