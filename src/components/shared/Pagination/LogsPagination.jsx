import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
const LogsPagination = ({
  totalItems,
  fetchData,
  filterValues,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage
}) => {
  const [pageCount, setPageCount] = useState(0);
  let filters = {};
  if (
    Object.values(filterValues)
      .map((value) => (value.length ? true : false))
      .includes(true)
  ) {
    Object.keys(filterValues).forEach((key) =>
      filterValues[key].length
        ? (filters = { ...filters, [key]: filterValues[key] })
        : null
    );
  }

  const onClickChangePage = (e, page) => {
    e.preventDefault();
    setPage(page);
    fetchData(page - 1, rowsPerPage, filters);
  };
  const handleChangeRowsPerPage = (event) => {
    let rowsCount = parseInt(event.target.value, 10);
    setRowsPerPage(rowsCount);
    fetchData(0, rowsCount, filters);
    setPage(1);
  };

  useEffect(() => {
    setPageCount(Math.ceil(totalItems / rowsPerPage));
  }, [totalItems, rowsPerPage]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel id="demo-simple-select-autowidth-label">Rows</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={rowsPerPage}
          label="Rows per page"
          onChange={(e) => handleChangeRowsPerPage(e)}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>

      <Pagination
        component="div"
        count={pageCount}
        page={page}
        shape="rounded"
        onChange={onClickChangePage}
        size={'medium'}
        // boundaryCount={1}
        // siblingCount={1}
        defaultPage={1}
        variant="string"
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default LogsPagination;

// import * as React from 'react';
// import TablePagination from '@mui/material/TablePagination';

// export default function LogsPagination({
//   totalItems,
//   fetchData
// }) {
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(25);
//   const onClickChangePage = (e, page) => {
//     e.preventDefault();
//     setPage(page);
//     fetchData(page, rowsPerPage);
//   };

//   return (
//     <TablePagination
//       // component="div"
//       count={totalItems}
//       onPageChange={onClickChangePage}
//       page={page}
//       rowsPerPage={rowsPerPage}
//       shape="rounded"
//       onRowsPerPageChange={(e) => {
//         setRowsPerPage(parseInt(e.target.value, 10));
//         fetchData(page, parseInt(e.target.value, 10));
//       }}
//       size={'medium'}
//     />
//   );
// }
