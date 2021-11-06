import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import useGetCurrencyConversions from '../hooks/useGetCurrencyConversions';
import CurrencyDropdown from './CurrencyDropdown';
import getSymbolFromCurrency from 'currency-symbol-map';
import currencyCodes from 'currency-codes';
import Big from 'big.js';

const ConvertCurrency = () => {
  const [fromValue, setFromValue] = useState(1);
  const [toValue, setToValue] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [defaultCurrencyDropdownOptions, setDefaultCurrencyDropdownOptions] =
    useState([]);

  const handleFloatingPoints = (floatToHandle) => {
    if (floatToHandle === '' || isNaN(floatToHandle)) {
      return 0;
    }
    const cleanedNumber = new Big(floatToHandle.toString())
      .toPrecision(5)
      .toString();
    console.log('floatToReturn', parseFloat(cleanedNumber));
    return parseFloat(cleanedNumber);
  };

  const VARIANTS = {
    to: 'to',
    from: 'from',
  };

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

  const handleConversion = ({ input: e, variant }) => {
    const input = e.target.value;
    if (input === '') {
      setToValue('');
      setFromValue('');
      return;
    }
    const FROM_RATE = currenciesResponse.rates[fromCurrency];
    const TO_RATE = currenciesResponse.rates[toCurrency];
    const INPUT_VALUE = parseFloat(handleFloatingPoints(input));

    const flowControl = {
      to: () => {
        setToValue(INPUT_VALUE);
        const converted = handleFloatingPoints(
          (INPUT_VALUE / TO_RATE) * FROM_RATE
        );
        setFromValue(converted);
      },
      from: () => {
        setFromValue(INPUT_VALUE);
        const converted = handleFloatingPoints(
          (INPUT_VALUE / FROM_RATE) * TO_RATE
        );
        setToValue(converted);
      },
    };
    flowControl[variant]();
  };

  return (
    <Container className="cache-it-container" fixed>
      <h1>
        <Typography>cache-it 🧺</Typography>
      </h1>
      <Paper className="cache-it-paper" variant="outlined" elavation={1}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            {!isCurrencyLoading ? (
              <TextField
                type="number"
                value={fromValue}
                onChange={(e) => {
                  handleConversion({ input: e, variant: VARIANTS.from });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getSymbolFromCurrency(fromCurrency)}
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <CircularProgress size={14} />
            )}
          </Grid>
          <Grid item xs={6}>
            {!isCurrencyLoading ? (
              <TextField
                type="number"
                value={toValue}
                onChange={(e) => {
                  handleConversion({ input: e, variant: VARIANTS.to });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getSymbolFromCurrency(toCurrency)}
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <CircularProgress size={14} />
            )}
          </Grid>
          <Grid item xs={6}>
            <CurrencyDropdown
              handleChange={(e) => {
                setFromCurrency(e.target.value);
                if (fromValue) {
                  handleConversion({
                    input: { target: { value: fromValue } },
                    variant: VARIANTS.from,
                  });
                }
              }}
              variant="from"
              value={fromCurrency}
              currencyDropdownOptions={currencyRates}
            />
            <Typography>
              {currencyCodes.code(fromCurrency)?.currency}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <CurrencyDropdown
              handleChange={(e) => {
                setToCurrency(e.target.value);
                if (toValue) {
                  handleConversion({
                    input: { target: { value: toValue } },
                    variant: VARIANTS.to,
                  });
                }
              }}
              variant="to"
              value={toCurrency}
              currencyDropdownOptions={currencyRates}
            />
            <Typography>{currencyCodes.code(toCurrency)?.currency}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ConvertCurrency;
