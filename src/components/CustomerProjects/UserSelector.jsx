import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { CircularProgress } from '@mui/material';

const UserSelector = ({ selectedUsers, setSelectedUsers, employeeList, isLoading, placeholderText }) => {
    return (
    <div className="users-section">
        <div className="form-group">
        <Typeahead
            multiple
            selected={selectedUsers}
            onChange={setSelectedUsers}
            options={employeeList.map((employee) => ({
                value: employee.user_id,
                label: employee.display_name,
            }))}
            placeholder={placeholderText}
            id="add-employees"
        />
        </div>
        <span className="icon-locate">
        {isLoading ? (
            <CircularProgress size={12} />
        ) : (
            <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path
                d="M6.99998 13.6666C3.31798 13.6666 0.333313 10.682 0.333313 6.99998C0.333313 3.31798 3.31798 0.333313 6.99998 0.333313C10.682 0.333313 13.6666 3.31798 13.6666 6.99998C13.6666 10.682 10.682 13.6666 6.99998 13.6666ZM6.33331 6.33331H3.66665V7.66665H6.33331V10.3333H7.66665V7.66665H10.3333V6.33331H7.66665V3.66665H6.33331V6.33331Z"
                fill="#676F74"
            />
            </svg>
        )}
        </span>
        <span className="icon-right-locate">
        <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M9.16671 0.64168C9.01057 0.486471 8.79936 0.399353 8.57921 0.399353C8.35905 0.399353 8.14784 0.486471 7.99171 0.64168L5.00004 3.59168L2.05004 0.64168C1.8939 0.486471 1.68269 0.399353 1.46254 0.399353C1.24238 0.399353 1.03117 0.486471 0.875039 0.64168C0.796932 0.719149 0.734936 0.811317 0.692629 0.912866C0.650322 1.01442 0.62854 1.12334 0.62854 1.23335C0.62854 1.34336 0.650322 1.45228 0.692629 1.55383C0.734936 1.65538 0.796932 1.74754 0.875039 1.82501L4.40837 5.35835C4.48584 5.43645 4.57801 5.49845 4.67956 5.54076C4.78111 5.58306 4.89003 5.60485 5.00004 5.60485C5.11005 5.60485 5.21897 5.58306 5.32052 5.54076C5.42207 5.49845 5.51424 5.43645 5.59171 5.35835L9.16671 1.82501C9.24481 1.74754 9.30681 1.65538 9.34911 1.55383C9.39142 1.45228 9.41321 1.34336 9.41321 1.23335C9.41321 1.12334 9.39142 1.01442 9.34911 0.912866C9.30681 0.811317 9.24481 0.719149 9.16671 0.64168Z"
            fill="#0E2332"
            />
        </svg>
        </span>
    </div>
    );
};

export default UserSelector;