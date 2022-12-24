import sdk from './1-initialize-sdk.js'
import { ethers } from 'ethers'


const main = async () => {

    try { 
        
        // This is our governance contract.
        const vote = await sdk.getContract(process.env.REACT_APP_VOTING_CONTRACT_ADDR, 'vote')
        // This is our ERC-20 contract.
        const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')

        // Create proposal to mint 420,000 new token to the treasury.
        const amount = 420_000
        const description = `Should the DAO mint an additional ${amount} tokens in to the treasury?`

        const executions = [{
            // Our token contract that actually executes the mint.
            toAddress: token.getAddress(),

            // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
            // to send in this proposal. In this case, we're sending 0 ETH.
            // We're just minting new tokens to the treasury. So, set to 0.
            nativeTokenValue: 0,

            // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
            // to send in this proposal. In this case, we're sending 0 ETH.
            // We're just minting new tokens to the treasury. So, set to 0.
            transactionData: token.encoder.encode('mintTo', [vote.getAddress(), ethers.utils.parseEther(amount.toString(), 18)])
        }]

        await vote.propose(description, executions)

        console.log('Successfully created proposal to mint tokens')

    } catch(err) {
        console.error(`Failed to create first proposal: ${err}`)
        process.exit(1)
    }

    try {

        // This is our governance contract.
        const vote = await sdk.getContract(process.env.REACT_APP_VOTING_CONTRACT_ADDR, 'vote')
        // This is our ERC-20 contract.
        const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')

        // Create proposal to transfer ourselves 6,900 tokens for being awesome.
        const amount = 6_900
        const description = `Should the DAO transfer ${amount} tokens from the treasury to the ${process.env.WALLET_ADDRESS} for being awesome?`

        const executions = [{
            // Our token contract that actually executes the mint.
            toAddress: token.getAddress(),

            // Again, we're sending ourselves 0 ETH. Just sending our own token.
            nativeTokenValue: 0,

            // We're doing a transfer from the treasury to our wallet.  
            transactionData: token.encoder.encode('transfer', [process.env.WALLET_ADDRESS, ethers.utils.parseEther(amount.toString(), 18)])
        }]

        await vote.propose(description, executions)

        console.log('Successfully created proposal to reward ourselves from the treasury, let\'s hope people vote for it')

    } catch(err) {
        console.error(`Failed to create second proposal: ${err}`)
        process.exit(1)
    }

}


main()