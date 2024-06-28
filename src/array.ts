import type {
	TwoDemeArrayUnion,
	ArrayTypeKeyof,
	ArrayType,
	IDedRecord,
	ANYOP,
	OptionsConfig,
	NormalOptions
} from "@gislife/types/tools";
import { getCtxValue } from "./other";
import { mapReverse, validateFields } from './object'

/**@description 根据给出的字段，移除数组中的重复元素 */
export function arrayDupRemove (array: Record<string, any>[], ...keyFileds: TwoDemeArrayUnion<ArrayTypeKeyof<typeof array>>) {
	const _keys: ArrayTypeKeyof<typeof array>[] = keyFileds.flat();
	if (_keys.length === 0) {
		return array.reduce((pre, cur) => {
			if (pre.include(cur)) {
				return pre;
			} else {
				return pre.concat(cur);
			}
		}, [])
	} else {
		return array.reduce<typeof array>((pre, curr) => {
			if (pre.findIndex(n => validateFields(n, curr, _keys)) > -1) {
				return pre;
			} else {
				return pre.concat(curr);
			}
		}, []);
	}
}

/**@description 根据key去除数组中的一些元素 */
export function arrayOmit<T extends Record<string, any>[] = IDedRecord[]> (array: T, omits: T, uniqueKey: string = 'id') {
	return array
		.filter(pipe =>
			omits
				.findIndex(p => p[uniqueKey] === pipe[uniqueKey]) === -1);
}


/**@description forEach Picks数组的元素从raw中找到元素，并传入回调 */
export function rawForEach<T extends IDedRecord[] = IDedRecord[]> (
	picks: T,
	raws: T,
	cb: ANYOP,
	uniqueKey: keyof T[number] = 'id'): void {
	raws = raws || [];
	picks = picks || [];
	picks
		.forEach(pipe => {
			const found = raws.find(p => p === pipe)
			if (cb && found) {
				cb(found);
			}
		});
}


/**@description 从picks中映射为raw中的元素，不存则映射为原来的值 */
export function rawMap<T extends Record<string, any>[] = IDedRecord[]> (
	picks: T,
	raws: T,
	uniqueKey: keyof T[number] = 'id') {
	return picks
		.map(p => raws.find(raw => raw[uniqueKey as string] === p[uniqueKey as string]))
		.filter(Boolean)
}


/**@description 根据key合并数组中的元素 */
export function arrayMerge (
	uniqueKey: ArrayTypeKeyof<typeof arrays>,
	...arrays: Record<string, any>[]) {

	arrays = arrays.flat();
	return arrayDupRemove(arrays, uniqueKey);
}



/**@description 统计数组中某个字段值的出现频率 */
export function statisticFiled (
	array: Record<string, any>[],
	Filed: ArrayTypeKeyof<typeof array>,
	resultType: 'array' | 'object' = 'array') {

	if (resultType === 'array') {
		return array
			.reduce<[any, ArrayType<typeof array>[]][]>((pre, cur) => {
				let existIndex = pre.findIndex(i => i[0] === cur[Filed]);
				if (existIndex === -1) {
					existIndex = pre.push([cur[Filed], []]) - 1;
				};
				pre[existIndex][1].push(cur);
				return pre;
			}, []);
	} else {
		return array
			.reduce<Record<string, ArrayType<typeof array>[]>>((pre, cur) => {
				let preVal = pre[cur[Filed]];
				if (!preVal) {
					preVal = pre[cur[Filed]] = [];
				}
				preVal.push(cur);
				return pre;
			}, {});
	}

}


/**@description 映射数组中的每个object的某个filed值,支持使用.访问符 */
export function mergeFiled (array: Record<string, any>[], filedLike: string) {
	return array.map(item => getCtxValue(item, filedLike));
}

/**
 * @description 将一个KV数组，转成一个map
 */
export function array2Map (
	array: Record<string, any>[],
	optionKey: OptionsConfig = {}) {
	return array
		.reduce((pre, cur) => {
			return {
				...pre,
				[cur[optionKey.labelKey || 'label']]: cur[optionKey.valueKey || 'value']
			}
		}, {})
}


/**
 * @description 将一个对象转换为数组
 */
export function map2Array (
	obj: Record<string, string | number>,
	mapRule: "KV" | "VK" = "KV") {

	return Object
		.entries(obj)
		.reduce<Record<string | number, string | number>[]>((pre, cur) => {
			if (mapRule === 'KV') {
				return pre.concat({ label: cur[0], value: cur[1] })
			} else {
				return pre.concat({ label: cur[1], value: cur[0] })
			}
		}, [])
}


/**@description 创建两个数组的历史对照 */
export function createArrayContrast (
	raw: Record<string, any>[],
	...contrastFiled: ArrayTypeKeyof<typeof raw>[]) {

	let history: ArrayType<typeof raw>[] = raw || [];
	contrastFiled = contrastFiled.flat();

	return function contrast (curr: ArrayType<typeof raw>[]) {
		const isAdd = curr.length > history.length;
		let list: ArrayType<typeof raw>[] = [];

		if (isAdd) {
			list =
				curr
					.filter(c =>
						history
							.findIndex(his => validateFields(c, his, contrastFiled)) === -1
					);
		}
		else {
			list =
				history
					.filter(
						f =>
							curr
								.findIndex(his => validateFields(f, his, contrastFiled)) === -1
					);
		}
		history = curr;
		return {
			isAdd: isAdd,
			list: list,
		};
	};
}









export class Options {
	readonly options;
	readonly labelKey: string = 'label';
	readonly valueKey: string = 'value';
	readonly opsMap: Record<PropertyKey, unknown>;
	constructor(array: NormalOptions[], ops: OptionsConfig = {}) {
		this.options = array;
		this.labelKey = ops.labelKey ?? this.labelKey;
		this.valueKey = ops.valueKey ?? this.valueKey;
		this.opsMap = mapReverse(array2Map(this.options, ops), true);
	}

	getOptions () {
		return this.options;
	}

	getMap () {
		return this.opsMap;
	}

	getValueByLabel (label: string) {
		return this.opsMap[label];
	}

	getLabelByValue (value: string) {
		return this.opsMap[value];
	}

	assertValue (value: string, label: string) {
		return label == this.opsMap[value]
	}
}

/**@description 判断数组中每个元素的某个filed值是否相同 */
export function ArrayItemsFiledEqual (array: IDedRecord, filed: keyof IDedRecord = 'id') {
	if (Array.isArray(array) && array.length > 0) {
		return array.slice(1).reduce((pre, cur) => {
			if (cur[filed] === pre[0]) {
				return pre;
			} else {
				return [false, false];
			}
		}, [array[0][filed], true])[1];
	} else {
		return false;
	}
}

