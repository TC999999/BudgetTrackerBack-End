// generates a random number between 0 and 999999; if it has less than 6 digts, push zeros to the left side
// of the string until it has a length of 6
const makeOneTimeCode = () => {
  let num = (Math.floor(Math.random() * 999999) + 1).toString();
  for (let i = 0; i < 6 - num.length; i++) {
    num = "0" + num;
  }
  return num;
};

module.exports = { makeOneTimeCode };
