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
	limit: Number(100),
	offset: Number(100),
	order: {
		slug:  "",
		updated_at:  "desc",

	},
	slug: {ilike:`*${"n"}*`}
});
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
