const ContractTile = ({
  ifSpecsUploaded,
  projectName,
  handleLaunch,
  project,
  toggleUploadSpecsModal,
  setSpecUploadProject
}) => {
  return (
    <div className="grid-view grid-view-contract">
      <div className="gv-heading-content">
        <h4 className="gv-project-name">{projectName}</h4>
        <span className="gv-project-type">Contract</span>
      </div>
      <div className="gv-body-content">
        <p className="gv-project-desc"></p>
        <div className="gv-project-logs">
          <button
            className="btn btn-primary"
            onClick={() => handleLaunch(project)}
            disabled={!ifSpecsUploaded}
          >
            Submittal Log
            <span className="log-arrow"></span>
          </button>
          <button className="btn btn-primary" 
           onClick={() => handleLaunch(project, true)}
          >
            QA Dashboard
            <span className="log-arrow"></span>
          </button>
        </div>
        <div className="gv-logs-upload">
          <form className="upload-document-form">
            <div className="upload-document-content">
              {/* <div className="select-File"  id="uploadDocs" onClick={toggleUploadSpecsModal}> */}
              {/* <input
                  className="d-none"
                  id="uploadDocs"
                  onClick={toggleUploadSpecsModal}
                /> */}
              {/* <label htmlFor="uploadDocs"> */}
              {/* <div className="upload-text d-flex align-items-center justify-content-center">
                    <small className="upload-icon"></small>
                    <span className="upload-name">Upload Specs</span>
                  </div> */}
              {/* </label> */}
              {/* </div> */}
              <button
                type="button"
                className={`btn btn-primary`}
                onClick={()=>{toggleUploadSpecsModal(); setSpecUploadProject(project)}}
                style={{width: `100%`}}
              >
                Upload Specs
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContractTile;
