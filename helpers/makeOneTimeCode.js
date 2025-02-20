const makeOneTimeCode = () => {
  let num = (Math.floor(Math.random() * 999999) + 1).toString();
  for (let i = 0; i < 6 - num.length; i++) {
    num = "0" + num;
  }
  return num;
};

module.exports = { makeOneTimeCode };
