const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

const compiledFactory = require('../build/CrowdFundFactory.json')
const compiledCrowdFund = require('../build/CrowdFund.json')

let accounts
let factory
let projectAddress
let project

beforeEach(async () => {
  accounts = await web3.eth.getAccounts()
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' })

  await factory.methods.createProject('100').send({
    from: accounts[0],
    gas: '1000000',
  })
  ;[projectAddress] = await factory.methods.getDeployedProjects().call()

  project = await new web3.eth.Contract(
    JSON.parse(compiledCrowdFund.interface),
    projectAddress,
  )
})

describe('Projects', () => {
  it('deploys a factory and a project', () => {
    assert.ok(factory.options.address)
    assert.ok(project.options.address)
  })

  it('marks caller as the projectr manager', async () => {
    const manager = await project.methods.manager().call()
    assert.equal(accounts[0], manager)
  })

  it('allows people to contribute money and marks them as approvers', async () => {
    await project.methods.contribute().send({
      value: '200',
      from: accounts[1],
    })

    const isContributor = await project.methods.approvers(accounts[1]).call()
    assert(isContributor)
  })

  it('requires a minimum contribution', async () => {
    try {
      await project.methods.contribute().send({
        value: '5',
        from: accounts[1],
      })

      assert(false)
    } catch (error) {
      assert(error)
    }
  })

  it('allows a manager to make a payment request', async () => {
    await project.methods
      .createRequest('Buy batteries', '100', accounts[1])
      .send({
        from: accounts[0],
        gas: '1000000',
      })

    const request = await project.methods.requests(0).call()

    assert.equal('Buy batteries', request.description)
  })

  it('processes requests', async () => {
    await project.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether'),
    })

    await project.methods
      .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
      .send({
        from: accounts[0],
        gas: '1000000',
      })

    await project.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '1000000',
    })

    await project.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000',
    })

    let balance = await web3.eth.getBalance(accounts[1])
    balance = web3.utils.fromWei(balance, 'ether')
    balance = parseFloat(balance)
    console.log(balance)
    assert(balance > 103)
  })
})
