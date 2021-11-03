import axios from 'axios';
import { useQuery } from 'react-query';
/*
   API that connects to the ./api in this project.
   'http://localhost:5000/cached-currency-delta?base=:baseCurrency'
*/
const API_URL = 'http://localhost:5000/cached-currency-delta';

/*
   original API_URL ( rate limited )
   const API_URL = 'https://open.exchangerate-api.com/v6/latest/USD';
*/
/*
   react query hook to handle fetching our currency,
   defaulting to USD
   if nothing is passed in.
*/
export default function useGetCurrencyConversions(
  { baseCurrency = 'USD' } = {},
  queryOptions
) {
  /*
     queryKey that react-query uses
     to store in response in the cache on the client side, so it won't make 
     new requests for requests that have the same params.
  */
  const queryKey = `${baseCurrency}baseCurrency`;

  async function fetchCurrencies() {
    const response = await axios.get(`${API_URL}?base=${baseCurrency}`);
    return response.data;
  }

  return useQuery([queryKey, { baseCurrency }], fetchCurrencies, queryOptions);
}
