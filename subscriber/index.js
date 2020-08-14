const axios = require('axios');

const offsetData = JSON.stringify({
    query: `query{\n    getSensorSummary(\n      sensorContractAddress:"${process.env.SENSOR_ADDRESS}"\n    ) {\n        streamSize\n      }\n  }`,
    variables: {}
});

const offsetConfig = {
    method: 'post',
    url: 'https://iot-data-mp.com/graphql',
    headers: {
        'Content-Type': 'application/json'
    },
    data : offsetData
};


function getMessageQueryConfig(offset, count) {
    const data = JSON.stringify({
        query: `query{\n    getMessagesForSensor(\n      entityContractAddress:"${process.env.ENTITY_ADDRESS}",\n      sensorContractAddress:"${process.env.SENSOR_ADDRESS}",\n      offset:${offset},\n      count:${count}\n    ) {\n        records {\n          key\n          value\n          offset\n        }\n      }\n  }`,
        variables: null
    });

    const config = {
        method: 'post',
        url: 'https://iot-data-mp.com/graphql',
        headers: {
            'Authorization': `Bearer ${process.env.JWT}`,
            'Content-Type': 'application/json'
        },
        data : data
    };
    return config;
}

async function pullMessages() {
    do {
        const result = await getResult();
        if (result.data.getMessagesForSensor !== null) {
            console.log('messages returned: ', result.data.getMessagesForSensor.records.length);
        } else {
            console.log('Couldnt return getMessagesForSensor');
        }
    } while(true);
}

async function getResult() {
    try {
        const res = await axios(offsetConfig);
        let streamSize = 10000;

        if (res.data.data.getSensorSummary !== null) {
            streamSize = res.data.data.getSensorSummary.streamSize;
            console.log('streamSize: ', streamSize);
        } else {
            console.log('Couldnt return getSensorSummary');
        }

        const result = await axios(getMessageQueryConfig(streamSize - 5, 3));
        return result.data;
    } catch (error) {
        console.error(error);
    }
}


pullMessages();