const fs = require('fs');
const ip = require('ip');

const localIp = ip.address();
const envPath = './.env.local';

const envContent = `NEXT_PUBLIC_SERVER_IP=${localIp}\n`;

fs.writeFile(envPath, envContent, (err: NodeJS.ErrnoException | null) => {
    if (err) {
        console.error('Error writing to .env.local:', err);
    } else {
        console.log(`Local IP (${localIp}) written to .env.local`);
    }
});
