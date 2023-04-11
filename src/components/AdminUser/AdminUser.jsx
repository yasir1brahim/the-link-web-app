import React, { useState, useEffect } from "react";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import Loader from "../shared/Loader/Loader";
// import PaginatedItems from "../shared/Pagination/Pagination";
import classnames from "classnames";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import UpdateListing from "./UpdateListing";
import axiosInstance from "../../config/axios";
import { toast, ToastContainer } from "react-toastify";
import EditEmployee from "../CustomerProfile/editEmployee";
import EditProject from "../CustomerProjects/editProject";
import moment from "moment";
import { ExternalUsers } from "./externalUsers";
import handleError from "../../config/errorHandler";

const AdminUser = (props) => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const [isArchived, toggleArchive] = useState(false);

  const [updateListModal, setUpdateListModal] = useState(false);
  const toggleUpdateList = async () => {
    setUpdateListModal(!updateListModal);
  };

  const [detailInfoModal, setDetailInfoModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const toggleDetailInfo = (data) => {
    setDetailInfoModal(!detailInfoModal);
    setModalData(data);
  };

  const [selectedEmployeeList, setSelectedEmployeeList] = useState([]);

  // tab functions
  const [activeTab, setActiveTab] = useState("employees");
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [isLoading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [pageRefresh, setPageRefresh] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [externalUserData, setExternalData] = useState([]);

  // const [employeeModal, setEmployeeModal] = useState(false);
  // const toggleEmployeeModal = () => setEmployeeModal(!employeeModal);
  const [projectModal, setProjectModal] = useState(false);
  const toggleProjectModal = (data) => {
    setProjectModal(!projectModal);
    setModalData(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await axiosInstance({
        method: "get",
        url: `/customers/${localStorage.getItem("userId")}`,
      });
      setCustomerData(response.data.message);

      const preferredCustomer = await axiosInstance({
        method: "get",
        url: `/admin/${localStorage.getItem("userId")}/preferred_customer`,
      });
      const custObject = response.data.message.filter(
        (customer) =>
          customer.customer_id ===
          preferredCustomer.data.message.preferred_customer_id
      );
      setSelectedCustomer({
        id: custObject[0].customer_id || response.data.message[0].customer_id,
        label:
          custObject[0].customer_name || response.data.message[0].customer_name,
      });

      const employeeResponse = await axiosInstance({
        method: "get",
        url: `/admin/employees/${
          custObject[0].customer_id || response.data.message[0].customer_id
        }`,
      });
      setEmployeeData(employeeResponse.data.message);

      const projectResponse = await axiosInstance({
        method: "get",
        url: `/admin/projects/${
          custObject[0].customer_id || response.data.message[0].customer_id
        }`,
      });
      setProjectData(projectResponse.data.message);

      const externalResponse = await axiosInstance({
        method: "get",
        url: `/admin/external_users`,
        params: {
          customer_id:
            custObject[0].customer_id || response.data.message[0].customer_id,
        },
      });
      setExternalData(externalResponse.data.data);

      localStorage.setItem("account_id", response.data.account_id);
      setLoading(false);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      setLoading(false);
      handleError(error)
    });
  }, [pageRefresh]);

  useEffect(() => {
    if (!updateListModal) {
      setSelectedEmployeeList([]);
    }
  }, [updateListModal]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance({
        method: "get",
        url: `/admin/employees/${selectedCustomer[0].id}`,
      });
      setEmployeeData(response.data.message);
      const projectResponse = await axiosInstance({
        method: "get",
        url: `/admin/projects/${selectedCustomer[0].id}`,
      });
      setProjectData(projectResponse.data.message);
      await axiosInstance({
        method: "put",
        url: `/admin/${localStorage.getItem("userId")}/preferred_customer`,
        data: {
          preferred_customer_id: selectedCustomer[0].id,
        },
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error)
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axiosInstance({
        method: "put",
        url: `/employees/${id}/${status}`,
      });
      setPageRefresh(!pageRefresh);
    } catch (error) {
      setLoading(false);
      handleError(error)
    }
  };

  const handleUpdateList = async () => {
    try {
      console.log('hero', externalUserData, {
        user_id: externalUserData[0]?.id,
        projects: selectedEmployeeList,
      })
      const url =
        activeTab === "external"
          ? `/admin/add_extuser_to_projects`
          : `/${activeTab}/${
              activeTab === "employees" ? modalData?.id : modalData?.project_id
            }/${activeTab === "employees" ? "projects" : "employees"}`;
      const data =
        activeTab === "external"
          ? {
              user_id: externalUserData[0]?.id,
              projects: selectedEmployeeList,
            }
          : {
              [activeTab === "employees" ? "projects" : "employees"]:
                selectedEmployeeList,
            };
      setLoading(true);
      await axiosInstance({
        method: activeTab === "external" ? "post" : "put",
        url,
        data,
      });
      setLoading(false);
      setPageRefresh(!pageRefresh);
      setUpdateListModal(!updateListModal);
    } catch (error) {
      setLoading(false);
      setUpdateListModal(!updateListModal);
      handleError(error)
    }
  };

  const handleResetPassword = async (employee) => {
    try {
      await axiosInstance({
        method: "post",
        url: `/forgot_password`,
        data: {
          email: employee.email_address,
        },
      });
      toast.success(
        `A reset password link has been sent to your email address. Kindly click on the link and reset the password.`,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      setPageRefresh(!pageRefresh);
    } catch (error) {
      setLoading(false);
      handleError(error)
    }
  };

  const handleArchiveProject = async (project) => {
    let errors = false;
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: "put",
          url: "/updateProject",
          data: {
            project_name: project.project_name,
            lead_contact: project.lead_contact,
            start_date: project?.start_date
              ? moment(
                  new Date((project?.start_date).replaceAll("-", "/"))
                ).format("YYYY-MM-DD")
              : "",
            end_date: project?.end_date
              ? moment(
                  new Date((project?.end_date).replaceAll("-", "/"))
                ).format("YYYY-MM-DD")
              : "",
            customer_id: project?.customer_id,
            status: project.status === "Archived" ? "Active" : "Archived",
            project_id: project.project_id,
          },
        });
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
        }
        toggleArchive(!isArchived);
      } catch (error) {
        console.log(error.message);
        handleError(error)
      }
    }
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content admin-user-wrapper">
          <Header
            title={"Admin Portal"}
            toggleModal={toggleModal}
            // showBtn={'Create New Customer'}
          />

          <div className="company-search-wrapper">
            <form className="company-search-form">
              <div className="row">
                <div className="col-4">
                  <div className="form-group">
                    <SelectDropdown
                      label={"Select Company"}
                      setSelected={setSelectedCustomer}
                      defaultSelected={"Test"}
                      value={selectedCustomer.label}
                      selected={selectedCustomer.label}
                      options={customerData.map((customer) => {
                        return {
                          id: customer.customer_id,
                          label: customer.customer_name,
                        };
                      })}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="nav-tabs-wrapper">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "employees" })}
                  onClick={() => {
                    toggle("employees");
                  }}
                >
                  Employees({employeeData?.length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "projects" })}
                  onClick={() => {
                    toggle("projects");
                  }}
                >
                  Projects({projectData?.length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "external" })}
                  onClick={() => {
                    toggle("external");
                  }}
                >
                  External Users({externalUserData?.length})
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId={"employees"}>
                <div className="admin-user-content">
                  {/* <div className="table-top-content">
                    <label className="table-entries">
                      Showing entries
                      <span className="showing-strong"> 3 </span>
                      of{' '}
                      <span className="showing-strong"> 10</span>.
                    </label>
                  </div> */}
                  <div className="l-table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>
                            <span>
                              Employee Name <i className=""></i>
                            </span>
                          </th>
                          <th>
                            <span>
                              Status <i className="sort-d"></i>
                            </span>
                          </th>
                          <th>
                            <span>
                              Associated Projects <i className="sort-i"></i>
                            </span>
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeData.map((employee) => {
                          return (
                            <tr>
                              <td>
                                <a
                                  href={() => false}
                                  onClick={() => toggleDetailInfo(employee)}
                                >
                                  {employee.full_name}
                                </a>
                              </td>
                              <td>
                                <span className="item-status item-status-active">{`${employee.employee_status[0].toUpperCase()}${employee.employee_status.substring(
                                  1
                                )}`}</span>
                              </td>
                              <td>
                                <div className="tags-wrapper">
                                  {employee.projects?.map((project) => {
                                    return (
                                      <span className="item-tag">
                                        {project.name}
                                        {/* <a className="icon-close"></a> */}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                              <td>
                                <div className="action-wrapper">
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      toggleUpdateList();
                                      setModalData(employee);
                                      setSelectedEmployeeList(
                                        employee.projects.length
                                          ? employee.projects?.map((project) =>
                                              Number(project.id)
                                            )
                                          : []
                                      );
                                    }}
                                  >
                                    Add Projects
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                      handleResetPassword(employee)
                                    }
                                  >
                                    Reset Password
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                      handleStatus(
                                        employee.id,
                                        employee.employee_status === "active"
                                          ? "deactivate"
                                          : "activate"
                                      )
                                    }
                                  >
                                    {employee.employee_status === "active"
                                      ? "Deactivate"
                                      : "Activate"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* <div className="table-footer-content">
                    <PaginatedItems
                      items='5'
                      itemsPerPage='10'
                    />
                  </div> */}
                </div>
              </TabPane>
              <TabPane tabId={"projects"}>
                <div className="admin-user-content">
                  {/* <div className="table-top-content">
                    <label className="table-entries">
                      Showing entries
                      <span className="showing-strong"> 3 </span>
                      of{' '}
                      <span className="showing-strong"> 10</span>.
                    </label>
                  </div> */}
                  <div className="l-table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>
                            <span>
                              Projects <i className=""></i>
                            </span>
                          </th>
                          <th>
                            <span>
                              Status <i className="sort-d"></i>
                            </span>
                          </th>
                          <th>
                            <span>
                              Associated Employee Names{" "}
                              <i className="sort-i"></i>
                            </span>
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectData.map((project) => {
                          return (
                            <tr>
                              <td>
                                <a
                                  href={() => false}
                                  onClick={() => {
                                    toggleProjectModal(project);
                                  }}
                                >
                                  {project.project_name}
                                </a>
                              </td>
                              <td>
                                <span className="item-status item-status-active">
                                  {project.status}
                                </span>
                              </td>
                              <td>
                                <div className="tags-wrapper">
                                  {project.employees?.map((emp) => {
                                    return (
                                      <span className="item-tag">
                                        {emp.name}
                                        {/* <a className="icon-close"></a> */}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                              <td>
                                <div className="action-wrapper">
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      toggleUpdateList();
                                      setModalData(project);
                                      setSelectedEmployeeList(
                                        project.employees.length
                                          ? project.employees?.map((emp) =>
                                              Number(emp.id)
                                            )
                                          : []
                                      );
                                    }}
                                  >
                                    Add Employee
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                      handleArchiveProject(project)
                                    }
                                    disabled={
                                      isArchived &&
                                      localStorage.getItem("roleId") !== "0"
                                    }
                                  >
                                    {project.status === "Archived"
                                      ? "Unarchive"
                                      : "Archive"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* <div className="table-footer-content">
                    <PaginatedItems
                      items='5'
                      itemsPerPage='10'
                    />
                  </div> */}
                </div>
              </TabPane>
              <TabPane tabId={"external"} style={{ display: "grid" }}>
                {activeTab === "external" && (
                  <ExternalUsers
                    customer={selectedCustomer}
                    externalUserData={externalUserData}
                    pageRefresh={pageRefresh}
                    setPageRefresh={setPageRefresh}
                    toggleUpdateList={toggleUpdateList}
                    setModalData={setModalData}
                    setSelectedEmployeeList={setSelectedEmployeeList}
                  />
                )}
              </TabPane>
            </TabContent>
          </div>
        </div>
        <UpdateListing
          updateListModal={updateListModal}
          toggleUpdateList={toggleUpdateList}
          projectData={projectData}
          employeeData={employeeData}
          activeTab={activeTab}
          modalData={modalData}
          selectedEmployeeList={selectedEmployeeList}
          setSelectedEmployeeList={setSelectedEmployeeList}
          handleUpdateList={handleUpdateList}
        />
        {/* <DetailInfo
          detailInfoModal={detailInfoModal}
          toggleDetailInfo={toggleDetailInfo}
          modalData={modalData}
        /> */}
      </div>
      <EditEmployee
        modal={detailInfoModal}
        toggleModal={toggleDetailInfo}
        customer={selectedCustomer}
        pageRefresh={pageRefresh}
        setPageRefresh={setPageRefresh}
        employee={modalData}
      />
      <EditProject
        modal={projectModal}
        toggleModal={toggleProjectModal}
        customer={customerData.filter(
          (cust) => cust?.customer_id === modalData?.customer_id
        )}
        // project={modalData}
        project={modalData}
        pageRefresh={pageRefresh}
        setPageRefresh={setPageRefresh}
        isAdminUser={true}
      />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Loader showComponentLoader={isLoading} />
    </>
  );
};

export default AdminUser;
