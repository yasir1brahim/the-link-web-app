import React, { useState, useRef } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { EditIcon } from "../shared/icons/editIcon";
import { LaunchIcon } from '../shared/icons/launchIcon';
import { ArchiveIcon } from '../shared/icons/archiveIcon';


const VersionDropdown = ({ 
    availableVersions, 
    currentVersionId, 
    currentVersionName,
    onSelectVersion, 
    onPressEdit,
    onPressAddNewVersion,
    onPressArchive
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
            <DropdownMenu style={{ backgroundColor: 'white', width: '400px' }}>
                {availableVersions.map(version => (
                    <DropdownItem 
                        key={version.id} 
                        onClick={() => onSelectVersion(version.id)}
                        style={{ backgroundColor: 'white', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <div style = {{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                            <div>{version.version_name}</div>
                            <div>
                                <span
                                    onClick={() => onSelectVersion(version.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <LaunchIcon />
                                </span>
                                <span
                                    className="ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        onPressEdit(version.id)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <EditIcon />
                                </span>
                                {availableVersions.length > 1 && <span
                                    className="ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        onPressArchive(version.id)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <ArchiveIcon />
                                </span>}
                            </div>
                        </div>
                    </DropdownItem>
                ))}
                <DropdownItem
                    style={{ backgroundColor: 'white', borderTop: '1px solid #e0eaf7' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    onClick={onPressAddNewVersion}
                >
                    + Add New Version
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default VersionDropdown;