import objectToPostgrestQuery from "./index.js";

const obj = {
	order: {
		age: 'desc',  // Order by age in descending order
		name: 'asc'   // Order by name in ascending order
	}
};
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
