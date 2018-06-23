const axios = require('axios');
const jsdom = require("jsdom");
const fs = require('fs');
const parse = require('csv-parse');
const { JSDOM } = jsdom;

const ax = axios.create({
    baseURL: 'http://q3.jletv.cn/',
    timeout: 1000,
});

const query = async (ksh, xm) => {
    const { data } = await ax.get('wechat/gk-query.php', {
        params: {
            ksh,
            xm,
            message: '',
        }
    });
    const dom = new JSDOM(data);
    const { textContent } = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(6) > td:nth-child(2)');
    console.log(parseInt(textContent));
};

query(17220104153346, '王天贺');
