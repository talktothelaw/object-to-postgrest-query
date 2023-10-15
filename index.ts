interface QueryObject {
	[key: string]: string | { [operator: string]: string | number | Array<string | number> };
}

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
		if (typeof value === 'object' && value !== null) {
			const [operator, operand] = Object.entries(value)[0];
			const formatted = formatValue(key, operator, operand);
			if(isUrlParams){
				urlParams.append(formatted.split('=')[0], formatted.split('=')[1]);
			} else {
				params[formatted.split('=')[0]]= formatted.split('=')[1];
				
			}
		} else {
			if(isUrlParams) {
				urlParams.append(key, value);
			} else {
				params[key]= value as string
			}
		}
	}
	return isUrlParams ? urlParams.toString() : params
}
