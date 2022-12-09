import sdk from './1-initialize-sdk.js'


const main = async () => {

    try {

        const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')
        const amount = 1000000
        await token.mint(amount)
        const totalSupply = await token.totalSupply()

        console.log(`There now is: ${totalSupply.displayValue}, $EarthSeeds in circulation!`)

    } catch(err) {
        console.log(`Failed t print money: ${err}`)
    }

}

main()