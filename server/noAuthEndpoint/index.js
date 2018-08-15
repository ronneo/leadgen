import {init as managerInit} from './manager';
import {init as webhookInit} from './webhook';
import {init as fbuserAuthInit} from './fbuserAuth';

export default [
  managerInit,
  webhookInit,
  fbuserAuthInit,
];
