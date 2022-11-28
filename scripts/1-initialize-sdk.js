import { ThirdwebSDK } from '@thirdweb-dev/sdk'

// Importing and configuring our .env file that we use to securely store our environment variables
import * as dotenv from 'dotenv'
dotenv.config()


// Some quick checks to make sure our .env is working.
if(!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '') console.log('🛑 Private key not found.')
if(!process.env.ALCHEMY_API_URL  || process.env.ALCHEMY_API_URL === '') console.log('🛑 Alchemy API URL not found.')
if(!process.env.WALLET_ADDRESS  || process.env.WALLET_ADDRESS  === '') console.log('🛑 Wallet address not found.')

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, process.env.ALCHEMY_API_URL)

const main = async () => {
    try {
        const address = await sdk.getSigner().getAddress()
        console.log(`SDK initialized by address ${address}`)
    } catch(err) {
        console.log(`Failed to get apps from the sdk ${err}`)
        process.exit(1)
    }
}

main()

export default sdk