const jwt = require('jsonwebtoken');
import jwt_decode from "jwt-decode";

export async function encrypt(userid: string) {

	return jwt.sign(userid, process.env.jwt);

}

export async function decrypt(userid: string) {

	return jwt.verify(userid, process.env.jwt);

}