import fs from 'fs';
import path from 'path';

import DataStore from './DataStore';

export default class LocalFileDataStore extends DataStore {

  constructor() {
    super();
  }

  formatFilePath(path, key) {
    return `${path}_${key}.json`;
  }

  // Override
  _read(path, key) {
    return new Promise((resolve, reject) => {
      fs.readFile(this.formatFilePath(path, key), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Override
  _write(path, key, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.formatFilePath(path, key), data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  _scan(the_path) {
    let dir = path.dirname(the_path);
    let prefix = path.basename(the_path);
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          reject(err);
        } else {
          let keys = [];
          files.map((file) => {
            let re = new RegExp(prefix + '_([^_]+).json', 'g');
            let m = re.exec(file);
            if (m) {
              keys.push(m[1]);
            }
          });
          resolve(keys);
        }
      });
    });
  }

  _del(path, key) {
    return new Promise((resolve, reject) => {
      fs.unlink(this.formatFilePath(path, key), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
