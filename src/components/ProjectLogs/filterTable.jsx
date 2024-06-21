import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';
import axiosInstance from '../../config/axios';
import handleError from '../../config/errorHandler';

export const FilterTable = (props) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSelect = (id) => {
    if (props.filterValues[props?.filterColumn]?.includes(id)) {
      let selectedLogs = props.filterValues[props?.filterColumn]?.filter(
        (logId) => logId !== id
      );
      props.setFilterValues({
        ...props.filterValues,
        [props?.filterColumn]: selectedLogs
      });
    } else {
      let newValues = [...props.filterValues[props?.filterColumn], id];
      props.setFilterValues({
        ...props.filterValues,
        [props?.filterColumn]: newValues
      });
    }
  };
  // const handleSelectAll = () => {
  //   let selectedLogs = props?.selectedFilterValue[props?.filterColumn]
  //     ?.filter((value) => value.toString().includes(searchValue))
  //     ?.map((log) => {
  //       return log;
  //     });
  //   props.setFilterValues({
  //     ...props.filterValues,
  //     [props?.filterColumn]: selectedLogs
  //   });
  // };

  const handleClear = () => {
    props.setFilterValues({ ...props.filterValues, [props?.filterColumn]: [] });
    // handleApplyFilter(false)
  };

  const handleApplyFilter = async (toggleFilter) => {
    let filter = {};
    Object.keys(props.filterValues).forEach((key) =>
      props.filterValues[key].length
        ? (filter = { ...filter, [key]: props.filterValues[key] })
        : null
    );
    try {
      console.log(props.filterValues);
      const response = await axiosInstance({
        method: 'post',
        url: props.qaDashboard ? 'qa_dashboard_logs' : '/filter_logs',
        data: {
          project_id: props.projectId,
          search: '',
          // filters: {...a, type: ["Submittal"]},
          filters: filter,
          order_col: props.orderColumn,
          order: props.order,
          list_id: props.listId,
          page_number: props?.page - 1,
          limit: props?.rowsPerPage,
          list_id: props.listId
        }
      });
      localStorage.setItem(
        'filteredIds',
        response.data?.message?.map((item) => item?.id)
      );
      props.setLogData(response.data.message);
      props.setLogIdList(response.data.log_id_list);
      props.setSelected([]);
      toggleFilter && props.setFilterModal();
      props.setTotalCount(response.data.total_count);
      setSearchValue('')
    } catch (error) {
      console.log(error.message);
      handleError(error);
    }
  };

  const toggleModal = () => {
    setSearchValue('')
    props.setFilterModal()
  }
  return (
    <Modal
      isOpen={props.modal}
      fade={false}
      toggle={toggleModal}
      className="new-user modal-lg"
      style={{ maxWidth: '500px' }}
    >
      <ModalHeader toggle={toggleModal} style={{}}>
        Filter By Column Values
      </ModalHeader>
      <ModalBody>
        <form className="create-customer-form">
          <div className="save-list-name">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="saveSelectionName"
                    aria-describedby="saveSelectionName"
                    placeholder="Enter"
                    // required
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                  />
                  <label
                    className="text-label"
                    style={{ textTransform: 'capitalize' }}
                    htmlFor="saveSelectionName"
                  >
                    Search {props?.filterColumn.replaceAll('_', ' ')} Values
                  </label>
                  {/* {listName.errors && (
                                        <small className="form-error">{listName.errors}</small>
                                    )} */}
                </div>
                <div style={{ marginBottom: '20px', float: 'right' }}>
                  {/* <span
                    style={{
                      textDecoration: 'underline',
                      color: 'blue',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                    onClick={handleSelectAll}
                  >
                    Select all
                  </span> */}
                  <span
                    style={{
                      textDecoration: 'underline',
                      color: 'blue',
                      cursor: 'pointer'
                    }}
                    onClick={handleClear}
                  >
                    Clear
                  </span>
                </div>
                {Object.values(props.selectedFilterValue).length
                  ? props?.selectedFilterValue[props?.filterColumn]
                      ?.filter((value) =>
                        value?.toString().includes(searchValue)
                      )
                      .map((filterVal, index) => {
                        return (
                          <div key={index}>
                            <input
                              type="checkbox"
                              id={index}
                              value={filterVal}
                              checked={
                                props.filterValues[
                                  props?.filterColumn
                                ].includes(filterVal)
                              }
                              name={filterVal}
                              onChange={() => handleSelect(filterVal)}
                            />
                            <label style={{ marginLeft: '10px' }}>
                              {filterVal}
                            </label>
                            <br />
                          </div>
                        );
                      })
                  : null}
              </div>
            </div>
          </div>
          <ModalFooter style={{ justifyContent: 'center' }}>
            <Button color="secondary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => handleApplyFilter(true)}>
              Apply
            </Button>{' '}
          </ModalFooter>
        </form>
      </ModalBody>
    </Modal>
  );
};
