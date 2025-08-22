import React from 'react';
import { Tooltip, styled } from '@mui/material';

const BlackTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#000000',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 500,
    maxWidth: 220,
    border: 'none',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  },
  '& .MuiTooltip-arrow': {
    color: '#000000',
  },
}));

const StyledTooltip = ({ children, title, arrow = true, placement = "top", ...props }) => {
  return (
    <BlackTooltip title={title} arrow={arrow} placement={placement} {...props}>
      {children}
    </BlackTooltip>
  );
};

export default StyledTooltip; 