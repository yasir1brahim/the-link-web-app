import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import './DataTable.css';

const DataTablePagination = ({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [25, 50, 100, 200],
}) => {
  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handlePageChange = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <div className="dt-pagination">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel id="dt-rows-per-page-label">Rows</InputLabel>
          <Select
            labelId="dt-rows-per-page-label"
            id="dt-rows-per-page"
            value={rowsPerPage}
            label="Rows"
            onChange={handleRowsPerPageChange}
            sx={{
              '.MuiSelect-select': { padding: '8px 12px' },
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          shape="rounded"
          size="medium"
          showFirstButton
          showLastButton
        />
      </Box>
    </div>
  );
};

export default DataTablePagination;
