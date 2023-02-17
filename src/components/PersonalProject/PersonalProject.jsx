import React from "react";
import ContractTile from "./contractTile";
import PersonalTile from "./personalTile";

const PersonalProject = ({ toggleSlider, slider, projectData, handleLaunch, toggleUploadSpecsModal }) => {
  console.log(projectData);

  return (
    <div className="personal-projects-content">
      <div className="grid-top-content">
        <label className="table-entries">
          Showing entries
          <span className="showing-strong"> 04 </span>
          of <span className="showing-strong"> 04 </span>
        </label>
        <div className="grid-list-toggle">
          <span className="tag-list-view">List View</span>
          <div className="gl-toggle-wrapper">
            <label class="switch">
              <input type="checkbox" />
              <span
                class="slider round"
                onClick={() => toggleSlider(!slider)}
              ></span>
            </label>
          </div>
          <span className="tag-list-view">Grid View</span>
        </div>
      </div>

      <div className="grid-view-content">
        <div className="row">
          {projectData &&
            projectData.length > 0 &&
            projectData.map((data, index) => {
              if (data.visibility_type === "contract") {
                return (
                  <div className="col-4">
                    <ContractTile projectName={data.project_name} handleLaunch={handleLaunch} project={data} toggleUploadSpecsModal={toggleUploadSpecsModal} />
                  </div>
                );
              }
              return (
                <div className="col-4">
                  <PersonalTile projectName={data.project_name} handleLaunch={handleLaunch} project={data} toggleUploadSpecsModal={toggleUploadSpecsModal}/>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PersonalProject;
