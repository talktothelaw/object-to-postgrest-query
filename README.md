# object-to-postgrest-query

Converts a JavaScript object into a query string compatible with PostgREST, making it easier to construct queries for a
PostgreSQL database via PostgREST.

## Installation

```bash
npm install object-to-postgrest-query --save
```

or

```bash
yarn add object-to-postgrest-query
```

## Usage

Import the objectToPostgrestQuery function from the package, and pass your query object to it. By default, the function
will return an object where keys are the query parameters and values are the query values, formatted for use with
PostgREST. If you pass true as the second argument, the function will return a URL-encoded string instead.

```javascript
import objectToPostgrestQuery from 'object-to-postgrest-query';

const obj = {
	name: { 'ilike': 'John' },
	age: { 'gte': 25 },
	number: "Undefined", // this key and value wull be removed 
	place: "null", // this key and value wull be removed
	tags: { 'cs': '{example,new}' }
};

// Get query as an object
const postgrestQueryObject = objectToPostgrestQuery(obj);
console.log(postgrestQueryObject);

// Get query as a URL-encoded string and set other options
const postgrestQueryString = objectToPostgrestQuery(obj, {
	isUrlParams: false,
	removeUndefinedStringValue: true, // removes Undefined even as a string
	removeNullStringValue: true //removes null even as a string
});
console.log(postgrestQueryString);
```

## Query Object Format

The query object should be formatted as follows:

```typescript
interface QueryObject {
	[key: string]: string | { [operator: string]: string | number | Array<string | number> };
}
```

## Options

| Property                     | Type    | Description                                                                                       |
|------------------------------|---------|---------------------------------------------------------------------------------------------------|
| `isUrlParams`                | Boolean | Indicates whether the value is URL parameters. Default is `false`.                                |
| `removeUndefinedStringValue` | Boolean | If `true`, removes "Undefined" from the value, even if it appears as a string. Default is `true`. |
| `removeNullStringValue`      | Boolean | If `true`, removes "null" from the value, even if it appears as a string. Default is `true`.      |

Each key represents a column in your PostgreSQL database, and the value represents the condition for that column.
Conditions can be specified as a simple string or number, or as an object with a single key representing the operator,
and the value representing the value for the condition.

## Supported Operators

| Operator                | Description                                                                                                                                                  | Example                                       | Output (isUrlParams = true)    |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|--------------------------------|
| eq                      | Checks if the value is exactly the same as another value. It's like saying, "Is my age exactly 25?"                                                          | `{ age: { eq: 25 } }`                         | `"age=eq.25"`                  |
| gt                      | Checks if a number is bigger than another number. It's like asking, "Is my age greater than 20?"                                                             | `{ age: { gt: 20 } }`                         | `"age=gt.25"`                  |
| gte                     | Checks if a number is bigger than or the same as another number. Like asking, "Is my age 20 or more?"                                                        | `{ age: { gte: 20 } }`                        | `"age=gte.25"`                 |
| lt                      | Checks if a number is smaller than another number. It's like asking, "Is my age less than 30?"                                                               | `{ age: { lt: 30 } }`                         | `"age=lt.25"`                  |
| lte                     | Checks if a number is smaller than or the same as another number. Like asking, "Is my age 30 or less?"                                                       | `{ age: { lte: 30 } }`                        | `"age=lte.25"`                 |
| neq                     | Checks if the value is not the same as another value. It's like saying, "Is my name anything other than 'John'?"                                             | `{ name: { neq: 'John' } }`                   | `"age=neq.25"`                 |
| like                    | Looks for similar values but cares about uppercase and lowercase letters. Like finding names that start with 'Jo'.                                           | `{ name: { like: 'Jo%' } }`                   | `"name=like.John%25"`          |
| ilike                   | Looks for similar values but doesn't care about uppercase or lowercase letters. Like finding names that start with 'jo' or 'Jo'.                             | `{ name: { ilike: 'jo%' } }`                  | `"name=ilike.john%25"`         |
| match                   | Checks if values match a special pattern you create. It's like creating a small game to find matching values.                                                | `{ name: { match: '^Jo' } }`                  | `"name=~.%5EJohn"`             |
| imatch                  | Same as match but doesn't care about uppercase or lowercase letters.                                                                                         | `{ name: { imatch: '^jo' } }`                 | `"name=~*.%5Ejohn"`            |
| in                      | Checks if the value is one of the values in a list you provide. Like asking, "Is my favorite color red, blue, or green?"                                     | `{ color: { in: ['red', 'blue', 'green'] } }` | `"age=in.(25,30)"`             |
| is                      | Checks if the value is true, false, or null. Like asking, "Is the statement true?"                                                                           | `{ statement: { is: true } }`                 | `"active=is.true"`             |
| isdistinct              | Checks if the value is different from another value. Like asking, "Is my age different from 25?"                                                             | `{ age: { isdistinct: 25 } }`                 | `"age=isdistinct.30"`          |
| fts, plfts, phfts, wfts | These operators search for words or phrases in a block of text. It's like playing a game of hide and seek with words!                                        | `{ description: { fts: 'apple' } }`           | `"description=%40%40.example"` |
| cs                      | Checks if a list of values contains the value you provide. Like asking, "Is 'apple' in my list of favorite fruits?"                                          | `{ fruits: { cs: '{apple}' } }`               | `"description=%40%40.example"` |
| cd                      | Checks if a list of values is inside another list of values you provide. Like asking, "Are all my favorite fruits in the fruit basket?"                      | `{ fruits: { cd: '{apple,banana}' } }`        | `"description=%40%40.example"` |
| ov                      | Checks if two lists of values have any values in common. Like asking, "Do my favorite fruits and your favorite fruits have any in common?"                   | `{ myFruits: { ov: '{apple,banana}' } }`      | `"description=%40%40.example"` |
| sl                      | Checks if a range of values is to the left of another range you provide. Like asking, "Is the number range 1 to 10 to the left of 20 to 30?"                 | `{ range: { sl: '[1,10]' } }`                 | `"tags=%40%3E{example,new}"`   |
| sr                      | Checks if a range of values is to the right of another range you provide. Like asking, "Is the number range 20 to 30 to the right of 10 to 15?"              | `{ range: { sr: '[20,30]' } }`                | `"tags=%3C@{example,new}"`     |
| nxr                     | Checks if a range of values does not extend to the right of another range you provide. Like asking, "Does the number range 1 to 10 not go beyond 5 to 15?"   | `{ range: { nxr: '[1,10]' } }`                | `"tags=%26%26{example,new}"`   |
| nxl                     | Checks if a range of values does not extend to the left of another range you provide. Like asking, "Does the number range 5 to 15 not start before 1 to 10?" | `{ range: { nxl: '[5,15]' } }`                | `"range=%3C%3C[1,10]"`         |
| adj                     | Checks if a range of values is right next to another range you provide. Like asking, "Is the number range 1 to 10 right next to 11 to 20?"                   | `{ range: { adj: '[1,10]' } }`                | `"range=%3E%3E[1,10]"`         |
| not                     | Reverses a check. Like saying, "Is the statement not true?"                                                                                                  | `{ statement: { not: true } }`                | `"range=%26%3C[1,10]"`         |
| or                      | Checks if at least one of two conditions is true. Like asking, "Is my age less than 20 or more than 30?"                                                     | `{ age: { or: { lt: 20, gt: 30 } } }`         | `"range=%26%3E[1,10]"`         |
| and                     | Checks if both of two conditions are true. Like asking, "Is my age more than 20 and less than 30?"                                                           | `{ age: { and: { gte: 20, lte: 30 } } }`      | `"range=adj.[1,10]"`           |
| all                     | Checks if all conditions you provide are true. Like asking, "Are all my favorite fruits in the fruit basket?"                                                | `{ fruits: { all: '{apple,banana}' } }`       | `"age=not.25"`                 |
| any                     | Checks if at least one of the conditions you provide is true. Like asking, "Is at least one of my favorite fruits in the fruit basket?"                      | `{ fruits: { any: '{apple,banana}' } }`       | `"age=or.lt.25,gt.30"`         |

Example Ussage

* usage examples for all operators with the given `objectToPostgrestQuery` function, demonstrating how each operator
  would be used within a query object and the corresponding output when `isUrlParams` is set to `true`:

1. **Equals (`eq`)**:

```javascript
const obj = { age: { 'eq': 25 } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=eq.25"
```

2. **Greater Than (`gt`)**:

```javascript
const obj = { age: { 'gt': 20 } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=gt.20"
```

3. **Greater Than or Equal (`gte`)**:

```javascript
const obj = { age: { 'gte': 25 } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=gte.25"
```

4. **Less Than (`lt`)**:

```javascript
const obj = { age: { 'lt': 30 } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=lt.30"
```

5. **Less Than or Equal (`lte`)**:

```javascript
const obj = { age: { 'lte': 30 } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=lte.30"
```

6. **Not Equal (`neq`)**:

```javascript
const obj = { name: { 'neq': 'John' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "name=neq.John"
```

7. **Like (`like`)**:

```javascript
const obj = { name: { 'like': 'Jo%' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "name=like.Jo%"
```

8. **ILike (`ilike`)**:

```javascript
const obj = { name: { 'ilike': 'jo%' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "name=ilike.jo%"
```

9. **Match (`match`)**:

```javascript
const obj = { name: { 'match': '^Jo' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "name=~.^Jo"
```

10. **IMatch (`imatch`)**:

```javascript
const obj = { name: { 'imatch': '^jo' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "name=~*.^jo"
```

11. **In (`in`)**:

```javascript
const obj = { age: { 'in': [25, 30] } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=in.(25,30)"
```

12. **Is (`is`)**:

```javascript
const obj = { active: { 'is': true } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "active=is.true"
```

13. **Is Distinct (`isdistinct`)**:

```javascript
const obj = { age: { 'isdistinct': 30 } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=isdistinct.30"
```

14. **Full Text Search (`fts`)**:

```javascript
const obj = { description: { 'fts': 'apple' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "description=@@.apple"
```

15. **Prefix Full Text Search (`plfts`)**:

```javascript
const obj = { description: { 'plfts': 'appl' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "description=@@.appl"
```

16. **Phrase Full Text Search (`phfts`)**:

```javascript
const obj = { description: { 'phfts': 'red apple' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "description=@@.red apple"
```

17. **Websearch Full Text Search (`wfts`)**:

```javascript
const obj = { description: { 'wfts': 'apple' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "description=@@.apple"
```

18. **Contains (`cs`)**:

```javascript
const obj = { tags: { 'cs': '{example,new}' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "tags=@>.{example,new}"
```

19. **Contained By (`cd`)**:

```javascript
const obj = { tags: { 'cd': '{example,new}' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "tags=<@.{example,new}"
```

20. **Overlaps (`ov`)**:

```javascript
const obj = { tags: { 'ov': '{example,new}' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "tags=&&.{example,new}"
```

21. **Strictly Left Of (`sl`)**:

```javascript
const obj = { range: { 'sl': '[1,10]' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "range=<<.[1,10]"
```

22. **Strictly Right Of (`sr`)**:

```javascript
const obj = { range: { 'sr': '[1,10]' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "range=>>.[1,10]"
```

23. **Does Not Extend To The Right (`nxr`)**:

```javascript
const obj = { range: { 'nxr': '[1,10]' } };
const postgrest

Query = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "range=&<.[1,10]"
```

24. **Does Not Extend To The Left (`nxl`)**:

```javascript
const obj = { range: { 'nxl': '[1,10]' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "range=&>.[1,10]"
```

25. **Is Adjacent To (`adj`)**:

```javascript
const obj = { range: { 'adj': '[1,10]' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "range=-|-.[1,10]"
```

26. **Ordering (`order`)**:

```javascript
const obj = {
	order: {
		age: 'desc',  // Order by age in descending order
		name: 'asc'   // Order by name in ascending order
	}
};
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=order.desc&name=order.asc"
```

27. **Or (`or`)**:

```javascript
const obj = { age: { 'or': { 'lt': 25, 'gt': 30 } } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=or.lt.25,gt.30"
```

28. **And (`and`)**:

```javascript
const obj = { age: { 'and': { 'gte': 25, 'lte': 30 } } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=and.gte.25,lte.30"
```

29. **And (`and`)**:

```javascript
const obj = { age: { 'and': { 'gte': 25, 'lte': 30 } } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "age=and.gte.25,lte.30"
```

30. **All (`all`)**:

```javascript
const obj = { tags: { 'all': '{example,new}' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "tags=all.{example,new}"
```

31. **Any (`any`)**:

```javascript
const obj = { tags: { 'any': '{example,new}' } };
const postgrestQuery = objectToPostgrestQuery(obj, true);
console.log(postgrestQuery);  // Output: "tags=any.{example,new}"
```

These examples demonstrate how the `objectToPostgrestQuery` function interprets different operators and formats them
into a query string compatible with PostgREST when `isUrlParams` is set to `true`.

## Contributing

Feel free to open issues or pull requests to improve the package.

---
