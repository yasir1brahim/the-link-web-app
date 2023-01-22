import React, { useState } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';

const PersonalProject = () => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content personal-projects-wrapper">
          <Header
            title={`Project Details`}
            showBtn={'Add Personal Project'}
          />

          <div className="personal-projects-content">
            <div className="grid-top-content">
              <label className="table-entries">
                Showing entries
                <span className="showing-strong"> 04 </span>
                of{' '}
                <span className="showing-strong"> 04 </span>
              </label>
              <div className="grid-list-toggle">
                <span className="tag-list-view">List View</span>
                <div className="gl-toggle-wrapper">
                  <label class="switch">
                    <input type="checkbox" />
                    <span class="slider round"></span>
                  </label>
                </div>
                <span className="tag-list-view">Grid View</span>
              </div>
            </div>

            <div className="grid-view-content">
              <div className="row">
                <div className="col-4">
                  <div className="grid-view grid-view-personal">
                    <div className="gv-heading-content">
                      <h4 className="gv-project-name">Project Details</h4>
                      <span className="gv-project-type">Personal</span>
                    </div>
                    <div className="gv-body-content">
                      <p className="gv-project-desc">
                        Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel
                      </p>
                      <div className="gv-project-logs">
                        <button className="btn btn-primary">
                          Submittal Log
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Dashboard
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          QA View
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Collaboration Hub
                          <span className="log-arrow"></span>
                        </button>
                      </div>
                      <div className="gv-logs-upload">
                        <form className="upload-document-form">
                          <div className="upload-document-content">
                            <div className="select-File">
                              <input
                                className="d-none"
                                type="file"
                                // name="files[]"
                                id="uploadDocs"
                                accept="application/pdf"
                                multiple
                              />
                              <label htmlFor="uploadDocs">
                                <div className="upload-text d-flex align-items-center justify-content-center">
                                  <small className="upload-icon"></small>
                                  <span className="upload-name">Upload Specs</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="grid-view grid-view-contract">
                    <div className="gv-heading-content">
                      <h4 className="gv-project-name">Project Details</h4>
                      <span className="gv-project-type">Contract</span>
                    </div>
                    <div className="gv-body-content">
                      <p className="gv-project-desc">
                        Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel
                      </p>
                      <div className="gv-project-logs">
                        <button className="btn btn-primary">
                          Submittal Log
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Dashboard
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          QA View
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Collaboration Hub
                          <span className="log-arrow"></span>
                        </button>
                      </div>
                      <div className="gv-logs-upload">
                        <form className="upload-document-form">
                          <div className="upload-document-content">
                            <div className="select-File">
                              <input
                                className="d-none"
                                type="file"
                                // name="files[]"
                                id="uploadDocs"
                                accept="application/pdf"
                                multiple
                              />
                              <label htmlFor="uploadDocs">
                                <div className="upload-text d-flex align-items-center justify-content-center">
                                  <small className="upload-icon"></small>
                                  <span className="upload-name">Upload Specs</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="grid-view grid-view-contract">
                    <div className="gv-heading-content">
                      <h4 className="gv-project-name">Project Details</h4>
                      <span className="gv-project-type">Contract</span>
                    </div>
                    <div className="gv-body-content">
                      <p className="gv-project-desc">
                        Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel
                      </p>
                      <div className="gv-project-logs">
                        <button className="btn btn-primary">
                          Submittal Log
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Dashboard
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          QA View
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Collaboration Hub
                          <span className="log-arrow"></span>
                        </button>
                      </div>
                      <div className="gv-logs-upload">
                        <form className="upload-document-form">
                          <div className="upload-document-content">
                            <div className="select-File">
                              <input
                                className="d-none"
                                type="file"
                                // name="files[]"
                                id="uploadDocs"
                                accept="application/pdf"
                                multiple
                              />
                              <label htmlFor="uploadDocs">
                                <div className="upload-text d-flex align-items-center justify-content-center">
                                  <small className="upload-icon"></small>
                                  <span className="upload-name">Upload Specs</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="grid-view grid-view-personal">
                    <div className="gv-heading-content">
                      <h4 className="gv-project-name">Project Details</h4>
                      <span className="gv-project-type">Personal</span>
                    </div>
                    <div className="gv-body-content">
                      <p className="gv-project-desc">
                        Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel Lorel Ipsum Dorel
                      </p>
                      <div className="gv-project-logs">
                        <button className="btn btn-primary">
                          Submittal Log
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Dashboard
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          QA View
                          <span className="log-arrow"></span>
                        </button>
                        <button className="btn btn-primary">
                          Collaboration Hub
                          <span className="log-arrow"></span>
                        </button>
                      </div>
                      <div className="gv-logs-upload">
                        <form className="upload-document-form">
                          <div className="upload-document-content">
                            <div className="select-File">
                              <input
                                className="d-none"
                                type="file"
                                // name="files[]"
                                id="uploadDocs"
                                accept="application/pdf"
                                multiple
                              />
                              <label htmlFor="uploadDocs">
                                <div className="upload-text d-flex align-items-center justify-content-center">
                                  <small className="upload-icon"></small>
                                  <span className="upload-name">Upload Specs</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalProject;
