import assertJump from './helpers/expectThrow';
const BlockManager = require('./helpers/advanceToBlock.js');

const GuigsCrowdsale = artifacts.require('../contracts/GuigsTokenSale.sol');

contract('GuigsTokenCrowdsale', (accounts) => {

  let crowdsale;

  it("Should not allow to create with wrong block number", async () => {

    // Addresses for the crowdsale
    const PRESALE_ADDRESS = accounts[0];
    const FOUNDERS_ADDRESS = accounts[1];
    const WALLET = accounts[2];

    // All the CAP are expressed in weis.
    const MAX_CAP = web3.toWei(4000, 'ether');

    // Amount of tokens that has been raised during presale
    const AMOUNT_PRESALE = 10000000;

    const RATE = 10;
    let START_BLOCK = web3.eth.blockNumber - 1;
    let END_BLOCK = START_BLOCK + 100;

    await assertJump(GuigsCrowdsale.new(
      START_BLOCK, END_BLOCK, RATE, MAX_CAP, WALLET, FOUNDERS_ADDRESS, PRESALE_ADDRESS, AMOUNT_PRESALE
    ));

    START_BLOCK = web3.eth.blockNumber + 10;
    END_BLOCK = web3.eth.blockNumber;

    await assertJump(GuigsCrowdsale.new(
      START_BLOCK, END_BLOCK, RATE, MAX_CAP, WALLET, FOUNDERS_ADDRESS, PRESALE_ADDRESS, AMOUNT_PRESALE
    ));

  });

  it("Should create a crowdsale", async () => {

    // Addresses for the crowdsale
    const PRESALE_ADDRESS = accounts[0];
    const FOUNDERS_ADDRESS = accounts[1];
    const WALLET = accounts[2];

    // All the CAP are expressed in weis.
    const MAX_CAP = web3.toWei(4000, 'ether');

    // Amount of tokens that has been raised during presale
    const AMOUNT_PRESALE = 10000000;

    const RATE = 10;
    const START_BLOCK = web3.eth.blockNumber + 10;
    const END_BLOCK = START_BLOCK + 100;

    let crowdsale = await GuigsCrowdsale.new(
      START_BLOCK, END_BLOCK, RATE, MAX_CAP, WALLET, FOUNDERS_ADDRESS, PRESALE_ADDRESS, AMOUNT_PRESALE
    );

    assert.equal(START_BLOCK, await crowdsale.startTime());
    assert.equal(END_BLOCK, await crowdsale.endTime());
    assert.equal(RATE, await crowdsale.rate());
    assert.equal(MAX_CAP, (await crowdsale.cap()).toNumber());
    assert.equal(WALLET, await crowdsale.wallet());
    assert.equal(FOUNDERS_ADDRESS, await crowdsale.foundersAddress());
    assert.equal(PRESALE_ADDRESS, await crowdsale.presaleDistributionAddress());
    assert.equal(AMOUNT_PRESALE, await crowdsale.tokenPresaleDistribution());

  });

  beforeEach(async () => {

    // Addresses for the crowdsale
    const PRESALE_ADDRESS = accounts[0];
    const FOUNDERS_ADDRESS = accounts[1];
    const WALLET = accounts[2];

    // All the CAP are expressed in weis.
    const MIN_CAP = web3.toWei(1000, 'ether');
    const MAX_CAP = web3.toWei(4000, 'ether');

    // Amount of tokens that has been raised during presale
    const AMOUNT_PRESALE = 10000000;

    const RATE = 10;
    const START_BLOCK = web3.eth.blockNumber + 10;
    const END_BLOCK = START_BLOCK + 100;

    crowdsale = await GuigsCrowdsale.new(
      START_BLOCK, END_BLOCK, RATE, MAX_CAP, WALLET, FOUNDERS_ADDRESS, PRESALE_ADDRESS, AMOUNT_PRESALE
    );

  });

  it("Should not allow to send funds before the crowdsale is effective", async () => {
    await assertJump(crowdsale.sendTransaction({value: web3.toWei(1000), from: accounts[3]}));
  });

});
