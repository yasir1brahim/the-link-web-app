import React from 'react';

const ComparisonItem = ({ 
    submittalItem,
    isAddition,
    isDeletion,
    isUnchanged,
    isModification,
    textDifferences,
    paragraphDifferences,   
    dividerStyle
}) => {
    const color = isAddition ? '#E8F5E9' : isModification ? '#FFF8E1' : isDeletion ? '#FFE8E8' : 'white';
    return (
        <tr>
            <td style={{backgroundColor: color}}>{submittalItem.para_no}</td>
            <td style={{backgroundColor: color}}>{submittalItem.item_desc}</td>
            <td style={{backgroundColor: color}}>{submittalItem.para_context}</td>
            <td style={dividerStyle}></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    );
};

export default ComparisonItem;