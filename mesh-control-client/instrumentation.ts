
import {init} from "./pages/api/utils/initData"
import {loadConfig} from "./pages/api/utils/readProvdb"
import {updateController, updateConfig} from "./pages/api/utils/updateData"
import { fetcherGET } from "./app/utils/fetcher"


export async function register() {
    // TODO: fix "A Node.js module is loaded which is not supported in the Edge Runtime"
    //global.DATA = await init()
    //updateController()
    //await updateConfig()
    // Using fetcherGET until fixed
    fetcherGET("/config")
    console.log("Initialized global config.")
}