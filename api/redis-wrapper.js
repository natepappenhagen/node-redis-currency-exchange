const client = require('redis').createClient(process.env.REDIS_URL);
const chalk = require('chalk');

client.on('connect', () => {
  console.log(chalk.green('Redis client connected 🚀 '));
});

client.on('error', (error) => {
  console.log(chalk.red('Redis client connected 🔌 '));
  console.log(chalk.bgWhite(error));
});

/*
Node Redis currently doesn’t natively support promises (this is coming in v4)
*/
const ONE_WEEK = 604800;

const getCachedValue = async ({ key }) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err) {
        console.log(chalk.yellow('error retrieving cached value 🚧'));
        console.log(chalk.bgWhite(error));
        reject(err);
      } else {
        console.log(chalk.green('success retrieving cached value 🙌'));
        console.log(chalk.bgWhite(res));
        resolve(res);
      }
    });
  });
};

/*
    because we "bust" the cache if the time requested is not in the cached range
    we could theoretically have the cache be forever, and if the requested time is not in range
    we will just request a new one from the 3rd party remote and update the cache.
    we _could_ run into some odd cases maybe if the caching was too small though.
*/
const setCachedValue = async ({ key, value, ttl = ONE_WEEK } = {}) => {
  return new Promise((resolve, reject) => {
    client.setex(key, ttl, JSON.stringify(value), (err, res) => {
      if (err) {
        console.log(chalk.yellow('error setting cached value in redis 🚧'));
        console.log(chalk.bgWhite(error));
        reject(err);
      } else {
        console.log(chalk.green('success setting cached value 🙌'));
        console.log(chalk.bgWhite(res));
        resolve(res);
      }
    });
  });
};

module.exports = {
  getCachedValue,
  setCachedValue,
};
