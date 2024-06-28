import { ParamsTypeError } from ".";

export function intercepterFuncParam<P extends unknown[] = any[], R = any>(fn: (...p: P) => R, intercepterFn: (...p: P) => void) {
  return function (...params: P) {
    intercepterFn(...params);
    return fn(...params);
  }
}
export function intercepterFuncResult<P extends unknown[] = any[], R1 = any, R2 = any>(fn: (...p: P) => R1, intercepterFn: (res: R1) => R2) {
  return function (...params: P) {
    return intercepterFn(fn(...params));
  }
}

export function functionInvoker(fn: any, ...params: unknown[]) {
  if (typeof fn === 'function')
  {
    return fn(...params)
  } else
  {
    throw new ParamsTypeError()
  }
}
