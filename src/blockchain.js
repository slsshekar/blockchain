import Web3 from 'web3';
import DonorManagementABI from './contracts/DonorManagement.json';
import BloodBankManagementABI from './contracts/BloodBankManagement.json';
import DonationTrackingABI from './contracts/DonationTracking.json';

// Updated contract addresses from deployment
const DONOR_MANAGEMENT_ADDRESS = "0x9190b77a74dA28914116eEFe537029D2FE0e44e9";
const BLOOD_BANK_MANAGEMENT_ADDRESS = "0xB09A0C3402d20C856129d8f98fb2dF9013c63a1D";
const DONATION_TRACKING_ADDRESS = "0xCADFbBa1e808394dF0650a71e392A3ea1bb5E7c5";

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
