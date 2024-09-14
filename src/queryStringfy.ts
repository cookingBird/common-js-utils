import { stringify, type IStringifyOptions } from 'qs'
export default function queryStringfy(obj: Record<string, any>, options?: IStringifyOptions) {
  return stringify(obj, options)
}
