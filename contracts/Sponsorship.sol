pragma solidity ^0.4.10; // address.transfer is only availabe >= solidity ^0.4.10

contract Sponsorship {
  // Structure for our sponsor
  struct Sponsor {
      address sender;
      uint amount;
      string memo;
      string hyperlink;
  }

  // A constant, because why not
  // Goddamnit, solidity doesn't support
  // Construction of fixed-length arrays with constants
  // Need to manually change Sponsor[<number>]
  uint constant NUM_SPONSOR = 5;
  Sponsor[5] private sponsors;

  // Whom to sponsor
  address constant sponsoredAddress = 0xD992272257246948f313CF5FB967C0F9436841A8;

  // Constructor
  function Sponsorship() {
      // Sets initial amount to 0      
      for (uint i = 0; i < NUM_SPONSOR; i++) {
          sponsors[i] = Sponsor({
              sender: msg.sender,
              amount: 0,
              memo: "",
              hyperlink: ""
          });
      }
  }  

  // Pay me in ether pls
  function sponsorMe(string memo, string hyperlink) payable {
      uint amountSent = msg.value;
      bool canBreak = false; // Can we break from the loop
      
      // Man no higher order functions.
      // This sucks balls.
      // So declarative
      for (uint i = 0; i < NUM_SPONSOR; i++) {
          // If this user has sent > this current sponsor amount
          // This sponsor will take his slot :-)
          if (amountSent > sponsors[i].amount) {
              // Shuffle all lower paying sponsors by
              // one slot
              for (uint j = (NUM_SPONSOR - 1); j > i; j--) {
                  sponsors[j] = sponsors[j-1];
              }

              // Set the new sponsor's position
              sponsors[i] = Sponsor({
                  sender: msg.sender,
                  amount: amountSent,
                  memo: memo,
                  hyperlink: hyperlink
              });       
              canBreak = true;
          }

          // Computational efficiency? kek
          if (canBreak) {
              break;
          }
      }

      // Transfer to the sponsored address
      sponsoredAddress.transfer(amountSent);
  }

  // Get sponsor no [1..NUM_SPONSOR]
  function getSponsorNo(uint i) constant returns (address, uint, string, string) {
      return (sponsors[i].sender, sponsors[i].amount, sponsors[i].memo, sponsors[i].hyperlink);
  }

  // Get number of sponsors
  function getNumberOfSponsors() constant returns (uint) {
      return NUM_SPONSOR;
  }
}
