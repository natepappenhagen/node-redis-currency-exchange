import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import useGetCurrencyConversions from '../hooks/useGetCurrencyConversions';
import CurrencyDropdown from './CurrencyDropdown';
import parseStringLocale from '../util/parseStringLocale';
import asLocaleString from '../util/asLocaleString';
import { CONVERT_OPERATIONS } from '../constants/convertOperations';
import handleFloatingPoints from '../util/handleFloatingPoints';

const ConvertCurrency = () => {
  const [fromValue, setFromValue] = useState(1);
  const [toValue, setToValue] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [defaultCurrencyDropdownOptions, setDefaultCurrencyDropdownOptions] =
    useState([]);

  const { data: currenciesResponse, isLoading: isCurrencyLoading } =
    useGetCurrencyConversions(
      {
        baseCurrency: fromCurrency,
      },
      {
        enabled: Boolean(fromCurrency),
        onSuccess: (data) => {
          if (fromCurrency === 'USD') {
            // hold on to some dropdown options in the event that "None"
            //  is selected and we don't have any anymore.
            setDefaultCurrencyDropdownOptions(Object.keys(data.rates));
          }
        },
      }
    );

  let currencyRates = currenciesResponse
    ? Object.keys(currenciesResponse.rates)
    : [];

  /*
     when the user sets the dropdown to "None",
     we lose the currency dropdown options from the response.
     so we re-populate our options from the initial response's rates payload.
  */
  if (fromCurrency === '') {
    currencyRates = defaultCurrencyDropdownOptions;
  }

  const handleConversion = ({ input, convertOperation }) => {
    if (!Object.keys(CONVERT_OPERATIONS).includes(convertOperation)) {
      console.log(
        `cannot convert by operation ${convertOperation}, must be either "to" or "from"`
      );
      return;
    }
    if (input === '') {
      resetToAndFromValues();
      return;
    }
    const FROM_RATE = currenciesResponse?.rates[fromCurrency];
    const TO_RATE = currenciesResponse?.rates[toCurrency];
    const INPUT_VALUE = handleFloatingPoints(input);

    const convertBy = {
      to: () => {
        setToValue(asLocaleString(INPUT_VALUE, toCurrency));
        const converted = handleFloatingPoints(
          (INPUT_VALUE / TO_RATE) * FROM_RATE
        );
        setFromValue(asLocaleString(converted, fromCurrency));
      },
      from: () => {
        setFromValue(asLocaleString(INPUT_VALUE, fromCurrency));
        const converted = handleFloatingPoints(
          (INPUT_VALUE / FROM_RATE) * TO_RATE
        );
        setToValue(asLocaleString(converted, toCurrency));
      },
    };
    convertBy[convertOperation]();
  };

  const resetToAndFromValues = () => {
    setToValue('');
    setFromValue('');
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item>
        <Box sx={{ marginBottom: '5rem' }}>
          <Typography component="div" variant="h2">
            cache-it 🧺
          </Typography>
        </Box>
      </Grid>
      <Paper className="cache-it-paper" variant="outlined" elavation={1}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing="2"
        >
          <Grid item xs={6}>
            <CurrencyDropdown
              handleChange={(e) => {
                setFromCurrency(e.target.value);
                resetToAndFromValues();
              }}
              convertOperation={CONVERT_OPERATIONS.from}
              value={fromCurrency}
              currencyDropdownOptions={currencyRates}
            />
          </Grid>
          <Grid item xs={6}>
            {!isCurrencyLoading ? (
              <>
                <TextField
                  label={CONVERT_OPERATIONS.from}
                  type="text"
                  value={fromValue}
                  onChange={(e) => {
                    const inputAsInt = parseStringLocale(e.target.value);
                    handleConversion({
                      input: inputAsInt,
                      convertOperation: CONVERT_OPERATIONS.from,
                    });
                  }}
                />
              </>
            ) : (
              <CircularProgress size={14} />
            )}
          </Grid>
          <Grid item xs={6}>
            <CurrencyDropdown
              handleChange={(e) => {
                setToCurrency(e.target.value);
                resetToAndFromValues();
              }}
              convertOperation={CONVERT_OPERATIONS.to}
              value={toCurrency}
              currencyDropdownOptions={currencyRates}
            />
          </Grid>
          <Grid item xs={6}>
            {!isCurrencyLoading ? (
              <TextField
                label={CONVERT_OPERATIONS.to}
                type="text"
                value={toValue}
                onChange={(e) => {
                  const inputAsInt = parseStringLocale(e.target.value);
                  handleConversion({
                    input: inputAsInt,
                    convertOperation: CONVERT_OPERATIONS.to,
                  });
                }}
              />
            ) : (
              <CircularProgress size={14} />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default ConvertCurrency;
