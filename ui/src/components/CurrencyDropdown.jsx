import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';

const CurrencyDropdown = ({
  convertOperation = '',
  currencyDropdownOptions = [],
  handleChange = () => {},
  value = '',
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id={`${convertOperation}-currency-input-label`}>
          <Typography>{convertOperation}</Typography>
        </InputLabel>
        <Select
          labelId={`${convertOperation}-currency-input`}
          id={`${convertOperation}-currency-input`}
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          value={value}
          label={`${convertOperation}`}
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
