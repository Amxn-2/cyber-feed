// src/utils/helpers.js
const moment = require('moment');

const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const generateHash = (str) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex');
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '');
};

const extractKeywords = (text) => {
  const keywords = [
    'ransomware', 'malware', 'phishing', 'ddos', 'breach', 
    'hack', 'cyber attack', 'vulnerability', 'trojan'
  ];
  
  const found = [];
  const textLower = text.toLowerCase();
  
  keywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      found.push(keyword);
    }
  });
  
  return found;
};

module.exports = {
  formatDate,
  generateHash,
  sanitizeInput,
  extractKeywords
};
