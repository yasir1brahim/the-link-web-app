const PersonalTile = ({projectName, handleLaunch, project, toggleUploadSpecsModal}) => {
  return (
    <div className="grid-view grid-view-personal">
      <div className="gv-heading-content">
        <h4 className="gv-project-name">{projectName}</h4>
        <span className="gv-project-type">Personal</span>
      </div>
      <div className="gv-body-content">
        <p className="gv-project-desc">
        </p>
        <div className="gv-project-logs">
          <button className="btn btn-primary" onClick={() => handleLaunch(project)}>
            Submittal Log
            <span className="log-arrow"></span>
          </button>
          <button className="btn btn-primary" disabled>
            Dashboard
            <span className="log-arrow"></span>
          </button>
        </div>
        <div className="gv-logs-upload">
          <form className="upload-document-form">
            <div className="upload-document-content">
              <div className="select-File">
                <input
                  className="d-none"
                  id="uploadDocs"
                  onClick={toggleUploadSpecsModal}
                />
                <label htmlFor="uploadDocs">
                  <div className="upload-text d-flex align-items-center justify-content-center">
                    <small className="upload-icon"></small>
                    <span className="upload-name" >Upload Specs</span>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalTile;
