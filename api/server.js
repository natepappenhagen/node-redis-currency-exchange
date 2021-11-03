const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const { inRange, toUpper } = require('lodash');
const chalk = require('chalk');

const redisWrapper = require('./redis-wrapper');
const { getCachedValue, setCachedValue } = redisWrapper;

const ASCIIFolder = require('fold-to-ascii'); // for input sanitization.

const whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

/*
 https://www.exchangerate-api.com/docs/free
 heavily rate limited
 implementing a caching strategy to store responses
 for each base currency.

 There will be as many cached responses as there are requested BASE currencies. 
    ex: client requests USD ( base )
        we make the external HTTP request for USD, which contains all the supported pairs and the
        price of each other currency in USD.

        if our client _only_ requsted against USD, then we would store the USD response in the cache
        until a request came in that the Date.now() was beyond the `time_next_update_unix` from the cached
        response. When the Date.now() is beyond `time_next_update_unix`, we will "bust" the cache, 
        by requesting a new response from the API and then saving that new, updated response.

        The api is updated every 24 hours-ish. So, if we have 1000 users all using USD as the base currency. We would only have the make 1 request to the external API ( unless the server went down and needed to be rolled ).

*/
const EXCHANGE_RATE_API = `https://open.er-api.com/v6/latest`;

// no caching, gets a new request from remote each time.
//localhost:5000/currency-delta?base=USD
app.get('/currency-delta', (req, res) => {
  const baseCurrency = ASCIIFolder.foldReplacing(toUpper(req.query.base)); // removing any odd non-ascii things.
  try {
    axios
      .get(`${EXCHANGE_RATE_API}/${baseCurrency}`)
      .then(function (apiResponse) {
        const currencyResponse = apiResponse.data;
        console.log(
          chalk.green(
            'currencyResponse successfully retrieved from the API ✅ '
          )
        );
        res.status(200).send(currencyResponse);
      });
  } catch (err) {
    res.status(500).send({ error: true, message: err.message });
  }
});

const fetchAndUpdateCache = async ({ key }, res) => {
  /*
       Not found in cache
       Make new HTTP request
       Update cache using the baseCurrency as the key
    */
  axios.get(`${EXCHANGE_RATE_API}/${key}`).then(function (apiResponse) {
    const currencyResponse = apiResponse.data;
    /* 
          this is what happens when you supply a bogus base currency.
       {
         "result": "error",
         "error-type": "unsupported-code"
       }
       */
    if (
      currencyResponse &&
      currencyResponse.result === 'error' &&
      currencyResponse['error-type'] === 'unsupported-code'
    ) {
      res.status(422).send(
        JSON.stringify({
          error: true,
          message: `Unsupported currency : ${key}, please try a different currency.`,
        })
      );
    } else {
      /*
            update the redis cache w/ the new api response.
       */
      setCachedValue({ key, value: currencyResponse });
      console.log(
        chalk.green(
          `Retrieved from the open.er-api.com API ✅ , currencyResponse : ${chalk.bgWhite(
            JSON.stringify(currencyResponse, null, 2)
          )}`
        )
      );
      console.log(
        chalk.green(`Redis cache updated with response, with key : ${key}`)
      );
      res.status(200).send(currencyResponse);
    }
  });
};

// caching
//localhost:5000/cached-currency-delta?base=USD
app.get('/cached-currency-delta', async (req, res) => {
  /*
      - removing odd non-ascii things / invalid characters.
      -  the api is case-insensitve, but if we swap out to a different provider
         it might just be good to be upper-casing it.
  */
  const baseCurrency = ASCIIFolder.foldReplacing(toUpper(req.query.base));

  try {
    getCachedValue({ key: baseCurrency }).then(
      (cachedResponse) => {
        console.log(
          chalk.green(
            `cachedResponse  found in cache, ${chalk.bgWhite(
              JSON.stringify(cachedResponse, null, 2)
            )}`
          )
        );
        /*
          api returns this metadata
          around how current the response is.

          "time_last_update_unix": 1585872397
          "time_next_update_unix": 1585959987
      */
        const nowUnixTimestamp = Math.floor(Date.now() / 1000);

        const isCacheCurrent =
          cachedResponse &&
          inRange(
            nowUnixTimestamp, // returns a unix timestamp of when the request was made.
            JSON.parse(cachedResponse).time_last_update_unix,
            JSON.parse(cachedResponse).time_next_update_unix
          );

        console.log('Date.now()', nowUnixTimestamp);
        console.log(
          'time_last_update_unix',
          cachedResponse && JSON.parse(cachedResponse).time_last_update_unix
        );
        console.log(
          'time_next_update_unix',
          cachedResponse && JSON.parse(cachedResponse).time_next_update_unix
        );
        console.log('isCacheCurrent, ', isCacheCurrent);

        if (isCacheCurrent) {
          console.log('returning cached response to client.');
          res.status(200).send(cachedResponse);
        } else {
          console.log(
            'cached response not found, getting new response and updating cache.'
          );
          // case -> cache is not up to date anymore, force refresh/bust cache.
          fetchAndUpdateCache({ key: baseCurrency }, res);
        }
      },
      (reason) => {
        // case -> not found in cache at all, get new response from api.
        console.log(
          chalk.yellow(
            `cachedResponse not found in cache, ${chalk.bgWhite(reason)}`
          )
        );
        fetchAndUpdateCache({ key: baseCurrency }, res);
      }
    );
  } catch (err) {
    res.status(500).send(JSON.stringify({ error: true, message: err.message }));
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(chalk.cyan(`🎧 Server started at port: ${chalk.bgWhite(PORT)}`));
});
