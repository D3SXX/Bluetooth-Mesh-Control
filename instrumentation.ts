import { fetcherPOST } from "./app/utils/fetcher"

export async function register() {

    fetcherPOST({
        "start_init": true
    })("/config")
}