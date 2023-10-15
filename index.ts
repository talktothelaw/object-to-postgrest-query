interface QueryOperators {
	[key: string]: string | number | { [operator: string]: string | number | Array<string | number> };
}

interface OrderObject {
	order?: { [key: string]: 'asc' | 'desc' };
}

type QueryObject = QueryOperators & OrderObject;


export default function objectToPostgrestQuery(obj: QueryObject, isUrlParams: boolean = false): { [key: string]: string } | string {
	const params: { [key: string]: string } = {};
	const urlParams = new URLSearchParams();
	
	const operatorMap: { [operator: string]: string } = {
		eq: 'eq',
		gt: 'gt',
		gte: 'gte',
		lt: 'lt',
		lte: 'lte',
		neq: 'neq',
		like: 'like',
		ilike: 'ilike',
		match: '~',
		imatch: '~*',
		in: 'in',
		is: 'is',
		isdistinct: 'isdistinct',
		fts: '@@',
		plfts: '@@',
		phfts: '@@',
		wfts: '@@',
		cs: '@>',
		cd: '<@',
		ov: '&&',
		sl: '<<',
		sr: '>>',
		nxr: '&<',
		nxl: '&>',
		adj: '-|-',
		not: 'not',
		or: 'or',
		and: 'and',
		all: 'all',
		any: 'any'
	};
	
	function formatValue(key: string, operator: string, value: string | number | Array<string | number>): string {
		const op = operatorMap[operator];
		return op ? `${key}=${op}.${value}` : `${key}=${value}`;
	}
	
	for (const [key, value] of Object.entries(obj)) {
		if (key !== 'order' && typeof value === 'object' && value !== null) {  // Exclude 'order' key here
			const [operator, operand] = Object.entries(value)[0];
			const formatted = formatValue(key, operator, operand);
			if (isUrlParams) {
				urlParams.append(formatted.split('=')[0], formatted.split('=')[1]);
			} else {
				params[formatted.split('=')[0]] = formatted.split('=')[1];
			}
		} else if (key !== 'order') {  // Exclude 'order' key here
			if (isUrlParams) {
				urlParams.append(key, value?.toString?.());
			} else {
				params[key] = value as string;
			}
		}
	}
	
	// Handle ordering (if specified)
	if (obj.order) {
		for (const [key, value] of Object.entries(obj.order)) {
			const orderParam = `${key}=order.${value}`;
			if (isUrlParams) {
				urlParams.append(orderParam.split('=')[0], orderParam.split('=')[1]);
			} else {
				params[orderParam.split('=')[0]] = orderParam.split('=')[1];
			}
		}
	}
	
	return isUrlParams ? urlParams.toString() : params;
}
