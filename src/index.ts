

interface DataField {
	[key: string]: { [key in keyof typeof operatorMap]?: string | number | Array<string | number> | object } | number | string | boolean ;
}

export interface QueryOperators {
	select?: string;
}


const allowedOrdering = ['asc', 'desc', 'asc.nullsfirst', 'desc.nullslast']

export interface OrderObject {
	order?: { [key: string]: 'asc' | 'desc' | 'asc.nullsfirst' | 'desc.nullslast' | undefined | null | boolean | string };
}


type QueryObject = QueryOperators | OrderObject | DataField;

const operatorMap = {
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
	const op = operatorMap[operator as keyof typeof operatorMap];
	return op ? `${key}=${op}.${value}` : `${key}=${value}`;
}

interface IObjectToPostgrestQueryOptions {
	isUrlParams: boolean
	removeUndefinedStringValue?: boolean
	removeNullStringValue?: boolean
}

const defaultOptions = {
	isUrlParams: false,
	removeUndefinedStringValue: true,
	removeNullStringValue: true
}

function containsUnwantedString(value: object |string | number, options: Omit<IObjectToPostgrestQueryOptions, "isUrlParams">): boolean {
	let hasErrorOne = false
	let hasErrorTwo = false
	if (options.removeNullStringValue) {
		hasErrorOne = /null(?![a-z])/i.test(JSON.stringify(value))
	}
	if (options.removeUndefinedStringValue) {
		hasErrorTwo = /undefined(?![a-z])/i.test(JSON.stringify(value))
	}
	
	return hasErrorOne ? hasErrorOne : hasErrorTwo;
}

export default function objectToPostgrestQuery(
	obj: QueryObject,
	options?: IObjectToPostgrestQueryOptions
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
	
	function handleOrder(order: string | number | { [p: string]: string | number | Array<string | number> }) {
		if (!order) return;
		const orderings = Object.entries(order)
			.filter(([, val]) => isValidValue(val))
			.filter(([, val]) => allowedOrdering.includes(val))
			.map(([key, val]) => `${key}.${val}`)
			.join(',');
		if (orderings) {
			addToParams('order', orderings);
		}
	}
	
	function handleObjectValue(key: string, value: keyof typeof operatorMap | string) {
		if (containsUnwantedString(value, otherOptions)) return;
		if(Object.keys(value).length === 0) {
			const errorObject =  JSON.stringify(value, null, 2)
			throw new Error(`Remove empty query value: ${errorObject}`)
		}
		const [operator, operand] = Object.entries(value)[0];
		const formatted = formatValue(key, operator, operand);
		if(!operand) return;
		addToParams(formatted.split('=')[0], formatted.split('=')[1]);
	}
	
	function handlePrimitiveValue(key: string, value: string | number) {
		if (containsUnwantedString(value, otherOptions)) return;
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



