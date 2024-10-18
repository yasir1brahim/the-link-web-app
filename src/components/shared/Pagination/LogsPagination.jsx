import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
const LogsPagination = ({
  totalItems,
  fetchData,
  rowsPerPage,
  setRowsPerPage,
  page,
  setPage,
  listId,
  searchValue
}) => {
  const [pageCount, setPageCount] = useState(0);

  const onClickChangePage = (e, page) => {
    e.preventDefault();
    setPage(page);
    fetchData(page, rowsPerPage, searchValue, listId);
  };
  const handleChangeRowsPerPage = (event) => {
    let rowsCount = parseInt(event.target.value, 10);
    setRowsPerPage(rowsCount);
    fetchData(0, rowsCount, searchValue, listId);
    setPage(1);
  };

  useEffect(() => {
    setPageCount(Math.ceil(totalItems / rowsPerPage));
  }, [totalItems, rowsPerPage]);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <FormControl sx={{ minWidth: 80 }}>
        <InputLabel id="rows-per-page-select-autowidth-label">Rows</InputLabel>
        <Select
          labelId="rows-per-page-select-label"
          id="rows-per-page-select"
          value={rowsPerPage}
          label="Rows per page"
          onChange={(e) => handleChangeRowsPerPage(e)}
          sx={{
            '.MuiSelect-select': {
              padding: 1,
            },
            '.MuiOutlinedInput-input': {
              padding: 1,
              textAlign: 'center'
            },
          }}
        >
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </FormControl>
      <Pagination
        component="div"
        count={pageCount}
        page={page}
        shape="rounded"
        onChange={onClickChangePage}
        size={"medium"}
        // boundaryCount={1}
        // siblingCount={1}
        defaultPage={1}
        variant="string"
        rowsperpage={rowsPerPage}
        // onRowsPerPageChange={handleChangeRowsPerPage}
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
