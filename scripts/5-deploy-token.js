import { AddressZero } from "@ethersproject/constants"
import sdk from './1-initialize-sdk.js'


const main = async () => {

    try {

        const tokenAddress = await sdk.deployer.deployToken({
            name: "EarthDao Governance Token",
            symbol: "EarthDao Seeds",
            primary_sale_recipient: AddressZero
        })

        console.log(`Successfully deployed token contract: ${tokenAddress}`)

    } catch(err) {
        console.log(`Failed to deploy token contract: ${err}`)
    }

}

main()