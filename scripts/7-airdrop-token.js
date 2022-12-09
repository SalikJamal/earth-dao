import sdk from './1-initialize-sdk.js'


const main = async () => {

    try {

        // This is the address to our ERC-1155 membership NFT contract.
        const editionDrop = await sdk.getContract(process.env.REACT_APP_EDITION_DROP_CONTRACT_ADDR, 'edition-drop')
        // This is the address to our ERC-20 token contract.
        const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')

        // Grab all the addresses of people who own our membership NFT, which has a tokenId of 0.
        const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0)

        if(walletAddresses.length === 0) {
            console.log('No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!')
            process.exit(0)
        }


        // Loop through the array of addresses.
        const airDropTargets = walletAddresses.map(address => {
            // Pick a random # between 1000 and 10000.
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
            console.log(`Going to airdrop ${randomAmount} tokens to ${address}`)
        
            // Set up the target
            const airDropTarget = {
                toAddress: address,
                amount: randomAmount
            }

            return airDropTarget
        })

        console.log(`Starting airdrop....`)
        await token.transferBatch(airDropTargets)
        console.log('Successfully airdropped tokens to all the holders of the NFT!')


    } catch(err) {
        console.log(`Failed to airdrop tokens: ${err}`)
    }

}


main()