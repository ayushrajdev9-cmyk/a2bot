const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read(name) {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return {};
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch {
    logger.warn(`Corrupted data file: ${name}.json, resetting.`);
    return {};
  }
}

function write(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = {
  get: (name, key) => {
    const data = read(name);
    return key ? data[key] : data;
  },
  set: (name, key, value) => {
    const data = read(name);
    data[key] = value;
    write(name, data);
  },
  delete: (name, key) => {
    const data = read(name);
    delete data[key];
    write(name, data);
  },
  all: read,
  push: (name, key, value) => {
    const data = read(name);
    if (!Array.isArray(data[key])) data[key] = [];
    data[key].push(value);
    write(name, data);
  },
};
