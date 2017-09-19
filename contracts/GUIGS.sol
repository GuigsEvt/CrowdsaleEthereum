pragma solidity ^0.4.14;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./ERC20.sol";

contract GUIGS is ERC20, Ownable {

  /* Public variables of the token */
  /* Those are the variables that must be changed with your token description */
  string public name;
  string public symbol;
  uint8 public decimals;
  uint256 public initialSupply;
  uint256 public totalSupply;
  bool public locked;

  mapping(address => uint) balances;
  mapping (address => mapping (address => uint)) allowed;

  // lock transfer during the ICO
  modifier onlyUnlocked() {
    require(msg.sender == owner || !locked);
    _;
  }

  /*
   *  The GUIGS Token created with the time at which the crowdsale end
   */

  function GUIGS() {

    // lock the token during the crowdsale
    locked = true;

    initialSupply = 10000;
    totalSupply = initialSupply;
    balances[msg.sender] = initialSupply;
    name = 'Guigs token';
    symbol = 'GUIGS';
    decimals = 18;
  }

  /*function unlock() onlyOwner {
    locked = false;
  }

  function burn(uint256 _value) returns (bool success){
    balances[msg.sender] = sub(balances[msg.sender], _value) ;
    totalSupply = sub(totalSupply, _value);
    Transfer(msg.sender, 0x0, _value);
    return true;
  }

  function transfer(address _to, uint256 _value) onlyUnlocked returns (bool success) {
    balances[msg.sender] = sub(balances[msg.sender], _value);
    balances[_to] = add(balances[_to], _value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) onlyUnlocked returns (bool success) {
    var _allowance = allowed[_from][msg.sender];

    balances[_to] = add(balances[_to], _value);
    balances[_from] = sub(balances[_from], _value);
    allowed[_from][msg.sender] = sub(_allowance, _value);
    Transfer(_from, _to, _value);
    return true;
  }

  function balanceOf(address _owner) constant returns (uint balance) {
    return balances[_owner];
  }

  function approve(address _spender, uint256 _value) returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }*/

}
