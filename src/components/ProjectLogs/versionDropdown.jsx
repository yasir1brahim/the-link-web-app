import React, { useState, useRef } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { EditIcon } from "../shared/icons/editIcon";
import { LaunchIcon } from '../shared/icons/launchIcon';


const VersionDropdown = ({ 
    availableVersions, 
    currentVersionId, 
    currentVersionName,
    onSelectVersion, 
    onPressEdit,
    onPressAddNewVersion
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => {
        setIsOpen(!isOpen);
    }


    return (
        <Dropdown isOpen={isOpen} toggle={toggle}>
            <DropdownToggle caret style={{ backgroundColor: 'white', border: '1px solid #e0eaf7', width: '350px' }}>
                {currentVersionName}
            </DropdownToggle>
            <DropdownMenu style={{ backgroundColor: 'white', width: '350px' }}>
                {availableVersions.map(version => (
                    <DropdownItem 
                        key={version.id} 
                        onClick={() => {}}
                        toggle={false}
                        style={{ backgroundColor: 'white', cursor: 'default' }}
                    >
                        <div className="row" style = {{width: '100%'}}>
                            <div className="col-10">{version.version_name}</div>
                            <div className="col-2">
                                <span
                                    onClick={() => onSelectVersion(version.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <LaunchIcon />
                                </span>
                                <span
                                    className="ml-2"
                                    onClick={() => {
                                        setIsOpen(false);
                                        onPressEdit(version.id)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <EditIcon />
                                </span>
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