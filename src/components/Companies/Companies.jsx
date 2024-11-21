import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import PaginatedItems from '../shared/Pagination/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../shared/Loader/Loader';
import handleError from '../../config/errorHandler';
import { getUserTeams, getUserRoleInTeam } from '../../api/Authentication/api';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isLoading, setLoading] = useState(false);
    const [pageRefresh, setPageRefresh] = useState(false);
    const [roles, setRoles] = useState({});

    useEffect(() => {
      const fetchCompaniesAndRoles = async () => {
          try {
              setLoading(true);
  
              const response = await getUserTeams();
              const fetchedCompanies = response.data.results;
              setCompanies(fetchedCompanies);
  
              const userId = localStorage.getItem('userId');
              const rolesPromises = fetchedCompanies.map(async (company) => {
                  const role = await getUserRoleInTeam(userId, company.id);
                  return { [company.id]: role };
              });
  
              const rolesArray = await Promise.all(rolesPromises);
              const rolesMap = rolesArray.reduce((acc, roleObj) => ({ ...acc, ...roleObj }), {});
  
              setRoles(rolesMap);
          } catch (error) {
              handleError(error);
          } finally {
              setLoading(false);
          }
      };
  
      fetchCompaniesAndRoles();
  }, [pageRefresh]);

    return (
        <div>
          <div className="page-wrap">
            <NavbarTop />
            <div className="page-wrap-content admin-landing-wrapper">
              <Header
                title={'Customers'}
              />
    
              <div className="admin-landing-content">
                <div className="table-top-content">
                  <label className="table-entries">
                    Showing entries
                    <span className="showing-strong"> {currentItems.length} </span>
                    of{' '}
                    <span className="showing-strong"> {companies.length}</span>.
                  </label>
                  <div className="table-bulk-changes">
                  </div>
                </div>
                <div className="l-table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <span>
                            Customers <i className=""></i>
                          </span>
                        </th>
                        <th>
                          <span>
                            Projects<i className="sort-i"></i>
                          </span>
                        </th>
                        <th>
                          <span>
                            Users<i className="sort-i"></i>
                          </span>
                        </th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company)  => {
                        const role = roles[company.id];
                        const isMember = role === 'member';

                        return (
                          <tr key={company?.id}>
                            <td>
                              {isMember ? (
                                <span>{company.name}</span>
                              ) : (
                                <a href={`/company-profile/${company.id}`}>
                                  {company.name}
                                </a>
                              )}
                            </td>
                            <td>{company.project_count}</td>
                            <td>{company.members.length}</td>
                            <td>
                              <div className="action-wrapper">
                                <a
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  href={`/project-list/${company.id}`}
                                >
                                  View Projects
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer-content">
                  <PaginatedItems
                    items={companies}
                    setCurrentItems={setCurrentItems}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                  />
                </div>
              </div>
            </div>
          </div>
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
        </div>
      );
};

export default Companies;