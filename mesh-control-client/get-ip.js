var fs = require('fs');
var ip = require('ip');
var localIp = ip.address();
var envPath = './.env.local';
var envContent = "NEXT_PUBLIC_SERVER_IP=".concat(localIp, "\n");
fs.writeFile(envPath, envContent, function (err) {
    if (err) {
        console.error('Error writing to .env.local:', err);
    }
    else {
        console.log("Local IP (".concat(localIp, ") written to .env.local"));
    }
});
