'use strict';
import {Request,Response,NextFunction} from 'express';
import kerberos from 'kerberos';
import createError from 'http-errors';


async function checkTicket (token:string)  {
	try {
		const server = await kerberos.initializeServer('');
		await server.step(token);
		return server.username;
	} catch (e){
		console.log("Ошибка kerberos",e);
		return `Ошибка на стадии проверки билета: ${e}`;
	}
};

export function auth () {

  return async (req:Request, res:Response, next:NextFunction) => {
    const authenticationToken = req.get('authorization');
	const token = authenticationToken.substring('Negotiate '.length);
	const isTokenValid = await checkTicket(token);

	if (isTokenValid.indexOf('@') !== -1) {
 		req.headers['username'] = isTokenValid.toLowerCase();
    	return next();
	} else {
		return next(createError(400, `Неаутентифицирован ${isTokenValid}`));
	}
  };
};

export default auth
