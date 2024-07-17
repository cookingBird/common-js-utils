import type {
  TreeStructure,
  TwoDemeArrayUnion,
  NOOP,
  ANYOP,
  ParentStruce,
  ObjCamel2KababDeep,
  ObjKabab2CamelDeep,
  ObjectOmit,
} from '@gislife/types/tools';
import { toArray } from './other';
import * as Validator from './validator';
import type { ObjKabab2Camel, ObjCamel2Kabab } from '@gislife/types/tools';

/**@description omit some keys from object */
export function objectOmit<
  T extends Record<PropertyKey, any> = any,
  R extends (keyof T)[] = [],
>(obj: T, ...keys: R) {
  const _keys = keys.flat();
  return Object.entries(obj ?? {}).reduce<{
    [K in keyof T as K extends R[number] ? never : K]: any;
  }>((pre, cur) => {
    const [key, value] = cur;
    // @ts-expect-error
    if (_keys.includes(key)) {
      return pre;
    } else {
      return { ...pre, [key]: value };
    }
  }, {} as any);
}

type Raw = {
  a: 10;
  b: 20;
};
type FlattenTwoDeme<T extends any[] | any[][]> = T extends unknown[][] ? [...T[0]] : T;

/**@description pick一些对象的某些字段值 */
export function objectPick<
  T extends Record<PropertyKey, any> = any,
  R extends (keyof T)[] = [],
>(target: T, ...fields: R) {
  const f = fields.flat();

  return f.reduce<{
    [P in R[number]]: T[P];
  }>(
    (pre, cur) => ({
      ...pre,
      [cur]: target[cur],
    }),
    {} as any,
  );
}

/**
 * @description map obj to another
 */
export function objectMap<T extends Record<PropertyKey, any> = any>(
  obj: T,
  cbOrMap: NOOP | Record<keyof T, any>,
) {
  if (typeof cbOrMap === 'function') {
    return objectVKMap(obj, cbOrMap);
  }
  if (typeof cbOrMap === 'object') {
    return objectVKMap(
      obj,
      (key, value) => {
        const valueMapped = cbOrMap[key];
        if (valueMapped && Array.isArray(valueMapped) && valueMapped.length > 1) {
          if (typeof valueMapped[1] === 'function') {
            return valueMapped[1](value);
          }
        }
        return value;
      },
      (key) => {
        const keyMapped = cbOrMap[key];
        if (keyMapped) {
          return Array.isArray(keyMapped) ? keyMapped[0] : keyMapped;
        }
        return key;
      },
    );
  }
}

/**@description 判断两个对象的某些字段的一致性 */
export function validateFields(
  source: Record<string, any>,
  target: Record<string, any>,
  ...fields: TwoDemeArrayUnion<keyof typeof source & keyof typeof target>
) {
  fields = fields.flat();
  return fields.reduce((pre, curF) => {
    return pre && source[curF] === target[curF];
  }, true);
}

/**
 * @description 反转一个对象的KV
 * @param {object} obj
 * @param {boolean} isCombine 是否结合原对象
 * @returns {object}
 */
export function mapReverse(obj: Record<PropertyKey, unknown>, isCombine = false) {
  return Object.entries(obj).reduce(
    (pre, cur) => {
      const [k, v] = cur;
      return {
        ...pre,
        [v as unknown as PropertyKey]: k,
      };
    },
    isCombine ? { ...obj } : {},
  );
}

/**@description 获取一个对象递归的traveler函数 */
export function getObjectTraveler(visitor: {
  every?: (key: string, value: any, level: number, ctx: Record<string, any>) => void;
}) {
  const { every } = visitor || {};

  return (target: Record<string, any>) => {
    function travel(object: Record<string, any>, level = 0) {
      for (const [key, value] of Object.entries(object)) {
        if (Object.hasOwn(object, key)) {
          every?.(key, value, level, object);
          if (Validator.isObject(value)) {
            travel(value, level + 1);
          }
        }
      }
    }

    travel(target);
  };
}

/**@description 获取一个树状 结构的travel函数 */
export function getTreeTraveler<T extends TreeStructure = any>(target: T | T[]) {
  return function traveler(callback: (node: T) => void) {
    function travel(tar: T | T[]) {
      if (Array.isArray(tar)) {
        tar.forEach((element) => {
          travel(element);
        });
      } else if (typeof tar === 'object') {
        callback(tar);
        if (tar.children?.length) {
          travel(tar.children as T[]);
        }
      }
    }

    travel(target);
  };
}

/**@description object key-value map */
export function objectVKMap<T extends Record<PropertyKey, any> = any>(
  obj: T,
  valueCb: (k: keyof T, v: any, level: number) => any = (k, v) => v,
  keyCb: (k: keyof T) => PropertyKey = (v) => v,
  isMerge: boolean = true,
  deep: boolean = false,
  level = 0,
) {
  return Object.entries(obj).reduce<Record<string, any>>(
    (pre, cur) => {
      const [key, value] = cur;
      if (deep === true && Validator.isObject(value)) {
        pre[key] = objectVKMap(value, valueCb, keyCb, isMerge, deep, level + 1);
      }
      return {
        ...pre,
        [keyCb(key)]: valueCb(key, value, level),
      };
    },
    isMerge ? { ...obj } : {},
  );
}

/**@description 树映射 */
export function treeMap<T extends TreeStructure = {}, R extends Record<string, any> = {}>(
  obj: T | T[],
  mapCb: (obj: T, level: number, array: TreeStructure<R>[], index: number) => R,
): TreeStructure<R>[] {
  function _mapTree(
    obj: T,
    level: number = 0,
    array: TreeStructure<R>[] = [],
    index: number = 0,
  ) {
    const res = mapCb(obj, level, array, index);
    const children = (res.children ?? []) as T[];
    children.map((child, index) =>
      // @ts-expect-error
      _mapTree(child, level + 1, children, index),
    );
    return res;
  }
  const _obj = toArray(obj);
  // @ts-expect-error
  return _obj.map((val, index) => _mapTree(val, void 0, _obj, index));
}

/**@description 扁平化tree */
export function flattenTree<T extends Record<string, any> = {}>(
  tar: TreeStructure<T> | TreeStructure<T>[],
) {
  const res: TreeStructure<T>[] = [];
  const traveler = getTreeTraveler(tar);

  traveler(function (node) {
    res.push(node);
  });
  return res;
}

/**@description 简单合并两个对象，如果value是对象，则递归合并，其它都已后项为高优先级 */
export function mergeObj<R extends Record<string, any>>(
  obj1: R,
  obj2: Partial<R> = {},
): R {
  return Object.entries(obj1).reduce((pre, cur) => {
    const [k, v] = cur;
    const v2 = obj2[k];
    if (Validator.isObject(v) && Validator.isObject(v2)) {
      return { ...pre, [k]: mergeObj(v, v2) };
    } else {
      return {
        ...pre,
        [k]: v2 || v,
      };
    }
  }, {} as R);
}

type ConvertKababToCamel = (kababCase: string) => string;

export const convertKababToCamel: ConvertKababToCamel = (kababCase) => {
  return kababCase.replace(/-([a-z])/g, (_, match) => match.toUpperCase());
};

export function kebab2CamelCase<T extends Record<string, any> | undefined>(
  source: T,
): ObjKabab2Camel<T> | undefined {
  if (source === undefined) return;
  return Object.keys(source).reduce((pre, cur) => {
    const key = convertKababToCamel(cur);
    return {
      ...pre,
      [key]: source[cur],
    };
  }, {} as ObjKabab2Camel<T>);
}
export function kebab2CamelCaseDeep<T extends Record<string, any> | undefined>(
  source: T,
): ObjKabab2CamelDeep<T> | undefined {
  if (source === undefined) return;
  return Object.keys(source).reduce((pre, cur) => {
    const key = convertKababToCamel(cur);
    return {
      ...pre,
      [key]: Validator.isObject(source[cur]) ? kebab2CamelCase(source[cur]) : source[cur],
    };
  }, {} as ObjKabab2CamelDeep<T>);
}

type ConvertCamelToKabab = (camelCase: string) => string;

export const convertCamelToKabab: ConvertCamelToKabab = (camelCase) => {
  return camelCase.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
};

export function camelCase2Kabab<T extends Record<string, any> | undefined>(
  source: T,
): ObjCamel2Kabab<T> | undefined {
  if (source === undefined) return;
  return Object.keys(source).reduce((pre, cur) => {
    const key = convertKababToCamel(cur);
    return {
      ...pre,
      [key]: source[cur],
    };
  }, {} as ObjCamel2Kabab<T>);
}
export function camelCase2KababDeep<T extends Record<string, any> | undefined>(
  source: T,
): ObjCamel2KababDeep<T> | undefined {
  if (source === undefined) return;
  return Object.keys(source).reduce((pre, cur) => {
    const key = convertKababToCamel(cur);
    return {
      ...pre,
      [key]: Validator.isObject(source[cur])
        ? convertCamelToKabab(source[cur])
        : source[cur],
    };
  }, {} as ObjCamel2KababDeep<T>);
}
