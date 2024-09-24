/**
 * Helper to handle promises without using try-catch in each async operation.
 */

const promiseMaker = (promise) => {
  return promise.then((data) => [null, data]).catch((error) => [error, null])
}

/**
 * Helper to check if a value is empty.
 */

const isEmpty = (val) => {
  if (typeof val === "Object") {
    return Object.keys(val).length === 0 && val.constructor === Object
  } else if (typeof val === "Array") {
    return val.length === 0
  } else {
    return [undefined, null, ""].includes(val)
  }
}

const checkValidObjectId = (id) => {
  const regExp = /^[0-9a-fA-F]{24}$/
  return regExp.test(id)
}

module.exports = {
  promiseMaker,
  isEmpty,
  checkValidObjectId
}
