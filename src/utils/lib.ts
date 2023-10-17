export default function containsUndefinedString(value: any): boolean {
	if (typeof value === 'object') {
		return Object.values(value).some((val:any) => val?.includes?.('undefined'));
	}
	return false;
}
