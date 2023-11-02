const objectToPostgrestQuery = require('./lib/cjs/index').default


const postgrestQuery = objectToPostgrestQuery({
	limit: Number(2),
	offset: Number(100),
	s:{
		eq: ""
	},
	order: {
		slug: false,
		updated_at:  "desc",

	},
	slug: {ilike:`*${"n"}*`}
});
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
