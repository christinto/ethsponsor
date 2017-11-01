import React, { Component } from 'react'
import SponsorshipContract from '../build/contracts/Sponsorship.json'
import getWeb3 from './utils/getWeb3'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import SvgIcon from 'material-ui/SvgIcon';
import {green400, greenA400} from 'material-ui/styles/colors';

import './css/satisfy.css'
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const PaymentIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </SvgIcon>
)

// Renders the sponsor list
class SponsorList extends Component {
  constructor(props){
    super(props)

    this.state = {      
      sponsors: [] // List of Sponsor objects
    }
  }

  componentDidMount() {
    // Query every second
    setInterval(this.updateSponsorList.bind(this), 1000)
  }

  updateSponsorList() {
    const web3 = this.props.web3
    const sponsorInstance = this.props.sponsorInstance    
    
    sponsorInstance.getNumberOfSponsors()
    .then((results) => {
      // Get number of sponsors
      const sponsorsNo = results.c[0]      

      // Map those sponsors into a promise array
      const sponsorPromises = (Array.from(Array(sponsorsNo).keys())).map((x) => sponsorInstance.getSponsorNo(x))

      Promise.all(sponsorPromises)
      .then((sponsors) => {
        // Format them into objects
        const sponsorObjs = sponsors.map((x) => {
          return {
            address: x[0],
            amount: parseFloat(x[1].c[0]) / 10000.0,
            memo: x[2],
            hyperlink: x[3]
          }
        })
        
        this.setState({
          sponsors: sponsorObjs
        })
      })
    })
  }

  render () {
    return (
      <div>
        <h1>Hall of Fame</h1>
        <ul>
          {
            this.state.sponsors.map((s, idx) => {
              // Only show > 0 peeps
              if (s.amount > 0){                
                return (
                  <div key={idx}>
                    <li>                      
                      <span style={{fontFamily: 'Satisfy', fontSize: '35px'}}><a href={'//' + s.hyperlink}>"{s.memo}"</a></span><br/>
                      <div style={{textAlign: 'right', fontSize: '12px'}}>
                        Generosity: {s.amount} ETH
                      </div>
                      <div style={{textAlign: 'right', fontSize: '10px'}}>
                        - {s.address}
                      </div>
                    </li><br/><br/>
                  </div>
                )
              }
            })
          }
        </ul>        
      </div>
    )
  }
}

// Renders the sponsor app
class SponsorApp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      memo: '',
      hyperlink: '',
      amount: '',
    }
  }

  callSponsorContract() {
    const sponsorInstance = this.props.sponsorInstance
    const web3 = this.props.web3

    web3.eth.getAccounts((err, accounts) => {      
      sponsorInstance.sponsorMe(this.state.memo, this.state.hyperlink, {from: accounts[0], to: sponsorInstance.address, value: web3.toWei(parseFloat(this.state.amount), 'ether')})
      .then(() => {
        this.setState({
          memo: '',
          hyperlink: '',
          amount: ''
        })
      })
    })    
  }

  render() {
    return (
      <div>
        <h1>Generosity Box</h1>
        <h4><i>Get into the hall of fame by being generous!</i></h4>
        <TextField
          style={{width: '100%'}}       
          hintText="Your memo (e.g. Buy coca-cola)"          
          onChange={(e) => this.setState({memo: e.target.value})}/>
        <TextField
          style={{width: '100%'}}       
          hintText="Sponsor amount in ethereum (e.g. 42.42)"          
          onChange={(e) => this.setState({amount: e.target.value})}/>
        <TextField
          style={{width: '100%'}}       
          hintText="Link to your website (e.g. kndrck.co)"          
          onChange={(e) => this.setState({hyperlink: e.target.value})}/> 

        <FlatButton
          label="Sponsor Me!"
          icon={<PaymentIcon/>}
          style={{marginTop: '10px', width: '100%'}}
          onClick={this.callSponsorContract.bind(this)}
          backgroundColor={green400} hoverColor={greenA400}/>        
      </div>
    )
  }
}


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {      
      web3: null,
      sponsorInstance: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const sponsorshipContract = contract(SponsorshipContract)
    sponsorshipContract.setProvider(this.state.web3.currentProvider)

    // Get sponsorship contract instance
    sponsorshipContract.deployed().then((instance) => {
      this.setState({
        sponsorInstance: instance
      })
    })    
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="container">
            <hr/>                                   
            <SponsorApp web3={this.state.web3} sponsorInstance={this.state.sponsorInstance} /> <br/>
            <hr/>            
            <SponsorList web3={this.state.web3} sponsorInstance={this.state.sponsorInstance} />
          </div>          
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App
