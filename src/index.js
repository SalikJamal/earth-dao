import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'


import { ThirdwebProvider } from '@thirdweb-dev/react'
import { ChainId } from '@thirdweb-dev/sdk'

const chainId = ChainId.Goerli

const root = createRoot(document.getElementById('root'))
root.render(<ThirdwebProvider desiredChainId={chainId}><App /></ThirdwebProvider>)