import sdk from './1-initialize-sdk.js'


const main = async () => {

    try {

        // This is our governance contract.
        const vote = await sdk.getContract(process.env.REACT_APP_VOTING_CONTRACT_ADDR, 'vote')

        // This is our ERC-20 contract.
        const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')

        // Give our treasury the power to mint additional token if needed.
        await token.roles.grant('minter', vote.getAddress())

        console.log(`Successfully gave voting contract permissions to act on token contract`)

    } catch(err) {
        console.error(`Failed to grant voting contract permissions on token contract: ${err}`)
        process.exit(1)
    }

    try {

        // This is our governance contract.
        const vote = await sdk.getContract(process.env.REACT_APP_VOTING_CONTRACT_ADDR, 'vote')

        // This is our ERC-20 contract.
        const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')

        // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
        const ownedTokensBalance = await token.balanceOf(process.env.WALLET_ADDRESS)

        // Grab 90% of the supply that we hold
        const ownedAmount = ownedTokensBalance.displayValue
        const percent90 = Number(ownedAmount) / 100 * 90

        // Transfer 90% of our tokens to the voting contract.
        await token.transfer(vote.getAddress(), percent90)

        console.log(`Successfully transferred ${percent90} of tokens to voting contract`)

    } catch(err) {
        console.error(`Failed to transfer tokens to voting contract: ${err}`)
    }

}


main()