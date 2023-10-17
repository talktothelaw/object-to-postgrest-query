const objectToPostgrestQuery = require('./lib/cjs/index.js').default

const obj = {
	limit: 0,
	offset: 0,
	order: {
		updated_at: "null"
	},
	slug:  {ilike:`*${undefined}*`}
};


const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
