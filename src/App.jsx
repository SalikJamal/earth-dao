import { useState, useEffect, useMemo } from 'react'
import { useAddress, useContract, useNFTBalance, Web3Button } from "@thirdweb-dev/react"


const App = () => {

    const address = useAddress()

    // Initialize the contract
    const { contract } = useContract(process.env.REACT_APP_EDITION_DROP_CONTRACT_ADDR, 'edition-drop')

    // Hook to check if user has NFT
    const { data: nftBalance } = useNFTBalance(contract, address, 0)

    const hasClaimedNFT = useMemo(() => {
        return nftBalance && nftBalance.gt(0)
    }, [nftBalance])

    if(hasClaimedNFT) {
        return (
            <div className='member-page'>
                <h1>🌎DAO Member Page</h1>
                <p>Congratulations on being a member</p>
            </div>
        )
    }

    return (
        <div className="mint-nft">
            <h1>{!address ? 'Welcome To 🌎DAO' : 'Mint your free 🌎DAO Membership NFT!'}</h1>
            <div className='btn-hero'>
                <Web3Button 
                    contractAddress={process.env.REACT_APP_EDITION_DROP_CONTRACT_ADDR}
                    action={contract => contract.erc1155.claim(0, 1)}
                    onSuccess={() => console.log(`Successfully Minted! Check it out on Opensea: https://testnets.opensea.io/assets/${contract.getAddress()}/0`)}
                    onError={err => console.log(`Failed to mint NFT ${err}`)}
                >
                    Mint NFT (FREE)
                </Web3Button>
            </div>
        </div>
    )

}

export default App