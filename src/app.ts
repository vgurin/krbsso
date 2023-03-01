import express from 'express';
import dotenv from 'dotenv';
import ActiveDirectory from 'activedirectory2';
import auth from "./auth/auth-negotiate.js"
dotenv.config()
const app = express();
const port = 5000;

app.use(auth())
app.get('/', (req, res) => {
	if (req.headers.username) {
		const username = req.headers.username.toString()
		const ad = new ActiveDirectory({
            "url": process.env.AD_LDAP_URL,   //ldap://mydomain.local
            "baseDN": process.env.AD_BASE_DN, //dc=mydomain,dc=local
            "username": process.env.AD_USER,  //administrator@mydomain.local
            "password": process.env.AD_PASS   //password
		});
		ad.findUser(username.split("@")[0], function(err, user:any) {
			if (err) {
				console.log('ERROR: ' +JSON.stringify(err));
				res.send(err);
				return;
			}
			if (! user) console.log('User: ' + user.sAMAccountName + ' not found.');
			else {
				ad.getGroupMembershipForUser(user.sAMAccountName, function(err, groups:any) {
				if (err) {
					console.log('ERROR: ' +JSON.stringify(err));
					res.send(err);
					return;
				}
				if (! groups) console.log('User: ' + user.sAMAccountName + ' not found.');
				else {
					let response = '<p>Имя пользователя: <a href="/login">'+ user.cn + '</a></p><p>Состоит в группах:</p><ul>';
					for (const i in groups) {response += '<li>' + groups[i].cn + '</li>';}
					res.send(response);
				}
				});
			}
		});
	}
})
	
app.get('/login', (req, res) => {
	res.send(`Hello ${req.headers.username}!`)
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
