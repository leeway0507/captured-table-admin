import _ from 'lodash';

export default function onvertKeysToCamelCase(obj: any) {
  return _.mapKeys(obj, (_v: any, key: any) => _.camelCase(key));
}
