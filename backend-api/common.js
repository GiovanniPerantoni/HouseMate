const mongoose = require('mongoose');
const moment = require('moment');

function returnErrorMessage(res, errorCode, message)
{
	res.status(errorCode).send({ "motivation": message });
}

//source: https://www.geeksforgeeks.org/how-to-validate-email-address-using-regexp-in-javascript/
var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//ritorno true se è corretto, false altrimenti
function checkParameterType(parameter, parameterType)
{
	switch(parameterType)
	{
		case "string":
			return typeof parameter == "string";
		case "int":
			return Number.isInteger(parameter);
		case "float":
			return Number.isFinite(parameter)
		case "date":
			return moment(parameter).isValid();
		case "email":
			return typeof parameter == "string" && emailPattern.test(String(parameter).toLowerCase());
		case "mongooseObjectID":
			return mongoose.isValidObjectId(parameter)
		default:
			throw "parameter type not implemented";
	}
}


//ritorno se posso continuare con la richiesta o meno
function checkObligatoryParameters(res, parametersList, parametersType)
{
	for (let i = 0; i < parametersList.length; i++) {
		if(!parametersList[i])		//se anche 1 solo parametro è undefined restituisco l'errore
		{
			returnErrorMessage(res, 400, "Missing parameters in the request.");
			return false;
		}

		if(!checkParameterType(parametersList[i],parametersType[i]))
		{
			returnErrorMessage(res, 400, "Invalid parameters in request.");
			return false;
		}
	}
	
	return true;
}
function checkOptionalParameters(res, parametersList, parametersType)
{
	for (let i = 0; i < parametersList.length; i++) {
		if(parametersList[i] && !checkParameterType(parametersList[i],parametersType[i]))		//se il parametro è presente e non è del tipo corretto restituisco l'errore
		{
			returnErrorMessage(res, 400, "Invalid parameters in request.");
			return false;
		}
	}
	
	return true;
}


//questa funzione è da utilizzare per restituire solo i parametri descritti nella documentazione
function cleanObjectData(objectData, parametersToReturn)
{
	let toRet = {};
	for (let i = 0; i < parametersToReturn.length; i++) {
		toRet[parametersToReturn[i]] = objectData[parametersToReturn[i]];
	}

	return toRet;
}

function cleanObjectDataArray(objectDataArray, parametersToReturn)
{
	let toRet = [];
	for (let i = 0; i < objectDataArray.length; i++) {
		toRet.push(cleanObjectData(objectDataArray[i], parametersToReturn))
	}

	return toRet;
}

module.exports = {returnErrorMessage, checkParameterType, checkObligatoryParameters, checkOptionalParameters, cleanObjectData, cleanObjectDataArray};