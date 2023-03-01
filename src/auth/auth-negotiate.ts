'use strict';
import pify from 'pify';
import {Request,Response,NextFunction} from 'express';
import kerberos from 'kerberos';
import createError from 'http-errors';

export interface UserRequest extends Request {
  username?: string,
  auth?: {}
}

async function getTicketUser (token:string)  {
	const krbos = pify(kerberos,{excludeMain:true});
	try {
		const server = await krbos.initializeServer('');
		await server.step(token);
		return server.username;
	} catch (e){
		console.log("Ошибка kerberos");
		return "Ошибка на стадии проверки билета";
	}
	
};

export function auth () {

  return async (req:UserRequest, res:Response, next:NextFunction) => {
    const authenticationToken = req.get('authorization');

	if (!authenticationToken) {
      return res.status(401).set('WWW-Authenticate', 'Negotiate')
	  .send("Требуется Аутентификация Kerberos").end();
    } 

    if (authenticationToken.lastIndexOf('Negotiate') !== 0) {
      return next(createError(400, `Malformed authentication token ${authenticationToken}`));
    }

	const token = authenticationToken.substring('Negotiate '.length);
	const isTokenValid = await getTicketUser(token);

	if (isTokenValid.indexOf('@') !== -1) {
 		req.headers['username'] = isTokenValid.toLowerCase();
    	return next();
	} else {
		return next(createError(400, `Неаутентифицирован ${isTokenValid}`));
	}
  };
};

export default auth