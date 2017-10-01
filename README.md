# Smart Contract for ICOs and Crowdsale

This project is based on several crowdsale that has happened and tries to take the best of each one. It also tries to provide as much test as possible.

The crowdsale is basic crowdsale without any whitelist or whatsever. In future differents type of crowdsale will come under the crowdsale examples folder.

The token is made burnable and has some few characteristics for example only.

## Contracts

Please see the [contracts/](contracts) directory.

### Dependencies

Contracts are written in [Solidity](https://solidity.readthedocs.io/en/develop/) and this project integrates with [Truffle](https://github.com/ConsenSys/truffle). It also use an Ethereum client for testing and development [testrpc](https://github.com/ethereumjs/testrpc). Install both.

```sh
# Install Truffle and testrpc packages globally:
$ npm install -g truffle ethereumjs-testrpc

# Install local node dependencies:
$ npm install
```

### Test

```sh
# Test the contract
$ ./scripts/test.sh
```

## Security

This programs reuses code coming from previous ICOs that has been reviewed by OpenZeppelin. However this whole project hasn't been reviewed by any third-party certificator.
