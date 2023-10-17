const objectToPostgrestQuery = require('./lib/cjs/index.js').default

const obj = {
	limit: 1,
	offset: 1,
	order: {
		updated_at: "j"
	},
	slug:  {ilike:`*${"undefined"}*`}
};


const postgrestQuery = objectToPostgrestQuery(obj);
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
