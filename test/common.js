//estremi compresi
function rand(min, max)
{
	return Math.floor(Math.random() * (max + 1 - min)) + min;
}

const charsAllow = "abcdefghijklmnopqrstuvwxyz0123456789"		//			ABCDEFGHIJKLMNOPQRSTUVWXYZ
function randString(min, max)
{
	let toRet = "";
	for (let i = 0; i < rand(min, max); i++) {
		toRet += charsAllow[rand(0, charsAllow.length - 1)];
	}
	return toRet;
}

function generateValue(valueType, max)
{
	switch(valueType)
	{
		case "string":
			return randString(5, max ? max : 10);
		case "int":
			return rand(0, max ? max : 100);
		case "float":
			return rand(0, max ? max : 100);
		case "date":
			return new Date().getTime();
		case "email":
			return randString(10, 40) + "@" + randString(10, 40) + ".com";
		case "mongooseObjectID":
			throw "parameter type not implemented";
		default:
			throw "parameter type not implemented";
	}
}

function expectArguments(res, argsList)
{
	for (let i = 0; i < argsList.length; i++) {
		expect(res.body[argsList[i]]).not.toBe(undefined);
	}
}

function expectArgumentsArray(res, argsList)
{
	for (let i = 0; i < argsList.length; i++) {
		for (let j = 0; j < res.body.length; j++) {
			expect(res.body[j][argsList[i]]).not.toBe(undefined);
		}
	}
}

module.exports = {generateValue, expectArguments, expectArgumentsArray}