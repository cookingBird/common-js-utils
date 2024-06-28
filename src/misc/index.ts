export function patchSrc(rawSrc: string, params: string) {
  if (!rawSrc) { throw Error('src does not exist') };
  if (!params) {
    console.warn('params does not exist');
    return rawSrc;
  }
  const ps = params
    .replace('?', '')
    .split('&')
    .reduce<Record<string, any>>((pre, cur) => {
      const [key, v] = cur.split('=');
      return {
        ...pre,
        [key]: v
      }
    }, {});
  const [origin, rawQuery] = rawSrc.split('?');
  const rawPs = (rawQuery || '')
    .split('&')
    .reduce<Record<string, any>>((pre, cur) => {
      const [key, v] = cur.split('=');
      return {
        ...pre,
        [key]: v
      }
    }, {});
  const newPs = {
    ...rawPs,
    ...ps
  };
  return origin
    + '?'
    + Object.entries(newPs)
      .reduce<string>((pre, [k, v]) => pre + `${k}=${v}`, '')
};
