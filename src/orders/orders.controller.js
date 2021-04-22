const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// validation middleware
function bodyHasAllProperties(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if (!deliverTo || !deliverTo.trim()) {
    next({
      status: 400,
      message: "Order must include a deliverTo"
    })
  }
  if (!mobileNumber || !mobileNumber.trim()) {
    next({
      status: 400,
      message: "Order must include a mobileNumber"
    })
  } 
  if (!dishes) {
    next({
      status: 400,
      message: "Order must include a dish"
    })
  }
  return next();
}

function dishesPropertyIsValid(req, res, next) {
  const { data: { dishes } } = req.body;
  if (!Array.isArray(dishes) || !dishes.length) {
    next({
      status: 400,
      message: "Order must include at least one dish"
    })
  }
  dishes.map((dish, index) => {
    let regex = /^[0-9]*$/g
    if (!dish.quantity || dish.quantity <= 0 || !dish.quantity.match(regex)) {
      next({
        status: 400,
        message: `Dish ${index + 1} must have a quantity that is an integer greater than 0`
      })
    }
  })
  next();
}

// orders handlers
function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } } = req.body;
  const newOrder = {
    id: nextId(), // Increment last id then assign as the current ID
    deliverTo,
    mobileNumber,
    dishes
  }
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

module.exports = {
  list,
  create: [bodyHasAllProperties, dishesPropertyIsValid, create],
}