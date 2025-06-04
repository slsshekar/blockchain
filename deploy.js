const Web3 = require('web3').default;
const path = require('path');
const fs = require('fs');

const providerUrl = 'http://127.0.0.1:7545'; // Ganache default RPC URL
const web3 = new Web3(providerUrl);

const buildPathDonationTracking = path.resolve(__dirname, 'src', 'contracts', 'build', 'DonationTrackingABI.json');
const buildPathDonorManagement = path.resolve(__dirname, 'src', 'contracts', 'build', 'DonorManagementABI.json');
const buildPathBloodBankManagement = path.resolve(__dirname, 'src', 'contracts', 'build', 'BloodBankManagementABI.json');
const buildPathBloodDonation = path.resolve(__dirname, 'src', 'contracts', 'build', 'BloodDonationABI.json');

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Deploying from account:', accounts[0]);

  // Load contract JSONs
  const donationTrackingJson = JSON.parse(fs.readFileSync(buildPathDonationTracking, 'utf8'));
  const donorManagementJson = JSON.parse(fs.readFileSync(buildPathDonorManagement, 'utf8'));
  const bloodBankManagementJson = JSON.parse(fs.readFileSync(buildPathBloodBankManagement, 'utf8'));
  const bloodDonationJson = JSON.parse(fs.readFileSync(buildPathBloodDonation, 'utf8'));

  // Deploy DonationTracking
  const donationTrackingContract = new web3.eth.Contract(donationTrackingJson.abi);
  const deployedDonationTracking = await donationTrackingContract
    .deploy({ data: '0x' + donationTrackingJson.bytecode })
    .send({ from: accounts[0], gas: 6000000 });
  console.log('DonationTracking deployed at:', deployedDonationTracking.options.address);

  // Deploy DonorManagement
  const donorManagementContract = new web3.eth.Contract(donorManagementJson.abi);
  const deployedDonorManagement = await donorManagementContract
    .deploy({ data: '0x' + donorManagementJson.bytecode })
    .send({ from: accounts[0], gas: 6000000 });
  console.log('DonorManagement deployed at:', deployedDonorManagement.options.address);

  // Deploy BloodBankManagement
  const bloodBankManagementContract = new web3.eth.Contract(bloodBankManagementJson.abi);
  const deployedBloodBankManagement = await bloodBankManagementContract
    .deploy({ data: '0x' + bloodBankManagementJson.bytecode })
    .send({ from: accounts[0], gas: 6000000 });
  console.log('BloodBankManagement deployed at:', deployedBloodBankManagement.options.address);

  // Deploy BloodDonation
  const bloodDonationContract = new web3.eth.Contract(bloodDonationJson.abi);
  const deployedBloodDonation = await bloodDonationContract
    .deploy({ data: '0x' + bloodDonationJson.bytecode })
    .send({ from: accounts[0], gas: 6000000 });
  console.log('BloodDonation deployed at:', deployedBloodDonation.options.address);

  // Save deployed addresses and ABIs to respective JSON files for frontend
  const saveContract = (json, deployed, filename) => {
    const frontendContract = {
      abi: json.abi,
      networks: {
        1337: {
          address: deployed.options.address,
        },
      },
    };
    const frontendPath = path.resolve(__dirname, 'src', 'contracts', filename);
    fs.writeFileSync(frontendPath, JSON.stringify(frontendContract, null, 2), 'utf8');
    console.log(`Updated frontend ABI and address saved to src/contracts/${filename}`);
  };

  saveContract(donationTrackingJson, deployedDonationTracking, 'DonationTracking.json');
  saveContract(donorManagementJson, deployedDonorManagement, 'DonorManagement.json');
  saveContract(bloodBankManagementJson, deployedBloodBankManagement, 'BloodBankManagement.json');
  saveContract(bloodDonationJson, deployedBloodDonation, 'BloodDonation.json');

  process.exit(0);
};

deploy().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
