import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    console.log("hi from script");
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("connected");
        connectButton.innerText = "Connected";
    } else {
        console.log("No metamask!");
        connectButton.innerText = "Please install MetaMask";
    }
}

/* fund function
- connect to blockchain
- need signer/wallet/someone with some gas
- get contract that we are interacting with
- need abi and addy of the ctrct ^

*/
// withdraw function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        //connect to blockchain first
        const provider = new ethers.providers.Web3Provider(window.ethereum); // provider is our connection to the eth network (thru mmask in this case)
        const signer = provider.getSigner(); //signer is an ethereum account, used to sign messages + txns (mmask account in this case)
        const contract = new ethers.Contract(contractAddress, abi, signer); //need to get abi and address
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            // listen for the txn to be mined OR listen for an event (we will learn this later)
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done");
        } catch (error) {
            console.log(error);
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum); // provider is our connection to the eth network (thru mmask in this case)
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    console.log(`Withdrawing...`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum); // provider is our connection to the eth network (thru mmask in this case)
        const signer = provider.getSigner(); //signer is an ethereum account, used to sign messages + txns (mmask account in this case)
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    // return new Promise();
    // create a listener for blockchain
    // listen for txn to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}
