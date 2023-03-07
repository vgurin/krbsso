import createError from 'http-errors';
import {Request,Response,NextFunction} from 'express';

function negotiate () {
  return async (req:Request, res:Response, next:NextFunction) => {
    const authenticationToken = req.get('authorization');

	if (!authenticationToken) {
      return res.status(401).set('WWW-Authenticate', 'Negotiate')
	  .send("Требуется Аутентификация Kerberos").end();
    } 

    if (authenticationToken.lastIndexOf('Negotiate') !== 0) {
      return next(createError(400, `Malformed authentication token ${authenticationToken}`));
    }

    next();

  }
}
export default negotiate