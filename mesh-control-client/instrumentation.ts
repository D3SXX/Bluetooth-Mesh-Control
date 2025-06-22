import {initBasic} from "./pages/api/utils/initData"
import { fetcherGET } from "./app/utils/fetcher"

export async function register() {
    fetcherGET("/config")
    console.log("Initialized basic global config")
}