const axios = require('axios');
const aesjs = require('aes-js');
const date = new Date();

function encrypt(temperature) {
    const keyPlainText = '9F86D081884C7D659A2FEAA0C55AD015';
    const keyArray = [...Buffer.from(keyPlainText)];
    const key = new Uint8Array(keyArray);
    const temperatureArray = [...Buffer.from(temperature.toString())];
    const padded = aesjs.padding.pkcs7.pad(temperatureArray);
    const aesEcb = new aesjs.ModeOfOperation.ecb(key);
    const encryptedBytes = aesEcb.encrypt(padded);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
}

function randomNumber(min, max) {
    return parseInt(Math.random() * (max - min) + min, 10);
}

const getGraphQLQuery = (timestamp, tempEncrypted) => {
    return JSON.stringify({
        query: `mutation{\n  sendMessages(sensorContractAddress:"${process.env.SENSOR_ADDRESS}",\n  newMessagesDTO:{\n    records:[\n      {\n        key:"${timestamp}",\n        value:"${tempEncrypted}"\n      }\n    ]\n  }) {\n    statusCode\n    responseBody\n  }\n}`,
        variables: {}
    });
}


const getAxiosConfig = (timestamp, tempEncrypted) => {
    return {
        method: 'post',
        url: 'https://iot-data-mp.com/graphql',
        headers: {
            'Authorization': `Bearer ${process.env.JWT}`,
            'Content-Type': 'application/json'
        },
        data : getGraphQLQuery(timestamp, tempEncrypted)
    };
}

async function publishMessage() {
    do {
        try {
            const tempEncrypted = encrypt(randomNumber(50, 60));
            const result = await axios(getAxiosConfig(date.getTime(), tempEncrypted));
            console.log('result: ', result.data);
        } catch (e) {
            console.error('Error: ', e);
        }
    } while(true);
}

publishMessage();