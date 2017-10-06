import assertJump from './helpers/expectThrow';
const BlockManager = require('./helpers/advanceToBlock.js');

const GuigsCrowdsale = artifacts.require('../contracts/GuigsTokenSale.sol');
const GuigsToken = artifacts.require('../contracts/GuigsToken.sol')

contract('GuigsTokenCrowdsale', (accounts) => {

  let crowdsale;
  let currentBlock;
  let wallet;
  let maxCap;
  let rate;

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
    rate = RATE;
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
    wallet = WALLET;

    // All the CAP are expressed in weis.
    const MAX_CAP = web3.toWei(400, 'ether');
    maxCap = MAX_CAP;

    // Amount of tokens that has been raised during presale
    const AMOUNT_PRESALE = 10000000;

    const RATE = 10;
    const START_BLOCK = web3.eth.blockNumber + 10;
    currentBlock = START_BLOCK;
    const END_BLOCK = START_BLOCK + 100;

    crowdsale = await GuigsCrowdsale.new(
      START_BLOCK, END_BLOCK, RATE, MAX_CAP, WALLET, FOUNDERS_ADDRESS, PRESALE_ADDRESS, AMOUNT_PRESALE
    );

  });

  it("Should not allow to send funds before the crowdsale is effective", async () => {
    await assertJump(crowdsale.sendTransaction({value: web3.toWei(10), from: accounts[3]}));
  });

  it("Should not directly overcap the crowdsale", async () => {
    await BlockManager.waitToBlock(currentBlock);
    await assertJump(crowdsale.sendTransaction({value: web3.toWei(401), from: accounts[3]}));
  });

  /*it("Should not allow to finalize if crowdsale has not ended and if already finalizable", async () => {
    await BlockManager.waitToBlock(currentBlock);
    await assertJump(crowdsale.finalize());

    await BlockManager.waitToBlock(currentBlock + 100);
    await crowdsale.finalize();
    await assertJump(crowdsale.finalize());
  });*/

  it("Should not allow to send funds when cap is reached", async () => {
    await BlockManager.waitToBlock(currentBlock);
    var i;
    for (i = 4 ; i < 8 ; i++) {
      await crowdsale.sendTransaction({ value : web3.toWei(100, 'ether'), from : accounts[i] });
    }
    await assertJump(crowdsale.sendTransaction({value: web3.toWei(1, 'ether'), from: accounts[8]}));
    await assertJump(crowdsale.sendTransaction({value: 1, from: accounts[8]}));

  });

  it("Should create a crowdsale, reach max cap, finalize it and distribute the tokens correctly", async function() {
    await BlockManager.waitToBlock(currentBlock);
    var i;
    for (i = 4 ; i < 8 ; i++) {
      await crowdsale.sendTransaction({ value : web3.toWei(100, 'ether'), from : accounts[i] });
    }
    var previousFund = web3.eth.getBalance(wallet);
    assert.equal(maxCap, (await web3.eth.getBalance(wallet).toNumber()));

    // finalize crowdsale and check balances
    await BlockManager.waitToBlock(endBlock);
    crowdsale.finalize();

    var token = GuigsToken.at(crowdsale.token());
    assert.equal(await token.totalSupply().toNumber(), maxCap * rate);

    assert.equal(token.balanceOf(accounts[4]).toNumber(), web3.toWei(100, 'ether') * rate);
    assert.equal(token.balanceOf(accounts[5]).toNumber(), web3.toWei(100, 'ether') * rate);
    assert.equal(token.balanceOf(accounts[6]).toNumber(), web3.toWei(100, 'ether') * rate);
    assert.equal(token.balanceOf(accounts[7]).toNumber(), web3.toWei(100, 'ether') * rate);
  });

});
