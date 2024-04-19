const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

async function fetchTransactions(accountAddress) {
    try {
        let txndata  = await axios.get(`https://api.testnet.aptoslabs.com/v1/accounts/${accountAddress}/transactions`)
        txndata = txndata.data; 
        return txndata;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Transaction not found:', error);
        } else {
            console.error('Error fetching transactions:', error);
        }
        return error;
    }
}

app.post('/transactions', async (req, res) => {
    const { accountAddress, contractAddress } = req.body;

    let respTransactions = [];
    const transactions = await fetchTransactions(accountAddress, contractAddress);
    console.log(transactions.length);
    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        if (transaction.payload && transaction.payload.function) {
            const functionHex = transaction.payload.function.split('::')[0];
            if (functionHex.toLowerCase().includes(contractAddress.toLowerCase())) {
                respTransactions.push(transaction.hash);
            }
        }
    }
    res.status(200).json(respTransactions);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})