const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// validation middleware
function bodyHasAllProperties(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  if (name == "") {
    next({
      status: 400,
      message: "Dish must include a name"
    })
  }
  if (description == "") {
    next({
      status: 400,
      message: "Dish must include a description"
    })
  } 
  if (price == "") {
    next({
      status: 400,
      message: "Dish must include a price"
    })
  }
  if (image_url == "") {
    next({
      status: 400,
      message: "Dish must include a image_url"
    })
  }
  return next();
}

function pricePropertyIsValid(req, res, next) {
  const { data: { price } } = req.body;
  let regex = /^[0-9]*$/g
  if (price <= 0 || !price.match(regex)) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`
    });
  }
  return next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`
  })
}

function dishIdMatchesBodyId(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {}} = req.body;
  if (!id) return next();
  if (dishId !== id) {
    next ({
      status: 404,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
  }
  next();
}

// dishes handlers
function list(req, res) {
  res.json({data: dishes})
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(), // Increment last id then assign as the current ID
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: { id, name, description, price, image_url } } = req.body;
  if (dish.name !== name) {
    dish.name = name;
  }
  if (dish.description !== description) {
    dish.description = description;
  }
  if (dish.price !== price) {
    dish.price = price;
  }
  if (dish.image_url !== image_url) {
    dish.image_url = image_url;
  }

  res.json({ data: dish });

}


module.exports = {
  list,
  create: [bodyHasAllProperties, pricePropertyIsValid, create],
  read: [dishExists, read],
  update: [dishExists, bodyHasAllProperties, pricePropertyIsValid, dishIdMatchesBodyId, update],
}