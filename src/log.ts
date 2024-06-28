export function logGroup(groupTitle: string, info?: any, groupStyle: string = 'color:red;font-size:22px;'): void {
  console.group(`%c >>>>>>>>>>>>>>>>>>>> ${groupTitle} >>>>>>>>>>>>>>>>>>>>`, groupStyle)
  if(info) {
    console.log(info)
    console.log('%c <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', groupStyle)
  }
  console.groupEnd()
}
export function logGroupError(groupTitle: string, info?: any, fontSize: string = '22px'): void {
  const groupStyle: string = `color:red;font-size:${fontSize};`
  console.group(`%c >>>>>>>>>>>>>>>>>>>> ${groupTitle} >>>>>>>>>>>>>>>>>>>>`, groupStyle)
  if(info) {
    console.log(info)
    console.log('%c <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', groupStyle)
  }
  console.groupEnd()
}
export function logGroupSuccess(groupTitle: string, info?: any, fontSize: string = '22px'): void {
  const groupStyle: string = `color:green;font-size:${fontSize};`
  console.group(`%c >>>>>>>>>>>>>>>>>>>> ${groupTitle} >>>>>>>>>>>>>>>>>>>>`, groupStyle)
  if(info) {
    console.log(info)
    console.log('%c <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', groupStyle)
  }
  console.groupEnd()
}
export function logGroupWarn(groupTitle: string, info?: any, fontSize: string = '22px'): void {
  const groupStyle: string = `color:yellow;font-size:${fontSize};`
  console.group(`%c >>>>>>>>>>>>>>>>>>>> ${groupTitle} >>>>>>>>>>>>>>>>>>>>`, groupStyle)
  if(info) {
    console.log(info)
    console.log('%c <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', groupStyle)
  }
  console.groupEnd()
}
