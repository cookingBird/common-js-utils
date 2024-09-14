import { parse, type IParseOptions } from 'qs'
export default function queryParse(str: string | undefined, options?: IParseOptions) {
  if (!str) return {};
  return parse(str.split('?')[1] || '')
}
