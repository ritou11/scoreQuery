const _ = require('lodash');
const axios = require('axios');
const jsdom = require('jsdom');
const xlsx = require('xlsx');
const fs = require('fs');

const { JSDOM } = jsdom;

const ax = axios.create({
  baseURL: 'http://q3.jletv.cn/',
  timeout: 2000,
});

const query = async (ksh, xm) => {
  const { data } = await ax.get('wechat/gk-query.php', {
    params: {
      ksh,
      xm,
      message: '',
    },
  });
  const dom = new JSDOM(data);
  const cell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(6) > td:nth-child(2)');
  if (cell) return cell.textContent;
  return 0;
};

const invoke = (data, i, maxL) => {
  query(data[i]['考生号'].trim(), data[i]['姓名'].trim()).then((ct) => {
    console.log(`${data[i]['姓名']}, ${parseInt(ct, 10)}, ${i + 1}/${maxL}`);
    fs.appendFileSync('./res.txt', `${data[i]['姓名']},${parseInt(ct, 10)}\n`);
    if (i < maxL - 1) _.delay(invoke, 300, data, i + 1, maxL);
  }).catch(() => {
    // console.log(error.code);
    if (i < maxL - 1) _.delay(invoke, 300, data, i, maxL);
  });
};

const workbook = xlsx.readFile('data.xlsx');
const snl = workbook.SheetNames;
const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[snl[0]]);
invoke(xlData, 0, xlData.length);

// console.log(dt['考生号'].trim(), dt['姓名'].trim());
// query(17220104153346, '王天贺');
