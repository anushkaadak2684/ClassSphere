/**
 * Generate a unique 6-character uppercase alphanumeric join code
 * (avoiding easily confusable characters like 0/O, 1/I)
 */
const generateJoinCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
};

module.exports = generateJoinCode;
