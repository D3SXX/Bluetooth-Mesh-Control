import {initBasic} from "./pages/api/utils/initData"
import { fetcherGET } from "./app/utils/fetcher"
import Debug from "./pages/api/utils/debug"

export async function register() {
    fetcherGET("/config").then((data) => {
        Debug.log(data.MESSAGE, "INFO", "Instrumentation")
    })
}