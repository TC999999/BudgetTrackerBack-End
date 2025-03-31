// merges an array of miscellaenous transactions and an array budget expense
// transactions and merges them into a single array of all transactions that
// is sorted by date
function sortExpenses(transactions, transactionExpenses) {
  //   console.log(transactions);
  //   console.log(transactionExpenses);

  let returnArr = [];
  let i = 0;
  let j = 0;
  while (i < transactions.length && j < transactionExpenses.length) {
    if (transactions[i].date >= transactionExpenses[j].date) {
      returnArr.push(transactions[i]);
      i++;
    } else if (transactions[i].date < transactionExpenses[j].date) {
      returnArr.push(transactionExpenses[j]);
      j++;
    }
  }

  while (i < transactions.length) {
    returnArr.push(transactions[i]);
    i++;
  }
  while (j < transactionExpenses.length) {
    returnArr.push(transactionExpenses[j]);
    j++;
  }

  return returnArr;
}

module.exports = { sortExpenses };
