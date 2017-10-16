const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Recipes', function() {
  before( function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('Should list items on GET', function() {
    return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      res.should.have.status(200);
      res.should.be.an('object');
      res.body.should.be.an('array');
      const expectedKeys = ['name', 'id', 'ingredients'];
      res.body.forEach(function(item) {
        item.should.include.keys(expectedKeys);
      });
    });
  });

  // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it('Should create new item on POST', function(){
    const newRecipe = {
      'name': 'Fried Rice',
      'ingredients': ['Rice', 'Soy Sauce', 'Egg', 'Sausage']
    }
    return chai.request(app)
    .post('/recipes')
    .send(newRecipe)
    .then(function(res) {
      res.should.have.status(201);
      res.body.should.be.an('object');
      res.body.id.should.not.be.null;
      res.body.should.include.keys('name', 'id', 'ingredients');
    });
  });

  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.
  it('Should update an exisiting item on PUT', function(){
    const updatedRecipe = {
      'name': 'Fried Rice',
      'ingredients': ['Rice', 'Soy Sauce', 'Egg', 'Sausage']
    }
    return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      updatedRecipe.id = res.body[0].id;
      return chai.request(app)
      .put(`/recipes/${updatedRecipe.id}`)
      .send(updatedRecipe);
    })
    .then(function(res) {
      res.should.have.status(204);
    });
  });

  // test strategy:
  //  1. GET a shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it('Should delete an item on DELETE', function() {
    return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      const selectedID = res.body[0].id;
      return chai.request(app)
      .delete(`/recipes/${selectedID}`)
    })
    .then(function(res) {
      res.should.have.status(204);
    });
  });

  it('Not supplying required fields should throw an error on POST', function() {
    const newErrorRecipe = {
      'name': 'Fried Rice'
    }
    return chai.request(app)
    .post('/recipes/')
    .send(newErrorRecipe)
    .catch(function(res) {
      console.log(`I'm catching`);
      res.should.have.status(400);
    })
  });

  it('Supplying incorrect ID for updating a recipe should throw an error on PUT', function() {
    const updatedErrorRecipe = {
      'name': 'Fried Rice',
      'ingredients': ['Rice', 'Soy Sauce', 'Egg', 'Sausage'
      ],
      'id': 'y'
    }
    return chai.request(app)
    .put('/recipes/x')
    .send(updatedErrorRecipe)
    .catch(function(res) {
      res.should.have.status(400);
    });
  });

// it('Supplying incorrect ID should throw an error on DELETE', function() {
//   return chai.request(app)
//   .delete('/recipes/xyz')
//   .then(function(res) {
//     console.log(res);
//     res.should.be.an(Error);
//   });
// });
});
