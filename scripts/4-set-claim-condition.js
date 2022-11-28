import sdk from './1-initialize-sdk.js'
import { MaxUint256 } from '@ethersproject/constants'


const main = async () => {

    try {

        const editionDrop = await sdk.getContract(process.env.NEXT_PUBLIC_EDITION_DROP_CONTRACT_ADDR, 'edition-drop')

        // We define our claim conditions, this is an array of objects because
        // we can have multiple phases starting at different times if we want to
        const claimConditions = [{
            // When people are gonna be able to start claiming the NFTs (now)
            startTime: new Date(),
            // The maximum number of NFTs that can be claimed.
            maxClaimable: 5000,
            // The price of our NFT (free)
            price: 0,
            // The amount of NFTs people can claim in one transaction.
            maxClaimablePerWallet: 1,
            // We set the wait between transactions to unlimited, which means
            // people are only allowed to claim once.
            waitInSeconds: MaxUint256
        }]

        await editionDrop.claimConditions.set('0', claimConditions)
        console.log('Successfully set claim conditions!')

    } catch(err) {
        console.log(`Failed to set claim condition ${err}`)
    }

}

main()