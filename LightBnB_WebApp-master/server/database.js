const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool
    .query(
      `select * from users where users.email = $1`,
      [`${email}`])
    .then((result) => {
      return  Promise.resolve(result.rows[0])
     })
    .catch((err) => {
      null;
    });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
    .query(
      `select * from users where users.id = $1`,
      [`${id}`])
    .then((result) => {
      return  Promise.resolve(result.rows[0])
     })
    .catch((err) => {
      null;
    });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
    .query(
      `INSERT INTO users(name,email,password)
      VALUES($1,$2,$3)
      RETURNING *`,
      [`${user.name}`, `${user.email}`,`${user.password}`])
    .then((result) => {
      return  Promise.resolve(result.rows[0])
     })
    .catch((err) => {
      null;
    });
}

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  // return getAllProperties(null, 2);
  return pool
    .query(
      `select * 
      from properties 
      JOIN reservations 
      ON properties.id = property_id 
      where guest_id = $1
      LIMIT $2`,
      [`${guest_id}`,limit])
    .then((result) => {
      return result.rows;
     })
    .catch((err) => {
      console.log(err);
    });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

// const getAllProperties = (options, limit = 10) => {
//   return pool
//     .query(
//       `select * from properties limit $1`,
//       [limit])
//     .then((result) => {
//       // console.log(result.rows)
//     })
//     .catch((err) => {
//       // console.log(err.message);
//     });
//   };
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  const queryStrings = [];
  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    queryStrings.push(`owner_id = $${queryParams.length}`);
  }
  if (options.city) {
    queryParams.push(`%${options.city.toUpperCase()}%`);
    queryStrings.push(`UPPER(city) LIKE $${queryParams.length}`);
  }
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryStrings.push(`cost_per_night >= $${queryParams.length}`);
  }
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryStrings.push(`cost_per_night <= $${queryParams.length}`);
  }
  
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
  }
  

  if(queryStrings.length) {
    queryString = queryString+ 'where '+ queryStrings.join(' and ');
  }


  



  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ${options.minimum_rating? 'HAVING avg(property_reviews.rating) >= $' + (queryParams.length - 1) : ''}
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(options)
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
