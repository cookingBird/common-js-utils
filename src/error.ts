export class ParamsError extends Error {
	constructor(msg: string = '参数错误') {
		super(msg)
	}
}


export class ParamsTypeError extends ParamsError {
	constructor(msg: string = '参数类型错误') {
		super(msg)
	}
}


export class ParamsLeakError extends ParamsError {
	constructor(msg: string = '缺少必要参数') {
		super(msg)
	}
}


export class ProcessError extends Error {
	constructor(msg: string = '执行错误') {
		super(msg)
	}
}


export class ProcessLeakError extends ProcessError {
	constructor(msg: string = '缺少执行对象') {
		super(msg)
	}
}


export class ProcessTypeError extends ProcessError {
	constructor(msg: string = '执行对象类型错误') {
		super(msg)
	}
}
export class DeprecatedError extends Error {
	constructor(msg: string = '方法已弃用') {
		super(msg)
	}
}
