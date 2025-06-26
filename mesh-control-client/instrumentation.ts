import {initBasic} from "./pages/api/utils/initData"
import { fetcherGET } from "./app/utils/fetcher"

export async function register() {
    fetcherGET("/config").then((data) => {
        console.log(data.MESSAGE)
    })
}