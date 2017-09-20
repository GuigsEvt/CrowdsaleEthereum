import assertJump from './helpers/expectThrow';

const GuigsToken = artifacts.require('../contracts/GuigsToken.sol');

contract('GuigsToken', (accounts) => {
    let token;

    let owner = accounts[0];
    let spender = accounts[1];
    let to1 = accounts[2];
    let to2 = accounts[3];
    let to3 = accounts[4];

    let allowedAmount = 100;  // Spender allowance
    let transferredFunds = 1200;  // Funds to be transferred around in tests
    let tokenToBurn = 600; // Tokens to burn in tests
    let tokenToMintForBurn = 500; // Tokens for test for burn

    beforeEach(async () => {
        token = await GuigsToken.new();
    });

    describe('construction', async () => {

        it('should be ownable', async () => {
            assert.equal(await token.owner(), owner);
        });

        it('should return correct name after construction', async () => {
            assert.equal(await token.name(), 'Guigs token development purpose');
        });

        it('should return correct symbol after construction', async () => {
            assert.equal(await token.symbol(), 'GUIGS');
        });

        it('should return correct decimal points after construction', async () => {
            assert.equal(await token.decimals(), 18);
        });

        it('should have minting mode turned on', async () => {
            assert(await token.isMinting());
        });

    });


    // Test involving the use of the burn functions that could be useful from the crowdsale or for further purpose of the contract
    // Example of additionnal function implemented on ERC20 token.
    describe('burn', async () => {

        it('should update totalSupply after burn()',  async () => {

            await token.mint(owner, transferredFunds);
            await token.mint(to1, transferredFunds);
            await token.mint(to2, transferredFunds);
            await token.endMinting();

            let totalSupply = transferredFunds + transferredFunds + transferredFunds;

            assert.equal((await token.totalSupply()).toNumber(), totalSupply);

            await token.burn(tokenToBurn);
            assert.equal((await token.totalSupply()).toNumber(), totalSupply - tokenToBurn);

            await token.burn(tokenToBurn, { from : to1 });
            assert.equal((await token.totalSupply()).toNumber(), totalSupply - tokenToBurn - tokenToBurn);

            await token.burn(tokenToBurn, { from : to2 });
            assert.equal((await token.totalSupply()).toNumber(), totalSupply - tokenToBurn - tokenToBurn - tokenToBurn);

        });

        it('should not allow burn() of amount greater that totalSupply', async () => {

            await token.mint(owner, transferredFunds);
            await token.endMinting();

            await assertJump(token.burn(transferredFunds + 1));
        });

        it('should not allow burn() of amount that we do not have', async () => {
          await token.mint(owner, transferredFunds);
          await token.mint(to1, tokenToMintForBurn);

          await assertJump(token.burn(tokenToBurn, { from : to1 }));
        });
    });

    describe('minting', async () => {

        it('should update balances correctly after minting', async () => {
            assert.equal((await token.balanceOf(owner)).toNumber(), 0);

            await token.mint(to1, transferredFunds);

            // Checking owner balance stays on 0 since minting happens for other accounts.
            assert.equal((await token.balanceOf(owner)).toNumber(), 0);
            assert.equal((await token.balanceOf(to1)).toNumber(), transferredFunds);

            await token.mint(to2, transferredFunds);
            assert.equal((await token.balanceOf(to2)).toNumber(), transferredFunds);

            await token.mint(to3, transferredFunds);
            assert.equal((await token.balanceOf(to3)).toNumber(), transferredFunds);

            assert.equal((await token.balanceOf(owner)).toNumber(), 0);
        });

        it('should update totalSupply correctly after minting', async () => {
            assert.equal((await token.totalSupply()).toNumber(), 0);

            await token.mint(to1, transferredFunds);
            assert.equal((await token.totalSupply()).toNumber(), transferredFunds);

            await token.mint(to1, transferredFunds);
            assert.equal((await token.totalSupply()).toNumber(), transferredFunds * 2);

            await token.mint(to2, transferredFunds);
            assert.equal((await token.totalSupply()).toNumber(), transferredFunds * 3);
        });

        it('should end minting', async () => {
            await token.endMinting();
            assert.isFalse(await token.isMinting());
        });

        it('should not allow end minting from address different than owner', async () => {
            await assertJump(token.endMinting({ from : spender }));
        });

        it('should allow to end minting more than once', async () => {
            await token.endMinting();
            await token.endMinting();
            await token.endMinting();
        });

        it('should not allow to mint after minting has ended', async () => {
            await token.endMinting();
            await assertJump(token.mint(to1, transferredFunds));
        });

        it('should not allow approve() before minting has ended', async () => {
            await assertJump(token.approve(spender, allowedAmount));
        });

        it('should allow approve() after minting has ended', async () => {
            await token.endMinting();
            await token.approve(spender, allowedAmount);
        });

        it('should not allow transfer() before minting has ended', async () => {
            await assertJump(token.transfer(spender, allowedAmount));
        });

        it('should allow transfer() after minting has ended', async () => {
            await token.mint(owner, transferredFunds);
            await token.endMinting();
            await token.transfer(to1, transferredFunds);
            assert.equal((await token.balanceOf(to1)).toNumber(), transferredFunds);
        });

        it('should not allow transferFrom() before minting has ended', async () => {
            await assertJump(token.transferFrom(owner, to1, allowedAmount, {from: spender}));
        });

        it('should allow transferFrom() after minting has ended', async () => {
            await token.mint(owner, transferredFunds);
            await token.endMinting();
            await token.approve(spender, allowedAmount);
            await token.transferFrom(owner, to1, allowedAmount, {from: spender});
        });

        it('should not allow burn() before minting has ended', async () => {
            await assertJump(token.burn(allowedAmount));
        });

        it('should allow burn() after minting has ended', async () => {
            await token.mint(owner, allowedAmount);
            await token.endMinting();
            await token.burn(allowedAmount);
        });

    });

    describe('events', async () => {
        it('should log mint event after minting', async () => {
            let result = await token.mint(to1, transferredFunds);

            assert.lengthOf(result.logs, 1);
            let event = result.logs[0];
            assert.equal(event.event, 'Transfer');
            assert.equal(event.args.from, 0);
            assert.equal(event.args.to, to1);
            assert.equal(Number(event.args.value), transferredFunds);
        });

        it('should log minting ended event after minting has ended', async () => {
            let result = await token.endMinting();

            assert.lengthOf(result.logs, 1);
            assert.equal(result.logs[0].event, 'MintingEnded');

            // Additional calls should not emit events.
            result = await token.endMinting();
            assert.equal(result.logs.length, 0);
            result = await token.endMinting();
            assert.equal(result.logs.length, 0);
        });

        it('should log burning event when burn() is called', async () => {
            await token.mint(owner, transferredFunds);
            await token.endMinting();

            let result = await token.burn(tokenToBurn);

            assert.lengthOf(result.logs, 1);
            let event = result.logs[0];
            assert.equal(event.event, 'Transfer');
            assert.equal(event.args.from, owner);
            assert.equal(event.args.to, 0);
            assert.equal(Number(event.args.value), tokenToBurn);
        });

    });
});
