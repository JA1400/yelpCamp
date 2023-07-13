const axios = require('axios');
const fs = require('fs')
let jsonData = undefined;
const imgUrls = []
const config = {
    headers: { Authorization: 'Client-ID 1C6i-IKLpNV6nQcHfAn5S50CEhQ5GPA2wgxqqkCxyFA' },
}

const saveRes = async () => {

    const res = await axios.get(`https://api.unsplash.com/collections/483251/photos?page=10&per_page=5`, config);
    console.log(res.data.length);
    for (const img of res.data) {
        console.log(img.urls.regular);
        fs.appendFile('seeds/test.txt', img.urls.regular + "\r\n", err => {
            console.log('write');
            if (err) {
                console.log(err);
            }
        })
    }
}



saveRes();
/* console.log('after ', imgUrls.length); */