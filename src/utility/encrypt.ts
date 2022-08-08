const jwt = require('jsonwebtoken');

export async function encrypt(userid: string) {

	return jwt.sign(userid, process.env.jwt);

}