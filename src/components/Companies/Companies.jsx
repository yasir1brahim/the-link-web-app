import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import PaginatedItems from '../shared/Pagination/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../shared/Loader/Loader';
import handleError from '../../config/errorHandler';
import { getUserTeams } from '../../api/Authentication/api';
import SharedTooltip from '../shared/StyledTooltip/StyledTooltip';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isLoading, setLoading] = useState(false);
    const [pageRefresh, setPageRefresh] = useState(false);

    useEffect(() => {
      const fetchCompanies = async () => {
          try {
              setLoading(true);
  
              const response = await getUserTeams();
              const fetchedCompanies = response.data.results;
              setCompanies(fetchedCompanies);
          } catch (error) {
              handleError(error);
          } finally {
              setLoading(false);
          }
      };
  
      fetchCompanies();
  }, [pageRefresh]);

    return (
        <div>
          <div className="page-wrap">
            <NavbarTop />
            <div className="page-wrap-content admin-landing-wrapper" style={{ marginBottom: '20px' }}>
              <Header
                title={'Companies'}
              />
    
              <div className="admin-landing-content">
                <div className="table-top-content">
                  <label className="table-entries">
                    Showing <span className="showing-strong"> {companies.length}</span> companies
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
                        const isMember = company.user_role === 'member';

                        return (
                          <tr key={company?.id}>
                            <td>
                              {isMember ? (
                                <span>{company.name}</span>
                              ) : (
                                <SharedTooltip title="View Company" arrow>
                                <a href={`/company-profile?companyId=${company.id}`}>
                                  {company.name}
                                </a>
                                </SharedTooltip>
                              )}
                            </td>
                            <td>{company.active_count}</td>
                            <td>{company.member_count}</td>
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