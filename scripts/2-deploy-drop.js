import { AddressZero } from '@ethersproject/constants'
import sdk from './1-initialize-sdk.js'
import { readFileSync } from 'fs'

const main = async () => {

    try {

        const editionDropAddress = await sdk.deployer.deployEditionDrop({
            name: 'EarthDAO Membership',
            description: 'A DAO for the people of Earth',
            image: readFileSync('scripts/assets/earthdao.png'),
            primary_sale_recipient: AddressZero
            // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the contract.
            // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
            // you can set this to your own wallet address if you want to charge for the drop.
        })

        // This initialization returns the address of our contract
        // We use this to initialize the contract on the thirdweb sdk
        const editionDrop = await sdk.getContract(editionDropAddress, 'edition-drop')

        // With this, we can get metadata of our contract
        const metadata = await editionDrop.metadata.get()

        console.log(`Successfully deployed editionDrop contract at address: ${editionDropAddress}`)
        console.log(`Contract metadata: ${JSON.stringify(metadata)}`)


    } catch(err) {
        console.log(`Failed to deploy editionDrop contract ${err}`)
    }

}

main()