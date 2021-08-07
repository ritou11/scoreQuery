const _ = require('lodash');
const axios = require('axios');
const jsdom = require('jsdom');
const xlsx = require('xlsx');
const fs = require('fs');

const { log } = console;
const { JSDOM } = jsdom;

const ax = axios.create({
  // Option 1
  // baseURL: 'http://q1.jletv.cn/',
  // Option 2
  // baseURL: 'http://q2.jletv.cn/',
  // Option 3
  baseURL: 'http://q3.jletv.cn/',
  timeout: 2000,
});

const query = async (ksh, xm) => {
  const { data } = await ax.get('wechat/gk-admission.php', {
    params: {
      ksh,
      xm,
      message: '',
    },
  });
  const dom = new JSDOM(data);
  const yxCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(5) > td');
  const zyCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(7) > td');
  const rqCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(9) > td');
  if (yxCell) {
    return {
      yx: parseInt(yxCell.textContent, 10),
      zy: parseInt(zyCell.textContent, 10),
      rq: parseInt(rqCell.textContent, 10),
    };
  }
  return {
    yx: '未录取',
  };
};

const invoke = (data, i, maxL) => {
  const csh = data[i]['考生号'].trim();
  const xm = data[i]['姓名'].trim();
  query(csh, xm).then((cj) => {
    log(`${data[i]['姓名']}, ${cj.yx}, ${i + 1}/${maxL}`);
    fs.appendFileSync('./data/res.txt', `${csh},${xm},${cj.yx},${cj.zy},${cj.rq}\n`);
    if (i < maxL - 1) _.delay(invoke, 300, data, i + 1, maxL);
  }).catch((error) => {
    console.error(error.code);
    if (i < maxL - 1) _.delay(invoke, 300, data, i, maxL);
  });
};

const workbook = xlsx.readFile('data/2021.xlsx');
const snl = workbook.SheetNames;
const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[snl[0]]);
// invoke(xlData, 0, 2);
invoke(xlData, 0, xlData.length);

// console.log(dt['考生号'].trim(), dt['姓名'].trim());
// query(17220104153346, '王天贺');
