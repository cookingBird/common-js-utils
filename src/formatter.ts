export function matchTime(date:string) {
	return date?.match(/^\d{4}[\/:-_\S]\d{1,2}[\/:-_\S]\d{1,2}/)?.[0]
}
