import React from "react";

const HeaderTabs = ({ isArchived, toggleArchive }) => {
  return (
    <div className="tabs-wrapper">
      <div onClick={() => toggleArchive(!isArchived)} className={`tab-padding ${!isArchived ? "tab-active" : "not-active"}`}>
        <p className="tab-content">All Projects</p>
      </div>
      <div onClick={() => toggleArchive(!isArchived)} className={`tab-padding  ${isArchived ? "tab-active" : "not-active"}`}>
        <p className="tab-content">Archived Projects</p>
      </div>
    </div>
  );
};

export default HeaderTabs;
