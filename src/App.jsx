import { useState, useEffect, useMemo } from 'react'
import { useAddress, useContract, useNFTBalance, Web3Button } from "@thirdweb-dev/react"
import { AddressZero } from '@ethersproject/constants'


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

    const handleProposalForm = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Disable button, to prevent double clicks
        setIsVoting(true)

        // Get votes from the form for values
        const votes = proposals.map(proposal => {
            const voteResult = {
                proposalId: proposal.proposalId,
                vote: 2 // Abstain by default
            }
            proposal.votes.foreach(vote => {
                const elem = document.getElementById(`${proposal.proposalId}-${vote.type}`)
                if(elem.checked) {
                    voteResult.vote = vote.type
                    return
                }
            })
            return voteResult
        })

        // First we need to make sure user delegates their token to vote
        try {
            // We'll check if the wallet still needs to delegate their tokens before they can vote
            const delegation = await token.getDelegation(address)
            // If the delegation is the 0x0 address that means they have not delegated their governance tokens yet
            if(delegation === AddressZero) {
                // If they haven't delegated their tokens yet, we'll have them delegate them before voting
                await token.delegateTo(address)
            }

            // Then we need to vote on the proposals
            try {

                await Promise.all(
                    votes.map(async ({ proposalId, vote: _vote }) => {
                        // Before voting we first need to check whether the proposal is open for voting
                        // We first need to get the latest state of the proposal
                        const proposal = await vote.get(proposalId)
                        // Then we check if the proposal is open for voting (state === 1 means it is open)
                        if(proposal.state === 1) return vote.vote(proposalId, _vote)

                        // If the proposal is not open for voting we just return nothing, letting us continue
                        return
                    })
                )

                try {

                    // If any of the propsals are ready to be executed we'll need to execute them
                    // a proposal is ready to be executed if it is in state 4
                    await Promise.all(votes.map(async ({ proposalId }) => {

                        // We'll first get the latest state of the proposal again, since we may have just voted before
                        const proposal = await vote.get(proposalId)

                        // If the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                        if(proposal.state === 4) return vote.execute(proposalId)

                    }))

                    setHasVoted(true)
                    console.log('Successfully voted!')


                } catch(err) {
                    console.error(`Failed to excute a vote: ${err}`)
                }

            } catch(err) {
                console.error(`Failed to vote: ${err}`)
            }


        } catch(err) {
            console.error('Failed to delegate tokens')
        } finally {
            setIsVoting(false)
        }
    }

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
                    <div>
                        <h2>Active Proposals</h2>
                        <form onSubmit={handleProposalForm}>
                            {proposals.map(proposal => (
                                <div key={proposal.proposalId} className='card'>
                                    <h5>{proposal.description}</h5>
                                    <div>
                                        {proposal.votes.map(({ type, label }) => (
                                            <div key={type}>
                                                <input type='radio' id={`${proposal.proposalId}-${type}`} name={proposal.proposalId} value={type} defaultChecked={type === 2} />
                                                <label htmlFor={`${proposal.proposalId}-${type}`}>{label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button disabled={isVoting || hasVoted} type='submit'>
                                {isVoting ? 'Voting...' : hasVoted ? 'You already voted!' : 'Submit vote'}
                            </button>
                            {!hasVoted && (
                                <small>This will trigger multiple transaction that you will need to sign.</small>
                            )}
                        </form>
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