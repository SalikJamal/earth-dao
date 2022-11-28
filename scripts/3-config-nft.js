import sdk from './1-initialize-sdk.js'
import { readFileSync } from 'fs'


const main = async () => {

    try {

        const editionDrop = await sdk.getContract(process.env.NEXT_PUBLIC_EDITION_DROP_CONTRACT_ADDR, 'edition-drop')
        await editionDrop.createBatch([
            {
                name: 'EarthDAO Soil',
                description: 'This NFT will give you access to EarthDAO',
                image: readFileSync('scripts/assets/earthdao.png'),
            }
        ])

        console.log('Successfully created a new NFT in the drop!')

    } catch(err) {
        console.log(`Failed to create NFT ${err}`)
    }

}

main()