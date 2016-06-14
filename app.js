console.log('Starting password manager');
var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
  .command('create', 'Populates details of a new account', function(yargs){
    yargs.options({
      name:{
        demand: true,
        type: 'string',
        alias: 'n',
        description: 'This refers to the account name'
      },
      username: {
        demand: true,
        type: 'string',
        alias: 'u',
        description: 'This refers to the username associated with the account'
      },
      password: {
        demand: true,
        type: 'string',
        alias: 'p',
        description: 'This refers to the username for this account'
      },
      masterPW: {
        demand: true,
        type: 'string',
        alias: 'm',
        description: 'This is the password for the password manager.'
      }
    });
  }).help('help') //help for 'create'
  .command('get', 'Retrieves an existing account', function(yargs){
    yargs.options({
      name: {
        demand: true,
        type: 'string',
        alias: 'n',
        description: 'Enter the name of the account (Ex: Facebook, LinkedIn)'
      },
      masterPW: {
        demand: true,
        type: 'string',
        alias: 'm',
        description: 'This is the password for the password manager.'
      }
    });
  }).help('help')//help for get
  .command('delete', 'Deletes an account', function(yargs){
    yargs.options({
      name: {
        demand: true,
        type: 'string',
        alias: 'n',
        description: 'Enter the name of the account to be deleted (Ex: Facebook, LinkedIn)'
      },
      masterPW: {
        demand: true,
        type: 'string',
        alias: 'm',
        description: 'This is the password for the password manager.'
      }
    });
  }).help('help')
  .argv;
var command = argv._[0];

//====GETTING AND DECRYPTING ACCOUNTS==========//
function getAccounts(masterPW){
  //Get accounts
  var encryptedAccounts = storage.getItemSync('accounts');
  if(typeof encryptedAccounts === 'undefined'){
    var accounts = [];
  } else {
    //Decode accounts
    var bytes = crypto.AES.decrypt(encryptedAccounts, masterPW);
    bytes = bytes.toString(crypto.enc.Utf8);
    var accounts = JSON.parse(bytes);
  }
  return accounts;
}

function findAccount(accountName, masterPW){
  //get accounts
  var accounts = getAccounts(masterPW);
  //match the accountName to the matching account
  var matched;
  accounts.forEach(function(item){
    if(item.name == accountName){
      matched = item;
    } else {
      console.log('No matching account found');
    }
  });
  //return that account
  console.log(matched);
  return matched;
}

if(command === 'get'){
  try{
    findAccount(argv.name, argv.masterPW);
  } catch(e) {
    console.log('There was an error: ', e.message);
  }
}

//========CREATING A NEW ACCOUNT ====//
function newAccount(name, username, password, masterPW){
  this.name = name;
  this.username = username;
  this.password = password;
  this.masterPW = masterPW;
}

if(command === 'create'){
  // try{
    var createdAccount = new newAccount(argv.name, argv.username, argv.password, argv.masterPW);
    createNewAccount(createdAccount, createdAccount.masterPW);
  // } catch(e){
  // console.log("An error prevented the account from being created: ", e.message)
  // }
}

function createNewAccount(createdAccount, masterPW){
  //Get accounts
  var accounts = getAccounts(masterPW);
  //Push createdAccount to accounts array
  accounts.push(createdAccount);
  //Save accounts
  saveAccounts(accounts, masterPW);
}

//=======SAVE AND ENCRYPT ACCOUNTS=====//

function saveAccounts(accountsArray, masterPW){
  //Convert accounts array to JSON
  var accounts = JSON.stringify(accountsArray);
  // console.log(accounts);
  //Encrypt JSON
  var encryptedData = crypto.AES.encrypt(accounts, masterPW);
  //Save data
  storage.setItemSync('accounts', encryptedData.toString());
  console.log('Account saved successfully.');
}



//Calling Delete account function
if(command === 'delete'){
  try{
    deleteAcct(argv.name, argv.masterPW);
  } catch(e) {
    console.log('There was an error: ', e.message);
  }
}

// console.log(storage.getItemSync('accounts'));
function deleteAcct(acctName, masterPW){
  //get the accounts array
  var accounts = getAccounts(masterPW);
  //splice the item off the accounts array.
  accounts.forEach(function(item, index){
    if(item.name == acctName){
      accounts.splice(index, 1);
    }
  }); //end forEach
  console.log(accounts);
  saveAccounts(accounts, masterPW);
}
