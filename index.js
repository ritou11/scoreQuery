const _ = require('lodash');
const axios = require('axios');
const jsdom = require('jsdom');
const xlsx = require('xlsx');
const fs = require('fs');

const { log } = console;
const { JSDOM } = jsdom;

const ax = axios.create({
  baseURL: 'http://q1.jletv.cn/',
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
  const ywCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)');
  const sxCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2)');
  const zhCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(3) > td:nth-child(2)');
  const wyCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(4) > td:nth-child(2)');
  const mzCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(5) > td:nth-child(2)');
  const zfCell = dom.window.document.querySelector('body > div > div.main.main-search.main-gk > div > div > div > table > tbody > tr:nth-child(6) > td:nth-child(2)');
  if (zfCell) {
    return {
      zf: parseInt(zfCell.textContent, 10),
      yw: parseInt(ywCell.textContent, 10),
      sx: parseInt(sxCell.textContent, 10),
      wy: parseInt(wyCell.textContent, 10),
      zh: parseInt(zhCell.textContent, 10),
      mz: parseInt(mzCell.textContent, 10),
    };
  }
  return {
    zf: 0,
  };
};

const invoke = (data, i, maxL) => {
  const csh = data[i]['考生号'].trim();
  const xm = data[i]['姓名'].trim();
  query(csh, xm).then((cj) => {
    log(`${data[i]['姓名']}, ${cj.zf}, ${i + 1}/${maxL}`);
    fs.appendFileSync('./res.txt', `${csh},${xm},${cj.yw},${cj.sx},${cj.zh},${cj.wy},${cj.mz},${cj.zf}\n`);
    if (i < maxL - 1) _.delay(invoke, 300, data, i + 1, maxL);
  }).catch(() => {
    // console.log(error.code);
    if (i < maxL - 1) _.delay(invoke, 300, data, i, maxL);
  });
};

const workbook = xlsx.readFile('data.xlsx');
const snl = workbook.SheetNames;
const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[snl[0]]);
// invoke(xlData, 0, 2);
invoke(xlData, 0, xlData.length);

// console.log(dt['考生号'].trim(), dt['姓名'].trim());
// query(17220104153346, '王天贺');
