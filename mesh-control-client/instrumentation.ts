import {initBasic} from "./pages/api/utils/initData"
import { fetcherPOST } from "./app/utils/fetcher"
import Debug from "./pages/api/utils/debug"

export async function register() {
    fetcherPOST({
        "start_init": true
    })("/config")
}