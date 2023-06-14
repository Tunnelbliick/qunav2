const jwt = require('jsonwebtoken');

export async function encrypt(userid: string) {

	return jwt.sign(userid, process.env.jwt);

}

export async function decrypt(userid: string) {

	return jwt.verify(userid, process.env.jwt);

}