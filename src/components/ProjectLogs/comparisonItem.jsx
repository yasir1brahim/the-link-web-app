import React from 'react';

const DELETION_COLOR = '#FFE8E8';
const ADDITION_COLOR = '#E8F5E9';
const MODIFICATION_COLOR = 'white';
const UNCHANGED_COLOR = '#F8F8F8';

export const TwoPaneComparisonItem = ({ 
    oldSubmittalItem,
    newSubmittalItem,
    isAddition,
    isDeletion,
    isUnchanged,
    isModification,
    textDifferences,
    paragraphDifferences,   
    dividerStyle
}) => {
    const color = isAddition ? ADDITION_COLOR : isModification ? MODIFICATION_COLOR : isDeletion ? DELETION_COLOR : isUnchanged ? UNCHANGED_COLOR : 'white';
    return (
        <tr>
            {isDeletion && (
                <>
                    <td style={{backgroundColor: color}}>{oldSubmittalItem.para_no}</td>
                    <td style={{backgroundColor: color}}>{oldSubmittalItem.item_desc}</td>
                    <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}>{oldSubmittalItem.para_context}</td>
                </>
            )}
            {isAddition && (
                <>
                    <td style={{backgroundColor: color}}></td>
                    <td style={{backgroundColor: color}}></td>
                    <td style={{backgroundColor: color}}></td>
                </>
            )}
            {isModification && (
                <>
                    <td style={{backgroundColor: color}}><OldParagraphDifferences paragraphDifferences={paragraphDifferences} /></td>
                    <td style={{backgroundColor: color}}>{oldSubmittalItem.item_desc}</td>
                    <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}><OldTextDifferences textDifferences={textDifferences} /></td>
                </>
            )}
            {isUnchanged && (
                <>
                    <td style={{backgroundColor: color}}>{oldSubmittalItem.para_no}</td>
                    <td style={{backgroundColor: color}}>{oldSubmittalItem.item_desc}</td>
                    <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}>{oldSubmittalItem.para_context}</td>
                </>
            )}
            <td style={dividerStyle}></td>
            {isDeletion && (
                <>
                    <td style={{backgroundColor: color}}></td>
                    <td style={{backgroundColor: color}}></td>
                    <td style={{backgroundColor: color}}></td>
                </>
            )}
            {isAddition && (
                <>
                    <td style={{backgroundColor: color}}>{newSubmittalItem.para_no}</td>
                    <td style={{backgroundColor: color}}>{newSubmittalItem.item_desc}</td>
                    <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}>{newSubmittalItem.para_context}</td>
                </>
            )}
            {isModification && (
                <>
                    <td style={{backgroundColor: color}}><NewParagraphDifferences paragraphDifferences={paragraphDifferences} /></td>
                    <td style={{backgroundColor: color}}>{newSubmittalItem.item_desc}</td>
                    <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}><NewTextDifferences textDifferences={textDifferences} /></td>
                </>
            )}
            {isUnchanged && (
                <>
                    <td style={{backgroundColor: color}}>{newSubmittalItem.para_no}</td>
                    <td style={{backgroundColor: color}}>{newSubmittalItem.item_desc}</td>
                    <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}>{newSubmittalItem.para_context}</td>
                </>
            )}
        </tr>
    );
};

export const SinglePaneComparisonItem = ({
    submittalItem,
    isAddition,
    isDeletion,
    isUnchanged,
    isModification,
    textDifferences,
    paragraphDifferences,   
}) => {
    const color = isAddition ? ADDITION_COLOR : isModification ? MODIFICATION_COLOR : isDeletion ? DELETION_COLOR : isUnchanged ? UNCHANGED_COLOR : 'white';
    return (
        <tr>
            <td style={{backgroundColor: color}}>
                {isModification ? <SinglePaneParagraphDifferences paragraphDifferences={paragraphDifferences} /> : submittalItem.para_no}
            </td>
            <td style={{backgroundColor: color}}>
                {submittalItem.item_desc}
            </td>
            <td style={{backgroundColor: color, whiteSpace: 'pre-wrap'}}>
                {isModification ? <SinglePaneTextDifferences textDifferences={textDifferences} /> : submittalItem.para_context}
            </td>
        </tr>
    );
};


const OldParagraphDifferences = ({ paragraphDifferences }) => {
    const filteredParagraphDifferences = paragraphDifferences.filter((difference) => difference.type === 'delete' || difference.type === 'equal');
    return (
        <>
            {filteredParagraphDifferences.map((difference, index) => (
                <span key={index} style={{backgroundColor: difference.type === 'delete' ? DELETION_COLOR : 'white'}}>
                    {difference.value}{index === filteredParagraphDifferences.length - 1 ? '' : '.'}
                </span>
            ))}
        </>
    );
};

const NewParagraphDifferences = ({ paragraphDifferences }) => {
    const filteredParagraphDifferences = paragraphDifferences.filter((difference) => difference.type === 'insert' || difference.type === 'equal');
    return (
        <>
            {filteredParagraphDifferences.map((difference, index) => (
                <span key={index} style={{backgroundColor: difference.type === 'insert' ? ADDITION_COLOR : 'white'}}>
                    {difference.value}{index === filteredParagraphDifferences.length - 1 ? '' : '.'}
                </span>
            ))}
        </>
    );
};

const SinglePaneParagraphDifferences = ({ paragraphDifferences }) => {
    return (
        <>
            {paragraphDifferences.map((difference, index) => (
                <span key={index} style={{backgroundColor: difference.type === 'insert' ? ADDITION_COLOR : 'white', textDecoration: difference.type === 'delete' ? 'line-through' : 'none'}}>
                    {difference.value}{index === paragraphDifferences.length - 1 ? '' : '.'}
                </span>
            ))}
        </>
    );
};

const SinglePaneTextDifferences = ({ textDifferences }) => {
    return (
        <>
            {textDifferences.map((difference, index) => (
                <span key={index} style={{backgroundColor: difference.type === 'insert' ? ADDITION_COLOR : 'white', textDecoration: difference.type === 'delete' ? 'line-through' : 'none'}}>
                    {difference.value}{index === textDifferences.length - 1 ? '' : ' '}
                </span>
            ))}
        </>
    );
};

const OldTextDifferences = ({ textDifferences }) => {
    const filteredTextDifferences = textDifferences.filter((difference) => difference.type === 'delete' || difference.type === 'equal');
    return (
        <>
            {filteredTextDifferences.map((difference, index) => (
                <span key={index} style={{backgroundColor: difference.type === 'delete' ? DELETION_COLOR : 'white'}}>
                    {difference.value}{index === filteredTextDifferences.length - 1 ? '' : ' '}
                </span>
            ))}
        </>
    );
};

const NewTextDifferences = ({ textDifferences }) => {
    const filteredTextDifferences = textDifferences.filter((difference) => difference.type === 'insert' || difference.type === 'equal');
    return (
        <>
            {filteredTextDifferences.map((difference, index) => (
                <span key={index} style={{backgroundColor: difference.type === 'insert' ? ADDITION_COLOR : 'white'}}>
                    {difference.value}{index === filteredTextDifferences.length - 1 ? '' : ' '}
                </span>
            ))}
        </>
    );
};
