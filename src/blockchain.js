import Web3 from 'web3';
import DonorManagementABI from './contracts/DonorManagement.json';
import BloodBankManagementABI from './contracts/BloodBankManagement.json';
import DonationTrackingABI from './contracts/DonationTracking.json';

// Updated contract addresses from deployment
const DONOR_MANAGEMENT_ADDRESS = "0x8135966f954Dd5B7a338798fd5dFc5BbB6a913B8";
const BLOOD_BANK_MANAGEMENT_ADDRESS = "0x6b8fcc81778F62CCCd4A169d1eBaa1e4d6C38274";
const DONATION_TRACKING_ADDRESS = "0xa9617baD34CFB199f2C3A2B6B26C2fD12eD538a8";

let web3Instance = null;
let ethRequestAccountsPromise = null;

const getWeb3 = async () => {
  if (web3Instance) {
    return web3Instance;
  }
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    if (!ethRequestAccountsPromise) {
      ethRequestAccountsPromise = window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    try {
      await ethRequestAccountsPromise;
      web3Instance = web3;
      return web3Instance;
    } catch (error) {
      ethRequestAccountsPromise = null;
      throw error;
    }
  } else if (window.web3) {
    web3Instance = window.web3;
    return web3Instance;
  } else {
    throw new Error('No Ethereum browser extension detected.');
  }
};

const getContracts = async (web3) => {
  const donorManagement = new web3.eth.Contract(DonorManagementABI.abi, DONOR_MANAGEMENT_ADDRESS);
  const bloodBankManagement = new web3.eth.Contract(BloodBankManagementABI.abi, BLOOD_BANK_MANAGEMENT_ADDRESS);
  const donationTracking = new web3.eth.Contract(DonationTrackingABI.abi, DONATION_TRACKING_ADDRESS);
  return { donorManagement, bloodBankManagement, donationTracking };
};

export { getWeb3, getContracts };
