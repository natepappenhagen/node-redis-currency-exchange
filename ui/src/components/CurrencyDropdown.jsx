import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';

const CurrencyDropdown = ({
  currencyDropdownOptions = [],
  handleChange,
  value,
  variant,
}) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id={`${variant}-currency-input-label`}>
          <Typography>{variant}</Typography>
        </InputLabel>
        <Select
          labelId={`${variant}-currency-input`}
          id={`${variant}-currency-input`}
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={value}
          label={`${variant}`}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {currencyDropdownOptions.map((rate, key) => (
            <MenuItem key={key} value={rate}>
              {rate}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CurrencyDropdown;
