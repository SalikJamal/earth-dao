import sdk from './1-initialize-sdk.js'


(async () => {

    try {

      const token = await sdk.getContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, "token")
      // Log the current roles.
      const allRoles = await token.roles.getAll()
  
      console.log(`Roles that exist right now: ${JSON.stringify(allRoles)}`)
  
      // Revoke all the superpowers your wallet had over the ERC-20 contract.
      await token.roles.setAll({ admin: [], minter: [] })
      console.log(`Roles after revoking ourselves: ${JSON.stringify(await token.roles.getAll())}`)
      console.log('Successfully revoked our superpowers from the ERC-20 contract')
  
    } catch (error) {
      console.error(`Failed to revoke ourselves from the DAO trasury: ${error}`)
    }

})()