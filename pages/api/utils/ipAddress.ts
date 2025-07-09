import { networkInterfaces } from "os"
import path from "path"
import fs from "fs"

export function getLocalIPAddress(): string {
        const interfaces = networkInterfaces()
        
        for (const name of Object.keys(interfaces)) {
            const netInterface = interfaces[name]
            if (netInterface) {
                for (const net of netInterface) {
                    if (net.family === 'IPv4' && !net.internal) {
                        writeToEnv('NEXT_PUBLIC_SERVER_IP', net.address)
                        return net.address
                    }
                }
            }
        }
        writeToEnv('NEXT_PUBLIC_SERVER_IP', 'localhost')
        return 'localhost' 
    }

function writeToEnv(key: string, value: string) {
    const envPath = path.join(path.dirname(process.argv[1]), '..', '..','..', '.env')
    let envContent = `${key}=${value}`
    fs.writeFileSync(envPath, envContent)
}

getLocalIPAddress()