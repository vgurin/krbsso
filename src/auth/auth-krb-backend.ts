'use strict';
import {Request,Response,NextFunction} from 'express';
import request from 'request';

export function authBackend () {

  return async (req:Request, res:Response, next:NextFunction) => {

	const authenticationToken = req.get('authorization');
	const token = authenticationToken.substring('Negotiate '.length);
	request(
		{
		  url: process.env.BACK_SERVER,
		  headers: { 'authorization': token },
		},
		(err, response, body) => {
			if (err) return res.status(500).send({ message: err })

			req.headers['username'] = body.toLowerCase();
			return next();
		}
	)
  };
};

export default authBackend
