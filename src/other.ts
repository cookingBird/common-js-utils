import type {
	PromiseResolver,
	PromiseRejector,
	NOOP,
	PickFunc
} from '@gislife/types/tools';
import * as Validator from "./validator";
import CryptoJS from "crypto-js";
import { Base64Util } from './browser';



/**
 * @description get cache from useStorage
 * @deprecated please use @vueuse/core
 */
export async function getCache<T>(
	cacheName: string,
	fallback: () => PromiseLike<T>,
	cacheType: 'session' | 'local' = 'session'): Promise<T> {

	const _storage = cacheType === 'session' ? window.sessionStorage : window.localStorage;

	let res = _storage.getItem(cacheName) as unknown;
	if (res === null) {
		try {
			res = await fallback()
		} catch (error) {
			if (error instanceof Error) {
				throw Error(error.message)
			}
		}
	}

	return res as T;
}


/**
 * @description 下载blob
 */
export function downLoadBlob(
	res: Blob,
	fileName: string,
	options: BlobPropertyBag & { type?: string } = {}) {
	switch (options.type) {
		case 'zip':
			options.type = 'application/zip';
			break;
		case 'xls':
			options.type = 'application/vnd.ms-excel';
			break;
		case 'xlsx':
			options.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			break;
		case 'docx':
			options.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
			break;
		case 'doc':
			options.type = 'application/msword';
			break;
		case 'pdf':
			options.type = 'application/pdf';
			break;
		default:
			throw Error(`type not support ${options.type}`)
	}

	const blob = res instanceof Blob ? res : new Blob([res], options); //构造一个blob对象来处理数据
	const name = fileName || "地质灾害敏感点表.xlsx";
	if ('download' in document.createElement('a')) {
		//支持a标签download的浏览器
		const link = document.createElement('a'); //创建a标签
		link.download = name; //a标签添加属性
		link.style.display = 'none';
		link.href = URL.createObjectURL(blob);
		document.body.appendChild(link);
		link.click(); //执行下载
		URL.revokeObjectURL(link.href); //释放url
		document.body.removeChild(link); //释放标签
	} else {
		throw Error("browser don't support")
	}
}

/**
 * @description 选择上传文件
 */
export function fileSelector(ops: Partial<HTMLInputElement> = {}): Promise<File> {
	let resolver: PromiseResolver<File>
		, rejector: PromiseRejector;
	const promise = new Promise<File>((resolve, reject) => {
		resolver = resolve;
		rejector = reject;
	});

	const fileSelector = document.createElement('input');
	fileSelector.type = 'file';
	fileSelector.accept = ops.accept || '.xls,.xlsx';
	fileSelector.multiple = ops.multiple || false;
	fileSelector.style.position = 'absolute';
	fileSelector.style.height = '0px';
	fileSelector.style.display = 'none';
	fileSelector.oninput = function (e) {
		const input = e.target;
		if (input) {
			//@ts-expect-error
			const files = input.files;
			resolver(files);
		}
		fileSelector.remove();
	};
	fileSelector.oncancel = function (e) {
		fileSelector.remove();
		rejector(e);
	};

	document.body.appendChild(fileSelector);
	fileSelector.click();

	return promise;
}

/** @description base64编码 */
export function encode(str: string) {
	// 对字符串进行编码
	// const encode = encodeURIComponent(str);
	const encode = encodeURI(str);
	// 对编码的字符串转化base64
	const base64 = btoa(encode);
	return base64;
}

/**@description base64解码 */
export function decode(base64: string) {
	// 对base64转编码
	const decode = atob(base64);
	// 编码转字符串
	// const str = decodeURIComponent(decodeURI(decode));
	const str = (decodeURI(decode));
	return str;
}



/**@description object map to array */
export function entiresMap<T>(obj: Object, mapCb: (tar: [string, any], level: number, index: number) => T): T[] {
	function _entriesMap(tar: Object, level = 0) {
		return Object
			.entries(tar)
			.map(([key, val], index) => {
				const tar = [
					key,
					Validator.isObject(val)
						? _entriesMap(val, level + 1)
						: val] as unknown as [string, any];
				return mapCb(tar, level, index)
			})
	}
	return _entriesMap(obj)
}


/**@description 在timeout的时间内，轮询获取一个元素或实例 */
export function ensureInstance<T = any>(
	fn: () => T,
	type: 'requestAnimationFrame' | 'setTimeout' | 'requestIdleCallback' = 'requestAnimationFrame',
	options: { timer?: number; timeout: number } = {
		timer: 300,
		timeout: 3000
	}
) {
	const { timer, timeout } = options;
	function _ensure(_fn: typeof fn, callback: (value: any) => void, type: string) {
		if (_fn()) {
			return callback(_fn());
		} else {
			if (type === 'requestAnimationFrame') {
				requestAnimationFrame(() => {
					_ensure(_fn, callback, type);
				});
			}

			if (type === 'setTimeout') {
				setTimeout(() => {
					_ensure(_fn, callback, type);
				}, timer);
			}

			if (type === 'requestIdleCallback') {
				requestIdleCallback(
					() => {
						_ensure(_fn, callback, type);
					},
					{ timeout: timer }
				);
			}
		}
	}

	return new Promise<T>((resolve, reject) => {
		setTimeout(() => reject('timeout'), timeout);
		_ensure(fn, resolve, type);
	});
}




/**@description 设置一个ctx中的某些字段值，支持.访问符 */
export function getCtxValueSetter(ctx: Record<string, any>, filedLike: string) {
	const fileds = filedLike.split('.');
	const length = fileds.length;
	return (value: any) => {
		let context = ctx;
		fileds.forEach((val, index) => {
			if (index < length - 1) {
				context = context[val];
			} else {
				context[val] = value;
			}
		});
	};
}

/**@description 获取一个ctx中的某一字段值，支持.访问符 */
export function getCtxValue(ctx: Record<string, any>, filedLike: string) {
	const fileds = filedLike.split('.');
	let val = ctx;
	fileds.forEach(key => {
		val = val[key];
	});
	return val;
}


/**@description 返回了一个得到每个Item[filedKey]唯一对应的值的函数，fallback为生成对应值的函数 */
export function createFieldRecordCtx(fallback: () => any) {
	const ctx: Record<string, any> = {};
	if (typeof fallback === 'string') {
		switch (fallback) {
			case 'randomColor': {
				fallback = randomColor;
				break;
			}
		}
	}

	return function getValue(filedKey: string, isGetCtx = false) {
		if (isGetCtx) {
			return ctx;
		}

		if (!ctx[filedKey]) {
			ctx[filedKey] = fallback();
			return ctx[filedKey];
		} else {
			return ctx[filedKey];
		}
	};
}

/**@description 获取一个HEX格式的随机颜色 */
export function randomColor() {
	return (
		'#' +
		('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).substr(-6)
	);
}

/**@description 通过URL下载文件
 * @param  {string} url
 * @param  {boolean} rename
 * @param  {string} name
 */
export function downloadURL(url: string, rename = false, name = '默认名称') {
	if (!rename) {
		const link = document.createElement('a');
		link.download = name;
		link.href = url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} else {
		const x = new XMLHttpRequest();
		//url with name
		const matches1 = url.match(/\.(\w+)$/);
		const suffix1 = matches1?.[1];
		const matches2 = name.match(/\.(\w+)$/);
		const fileName = matches2?.[1]

		x.open('GET', url, true)
		x.responseType = 'blob'
		x.onload = function () {
			const url = window.URL.createObjectURL(x.response)
			const a = document.createElement('a')
			a.href = url
			a.download = fileName
				? fileName + '.' + suffix1
				: name
			a.click()
		}
		x.send()
	}
}


export function deCryptoAES(base64edValue: string, _key: string = Base64Util.parse('OSEjOTVoc3VwKiYkMXpxNw==')) {
	console.log('deCryptoAES');
	const _c = CryptoJS.enc.Base64.parse(base64edValue);
	const de = CryptoJS.AES.decrypt(
		{
			ciphertext: _c
		} as CryptoJS.lib.CipherParams,
		CryptoJS.enc.Utf8.parse(_key),
		{
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		}
	);
	const res = de.toString(CryptoJS.enc.Utf8);
	return res;
};


/**
 * @description 将单个元素转为对象
 */
export function toArray<T>(tar: T | T[]): T[] {
	return Array.isArray(tar) ? tar : [tar];
}

/**
 * @description 代理instance上的某个方法
 */
export function proxyMethod<T extends Record<string, any>, P extends keyof PickFunc<T>, R extends (...args: any) => any = T[P]>(instance: T, method: P, enhanceCb: (this: T, raw: T[P], ...params: Parameters<R>) => ReturnType<R>): NOOP {
	if (!instance[method] || typeof instance[method] !== 'function') {
		console.warn('proxy method error', typeof instance[method])
	};
	const rawMethod = instance[method] as Function;
	// @ts-expect-error
	instance[method] = function (...args: any[]) {
		return (enhanceCb as Function).call(this, rawMethod.bind(this), ...args);
	};
	return () => {
		// @ts-expect-error
		instance[method] = rawMethod;
	}
}
