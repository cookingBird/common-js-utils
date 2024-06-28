import Schema, { type Rules, type Rule } from 'async-validator';
const _toString = Object.prototype.toString

/**
 * @description 是否为数组
 */
export function isArray(t: any) {
  return Array.isArray(t)
}

export function isFunction(t: any) {
  return _toString.call(t).toLowerCase() === '[object function]'
}

/*验证pad还是pc*/
export function validatePc(): boolean {
  const userAgentInfo = navigator.userAgent
  const Agents = [
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod',
  ]
  let flag = true
  for (const agent of Agents) {
    if (userAgentInfo.indexOf(agent) > 0) {
      flag = false
      break
    }
  }
  return flag
}

export function isNull(v: any) {
  return v === null || v === 'null'
}

export function isUndefined(v: any) {
  return v === void 0 || v === 'undefined'
}

export function isObject(v: any) {
  return _toString.call(v).toLowerCase() === '[object object]'
};

export function isEnsure(v: any) {
  return !isNull(v) && !isUndefined(v)
}

export function createFormValidator(descriptors: Rules) {
  return new Schema(descriptors)
}

export function getRulesFromFormOps(cols: RuleBuildOps[]) {
  return cols
    .filter(col => typeof col.if === 'function')
    .reduce<Rules>((pre, cur) => {
      const { prop, rules, slotIs, required, label, readonly } = cur;
      const ifExist = cur.if === void 0 ? true : cur.if;
      if (rules) {
        return {
          ...pre,
          [prop]: rules
        }
      } else if (!readonly && ifExist) {
        const res = { ...pre };
        if (required) {
          let message;
          if (slotIs === 'select' || slotIs === 'datePicker') {
            message = '请选择'
          }
          if (slotIs === 'input') {
            message = '请填写'
          }
          message = message + label.replace(/(:|：)/i, '');

          res[prop] = [{ required: true, message }];
        }
        return res;
      } else {
        return pre;
      }
    }, {})
}
type RuleBuildOps = {
  prop: string
  rules: Rule
  label: string
  slotIs?: string
  required?: boolean
  readonly?: boolean
  if?: boolean | Function
}
