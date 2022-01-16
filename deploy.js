const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const compiledFactory = require('./build/CrowdFundFactory.json');

const provider = new HDWalletProvider(
  'arrange security long brush blur defense emerge decorate oil you hobby flash',
  'https://rinkeby.infura.io/v3/267a6d5c546042c28e58d9e21d254ec1',
)
const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()

  console.log('Attempting to deploy from account', accounts[0])

  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface),
  )
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: '1000000', from: accounts[0] })

  console.log('Contract deployed to', result.options.address)

  // contract -> 0x14a78ce80582A65A5862DE647808Ea1Cf34a295E
  provider.engine.stop()
}
deploy()
