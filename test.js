const objectToPostgrestQuery = require('./lib/cjs/index').default

const obj = {
	limit: 1,
	offset: 1,
	order: {
		updated_at: "asc.nullsfirst"
	},
	slug:  {ilike:`*${"undefined"}*`}
};


const postgrestQuery = objectToPostgrestQuery({
	limit: Number(2),
	offset: Number(100),
	order: {
		slug: false,
		updated_at:  "desc",

	},
	slug: {ilike:`*${"n"}*`}
});
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
