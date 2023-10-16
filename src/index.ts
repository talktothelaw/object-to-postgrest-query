interface QueryOperators {
	[key: string]: string | number | { [operator: string]: string | number | Array<string | number> };
}

interface OrderObject {
	order?: { [key: string]: 'asc' | 'desc' | 'asc.nullsfirst' | 'desc.nullslast' | string | undefined | null };
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
		if (key !== 'order' && typeof value === 'object' && value !== null) {
			const [operator, operand] = Object.entries(value)[0];
			const formatted = formatValue(key, operator, operand);
			if (isUrlParams) {
				urlParams.append(formatted.split('=')[0], formatted.split('=')[1]);
			} else {
				params[formatted.split('=')[0]] = formatted.split('=')[1];
			}
		} else if (key !== 'order') {
			if (isUrlParams) {
				urlParams.append(key, value?.toString?.());
			} else {
				params[key] = value as string;
			}
		}
	}
	
	// Handle ordering (if specified)
	if (obj.order) {
		const orderings = Object.entries(obj.order)
			.filter(([key, value]) => value !== undefined && value !== '')
			.map(([key, value]) => `${key}.${value}`)
			.join(',');
		if (orderings) {  // check if 'orderings' is not an empty string after filtering
			if (isUrlParams) {
				urlParams.append('order', orderings);
			} else {
				params['order'] = orderings;
			}
		}
	}
	
	return isUrlParams ? urlParams.toString() : params;
}

// // test
// const obj = {
// 	order: {
// 		age: 'desc',  // Order by age in descending order
// 		name: 'asc'   // Order by name in ascending order
// 	}
// };
// const postgrestQuery = objectToPostgrestQuery(obj, true);
// console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
