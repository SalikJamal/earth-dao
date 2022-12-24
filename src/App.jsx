import { useState, useEffect, useMemo } from 'react'
import { useAddress, useContract, useNFTBalance, Web3Button } from "@thirdweb-dev/react"


const App = () => {

    // Holds the amount of token each member has in state.
    const [memberTokenAmounts, setMemberTokenAmounts] = useState([])
    // The array holding all of our members addresses.
    const [memberAddresses, setMemberAddress] = useState([])
    // The array holding all of our proposals.
    const [proposals, setProposals] = useState([])
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    const address = useAddress()

    // Initialize the contract
    const { contract: editionDrop } = useContract(process.env.REACT_APP_EDITION_DROP_CONTRACT_ADDR, 'edition-drop')
    const { contract: token } = useContract(process.env.REACT_APP_TOKEN_CONTRACT_ADDR, 'token')
    const { contract: vote } = useContract(process.env.REACT_APP_VOTING_CONTRACT_ADDR, 'vote')
    // Hook to check if user has NFT
    const { data: nftBalance } = useNFTBalance(editionDrop, address, 0)

    const shortenAddress = str => str.substring(0, 6) + '...' + str.substring(str.length - 4)
    
    const hasClaimedNFT = useMemo(() => {
        return nftBalance && nftBalance.gt(0)
    }, [nftBalance])

    const memberList = useMemo(() => {
        return memberAddresses.map(address => {
            // We're checking if we are finding the address in the memberTokenAmounts array.
            // If we are, we'll return the amount of token the user has.
            // Otherwise, return 0.
            const member = memberTokenAmounts?.find(({ holder }) => holder === address)
            return {
                address,
                tokenAmount: member?.balance.displayValue || '0'
            }
        })
    }, [memberAddresses, memberTokenAmounts])

    // This useEffect grabs all the addresses of our members holding our NFT.
    useEffect(() => {
        if(!hasClaimedNFT) return

        const getAllAddresses = async () => {
            try {
                const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(0)
                setMemberAddress(memberAddresses)
                console.log(`Member addresses: ${memberAddresses}`)
            } catch(err) {
                console.log(`Failed to get member list: ${err}`)
            }
        }

        getAllAddresses()

    }, [hasClaimedNFT, editionDrop?.history])

    // This useEffect grabs the # of token each member holds.
    useEffect(() => {
        if(!hasClaimedNFT) return

        const getAllBalances = async () => {
            try {
                const amounts = await token?.history.getAllHolderBalances()
                setMemberTokenAmounts(amounts)
                console.log(`Amounts: ${JSON.stringify(amounts)}`)
            } catch(err) {
                console.log(`Failed to get member balances: ${err}`)
            }
        }

        getAllBalances()
    }, [hasClaimedNFT, token?.history])

    // Retrieve all our existing proposals from the contract.
    useEffect(() => {
        if(!hasClaimedNFT) return

        // A simple call to vote.getAll() to grab the proposals
        const getAllProposals = async () => {
            try {
                const proposals = await vote.getAll()
                setProposals(proposals)
                console.log(`Proposals: ${JSON.stringify(proposals)}`)
            } catch(err) {
                console.error(`Failed to get proposals: ${err}`)
            }
        }

        getAllProposals()
    }, [hasClaimedNFT, vote])

    // We also have to check if user has already voted.
    useEffect(() => {
        if(!hasClaimedNFT) return
        // If we haven't finished retrieving the proposals from the useEffect above
        // then we can't check if the user voted yet!
        if(!proposals.length) return

        const checkIfUserhasVoted = async () => {
            try {
                const hasVoted = await vote.hasVoted(proposals[0].proposalId, address)
                setHasVoted(hasVoted)

                if(hasVoted) {
                    console.log('User has already voted')
                } else {
                    console.log('User has not voted yet')
                }
            } catch(err) {
                console.error(`Failed to check if user has voted: ${err}`)
            }
        }
        
        checkIfUserhasVoted()
    }, [hasClaimedNFT, proposals, address, vote])

    if(hasClaimedNFT) {
        return (
            <div className='member-page'>
                <h1>🌎DAO Member Page</h1>
                <p>Congratulations on being a member</p>
                <div>
                    <div>
                        <h2>Member List</h2>
                        <table className='card'>
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Token amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberList.map(member => {
                                    return (
                                        <tr key={member.address}>
                                            <td>{shortenAddress(member.address)}</td>
                                            <td>{member.tokenAmount}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
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
                    onSuccess={() => console.log(`Successfully Minted! Check it out on Opensea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`)}
                    onError={err => console.log(`Failed to mint NFT ${err}`)}
                >
                    Mint NFT (FREE)
                </Web3Button>
            </div>
        </div>
    )

}

export default App