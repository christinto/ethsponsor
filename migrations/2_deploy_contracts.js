var Sponsorship = artifacts.require("./Sponsorship.sol")

module.exports = function(deployer) {
  deployer.deploy(Sponsorship);
};
