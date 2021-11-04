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
import { useQueryClient } from 'react-query';
import Big from 'big.js';

const ConvertCurrency = () => {
  const queryClient = useQueryClient();

  const [fromValue, setFromValue] = useState(1);
  const [toValue, setToValue] = useState(1);

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [defaultCurrencyDropdownOptions, setDefaultCurrencyDropdownOptions] =
    useState([]);

  const ONE_HOUR = 3600;

  const handleFromCurrencyChange = (e) => {
    setFromCurrency(e.target.value);
  };

  const handleToCurrencyChange = (e) => {
    setToCurrency(e.target.value);
  };

  const handleFloatingPoints = (floatToHandle) => {
    if (floatToHandle === '' || isNaN(floatToHandle)) {
      return 0;
    }
    const cleanedNumber = new Big(floatToHandle.toString())
      .toPrecision(5)
      .toString();
    console.log('big', cleanedNumber);
    console.log('floatToReturn', parseFloat(cleanedNumber));
    return parseFloat(cleanedNumber);
  };

  const handleFromValueChange = (e) => {
    if (e.target.value === '') {
      return setFromValue('');
    }
    console.log('fromValueChange', e.target.value);
    console.log('parseFloat(fromValueChange)', parseFloat(e.target.value));
    console.log(
      'parseFloat(fromValueChange.toString())',
      parseFloat(e.target.value.toString())
    );
    const inputWithSaneFloatingPoints = handleFloatingPoints(e.target.value);
    setFromValue(parseFloat(inputWithSaneFloatingPoints));
  };

  const handleToValueChange = (e) => {
    if (e.target.value === '') {
      return setToValue('');
    }
    console.log('toValueChange', e.target.value);
    console.log('parseFloat(toValueChange)', parseFloat(e.target.value));
    console.log(
      'parseFloat(toValueChange.toString())',
      parseFloat(e.target.value.toString())
    );
    const inputWithSaneFloatingPoints = handleFloatingPoints(e.target.value);
    setToValue(inputWithSaneFloatingPoints);
  };

  const { data: currenciesResponse, isLoading: isCurrencyLoading } =
    useGetCurrencyConversions(
      {
        baseCurrency: fromCurrency,
      },
      {
        staleTime: ONE_HOUR,
        cacheTime: ONE_HOUR,
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

  const convertFromTo = () => {
    if (currenciesResponse && fromCurrency && toCurrency) {
      const fromRate = currenciesResponse.rates[fromCurrency];
      const valueDividedByRate = fromValue / fromRate;
      const toRate = currenciesResponse.rates[toCurrency];
      setToValue(handleFloatingPoints(valueDividedByRate * toRate));
    }
  };

  const convertToFrom = () => {
    if (currenciesResponse && fromCurrency && toCurrency) {
      const toRate = currenciesResponse.rates[toCurrency];
      const valueDividedByRate = toValue / toRate;
      const fromRate = currenciesResponse.rates[fromCurrency];
      setFromValue(handleFloatingPoints(valueDividedByRate * fromRate));
    }
  };

  useEffect(() => {
    convertFromTo();
  }, [fromValue, toCurrency]);

  useEffect(() => {
    convertToFrom();
  }, [toValue, fromCurrency]);

  return (
    <Container className="cache-it-container" fixed>
      <h1>
        <Typography>cache-it</Typography>
      </h1>
      <Paper className="cache-it-paper" variant="outlined" elavation={1}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            {!isCurrencyLoading ? (
              <TextField
                type="number"
                value={fromValue}
                onChange={handleFromValueChange}
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
                onChange={handleToValueChange}
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
              handleChange={handleFromCurrencyChange}
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
              handleChange={handleToCurrencyChange}
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
