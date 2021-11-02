const client = require('redis').createClient(6379);

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', (error) => {
  console.error(error);
});

/*
Node Redis currently doesn’t natively support promises (this is coming in v4)
*/
const ONE_WEEK = 604800;

const getCachedValue = async ({ key }) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, res) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
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
    client.setex(key, ttl, value, (err, res) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

module.exports = {
  getCachedValue,
  setCachedValue,
};
