import express from 'express';
import dotenv from 'dotenv';
import ActiveDirectory from 'activedirectory2';
import {initializeServer} from 'kerberos';
dotenv.config()
const app = express();
const port = 5000;
app.get('/', (req, res) => {
    console.log('***request***');
    console.log(req.headers);

    if (!req.headers.authorization) {
        res.set( 'WWW-Authenticate', 'Negotiate' );
        console.log('***response***');
        console.log(res.getHeaders());
        res.status(401).send();
    } else {
        const ad = new ActiveDirectory({
            "url": process.env.AD_LDAP_URL,   //ldap://mydomain.local
            "baseDN": process.env.AD_BASE_DN, //dc=mydomain,dc=local
            "username": process.env.AD_USER,  //administrator@mydomain.local
            "password": process.env.AD_PASS   //password
		});
		const ticket = req.headers.authorization.substring(10);
		initializeServer('', function(err, server) {
			server.step(ticket,(err)=>{
				if (err) {
					console.log('ERROR: ' +JSON.stringify(err));
					res.send(err);
					return;
				} else {
				console.log(server.username)
			}
			ad.findUser((server.username).split("@")[0], function(err, user:any) {
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
						let response = '<p>Имя пользователя: '+ user.cn + '</p><p>Состоит в группах:</p><ul>';
                        for (const i in groups) {response += '<li>' + groups[i].cn + '</li>';}
                        res.send(response);
					}
					});
				}
				});
			})
		})
	}
});

app.get('/login', (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
