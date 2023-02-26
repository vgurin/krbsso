"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const activedirectory2_1 = __importDefault(require("activedirectory2"));
const kerberos_1 = require("kerberos");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 5000;
app.get('/', (req, res) => {
    console.log('-----request-----');
    console.log(req.headers);
    if (!req.headers.authorization) {
        res.set('WWW-Authenticate', 'Negotiate');
        console.log('-----response-----');
        console.log(res.getHeaders());
        res.status(401).send();
    }
    else {
        const ad = new activedirectory2_1.default({
            "url": "ldap://spb.local",
            "baseDN": "dc=spb,dc=local",
            "username": process.env.AD_USER,
            "password": process.env.AD_PASS
        });
        const ticket = req.headers.authorization.substring(10);
        (0, kerberos_1.initializeServer)('', function (err, server) {
            server.step(ticket, (err) => {
                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    res.send(err);
                    return;
                }
                else {
                    console.log(server.username);
                }
                ad.findUser((server.username).split("@")[0], function (err, user) {
                    if (err) {
                        console.log('ERROR: ' + JSON.stringify(err));
                        res.send(err);
                        return;
                    }
                    if (!user)
                        console.log('User: ' + user.sAMAccountName + ' not found.');
                    else {
                        ad.getGroupMembershipForUser(user.sAMAccountName, function (err, groups) {
                            if (err) {
                                console.log('ERROR: ' + JSON.stringify(err));
                                res.send(err);
                                return;
                            }
                            if (!groups)
                                console.log('User: ' + user.sAMAccountName + ' not found.');
                            else {
                                let response = '<p>Имя пользователя: ' + user.cn + '</p><p>Состоит в группах:</p><ul>';
                                for (const i in groups) {
                                    response += '<li>' + groups[i].cn + '</li>';
                                }
                                res.send(response);
                            }
                        });
                    }
                });
            });
        });
    }
});
app.get('/login', (req, res) => {
    res.send("Hello World!");
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map