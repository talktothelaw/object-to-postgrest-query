export interface QueryOperators {
	[key: string]: string | number | { [operator: string]: string | number | Array<string | number> };
}

export interface OrderObject {
	order?: { [key: string]: 'asc' | 'desc' | 'asc.nullsfirst' | 'desc.nullslast' | string | undefined | null | any };
}

export enum OrderValues {
	ASC = 'asc',
	DESC = 'desc',
	ASC_NULLS_FIRST = 'asc.nullsfirst',
	DESC_NULLS_LAST = 'desc.nullslast'
}

type QueryObject = QueryOperators & OrderObject;

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

interface IObjectToPostgrestQueryOptions {
	isUrlParams: boolean
	removeUndefinedStringValue: boolean
	removeNullStringValue: boolean
}

const defaultOptions = {
	isUrlParams: false,
	removeUndefinedStringValue: true,
	removeNullStringValue: true
}

function containsUnwantedString(value: any, options: Omit<IObjectToPostgrestQueryOptions, "isUrlParams">): boolean {
	let hasErrorOne = false
	let hasErrorTwo = false
	if (options.removeNullStringValue) {
		hasErrorOne =/null(?![a-z])/i.test(JSON.stringify(value))
	}
	if (options.removeUndefinedStringValue) {
		hasErrorTwo = /undefined(?![a-z])/i.test(JSON.stringify(value))
	}

	return hasErrorOne ? hasErrorOne : hasErrorTwo;
}

export default function objectToPostgrestQuery(
	obj: QueryObject,
	options: IObjectToPostgrestQueryOptions
): Record<string, string> | string {
	
	const params: Record<string, string> = {};
	const urlParams = new URLSearchParams();
	const { isUrlParams, ...otherOptions } = { ...defaultOptions, ...options }
	
	Object.entries(obj).forEach(([key, value]) => {
		if (key === 'order') {
			handleOrder(value);
		} else if (isValidValue(value)) {
			if (typeof value === 'object') {
				return handleObjectValue(key, value);
			}
			
			handlePrimitiveValue(key, value);
		}
	});
	
	function handleOrder(order: string | number | { [p: string]: string | number | Array<string | number | OrderValues> }) {
		if (!order) return;
		if (containsUnwantedString(order, otherOptions)) return;
		const orderings = Object.entries(order)
			.filter(([, val]) => isValidValue(val))
			.map(([key, val]) => `${key}.${val}`)
			.join(',');
		if (orderings) {
			addToParams('order', orderings);
		}
	}
	
	function handleObjectValue(key: string, value: object) {
		if (containsUnwantedString(value, otherOptions)) return;
		const [operator, operand] = Object.entries(value)[0];
		const formatted = formatValue(key, operator, operand);
		addToParams(formatted.split('=')[0], formatted.split('=')[1]);
	}
	
	function handlePrimitiveValue(key: string, value: string | number) {
		if( containsUnwantedString(value, otherOptions))return;
		addToParams(key, value.toString());
	}
	
	function addToParams(key: string, value: string) {
		if (isUrlParams) {
			urlParams.append(key, value);
		} else {
			params[key] = value;
		}
	}
	
	
	function isValidValue(value: any): boolean {
		return value !== null && value !== undefined && value !== '';
	}
	
	return isUrlParams ? urlParams.toString() : params;
}



