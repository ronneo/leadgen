import redis from 'redis';

import DataStore from './DataStore';
import constant from 'common/constant';
import logger from 'common/logger';

export default class RedisDataStore extends DataStore {

  constructor() {
    super();
    this._client = redis.createClient(constant.REDISCLOUD_URL, {no_ready_check: true});
    this._client.on('error', function(err) {
      logger.error(`Redis error: ${JSON.stringify(err)}`);
    });
  }

  formatRedisKey(path, key) {
    return `${path}_${key}`;
  }

  _read(path, key) {
    return new Promise((resolve, reject) => {
      let rediskey = this.formatRedisKey(path, key);
      this._client.get(
        rediskey,
        (err, data) => {
          if (err) {
            logger.error(`Redis read error: ${JSON.stringify(err)}`);
            reject(err);
          } else if (!data) {
            logger.error(`Redis found empty data for key ${rediskey}.`);
            reject(new Error('Redis found empty data.'));
          } else {
            try {
              let d = JSON.parse(data);
              //console.log(typeof d, Object.prototype.toString.call(d));
              // TOFIX: validate this in real redis
              if (Object.prototype.toString.call(d) == '[object String]') {
                data = d;
              }
            } catch (e) {
              // go on
            }
            resolve(data);
          }
        });
    });
  }

  _write(path, key, data) {
    return new Promise((resolve, reject) => {
      this._client.set(
        this.formatRedisKey(path, key),
        JSON.stringify(data),
        (err, obj) => {
          if (err) {
            logger.error(`Redis write error: ${JSON.stringify(err)}`);
            reject(err);
          } else {
            resolve(obj);
          }
        });
    });
  }

  _scan(path) {
    return new Promise((resolve, reject) => {
      let cursor = 0;
      let pattern = `${path}_*`;
      let batch = '1000';
      let redisclient = this._client;

      function _scan(client, cursor, pattern, batch, callback) {
        client.scan(
          cursor, 
          'MATCH', pattern,
          'COUNT', batch,
          (err, res) => {
            if (err) {
              logger.error(`Redis scan error: ${JSON.stringify(err)}`);
              callback(err);
            } else {
              let [next_cursor, keys] = res;
              if (keys.length > 0) {
                callback(null, keys);
              }
              if (next_cursor != 0) {
                _scan(client, next_cursor, pattern, batch, callback);
              } else {
                callback(null, null, true);
              }
            }
          });
      }

      let allkeys = [];
      _scan(redisclient, cursor, pattern, batch, (err, keys, finished) => {
        if (err) {
          reject(err);
        } else if (!finished) {
          allkeys = allkeys.concat(keys.map((key) => {
            // remove prefix `${path}_`
            return key.substring(path.length + 1);
          }));
        } else if (finished) {
          resolve(allkeys);
        }
      });
    });
  }

  _del(path, key) {
    return new Promise((resolve, reject) => {
      let rediskey = this.formatRedisKey(path, key);
      this._client.del(rediskey,
        (err, _resp) => {
          if (err) {
            logger.error(`Redis del error: ${JSON.stringify(err)}`);
            reject(err);
          } else {
            resolve();
          }
        });
    });
  }
}
