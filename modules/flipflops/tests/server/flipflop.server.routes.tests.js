'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Flipflop = mongoose.model('Flipflop'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  flipflop;

/**
 * Flipflop routes tests
 */
describe('Flipflop CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Flipflop
    user.save(function () {
      flipflop = {
        name: 'Flipflop name'
      };

      done();
    });
  });

  it('should be able to save a Flipflop if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Flipflop
        agent.post('/api/flipflops')
          .send(flipflop)
          .expect(200)
          .end(function (flipflopSaveErr, flipflopSaveRes) {
            // Handle Flipflop save error
            if (flipflopSaveErr) {
              return done(flipflopSaveErr);
            }

            // Get a list of Flipflops
            agent.get('/api/flipflops')
              .end(function (flipflopsGetErr, flipflopsGetRes) {
                // Handle Flipflops save error
                if (flipflopsGetErr) {
                  return done(flipflopsGetErr);
                }

                // Get Flipflops list
                var flipflops = flipflopsGetRes.body;

                // Set assertions
                (flipflops[0].user._id).should.equal(userId);
                (flipflops[0].name).should.match('Flipflop name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Flipflop if not logged in', function (done) {
    agent.post('/api/flipflops')
      .send(flipflop)
      .expect(403)
      .end(function (flipflopSaveErr, flipflopSaveRes) {
        // Call the assertion callback
        done(flipflopSaveErr);
      });
  });

  it('should not be able to save an Flipflop if no name is provided', function (done) {
    // Invalidate name field
    flipflop.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Flipflop
        agent.post('/api/flipflops')
          .send(flipflop)
          .expect(400)
          .end(function (flipflopSaveErr, flipflopSaveRes) {
            // Set message assertion
            (flipflopSaveRes.body.message).should.match('Please fill Flipflop name');

            // Handle Flipflop save error
            done(flipflopSaveErr);
          });
      });
  });

  it('should be able to update an Flipflop if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Flipflop
        agent.post('/api/flipflops')
          .send(flipflop)
          .expect(200)
          .end(function (flipflopSaveErr, flipflopSaveRes) {
            // Handle Flipflop save error
            if (flipflopSaveErr) {
              return done(flipflopSaveErr);
            }

            // Update Flipflop name
            flipflop.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Flipflop
            agent.put('/api/flipflops/' + flipflopSaveRes.body._id)
              .send(flipflop)
              .expect(200)
              .end(function (flipflopUpdateErr, flipflopUpdateRes) {
                // Handle Flipflop update error
                if (flipflopUpdateErr) {
                  return done(flipflopUpdateErr);
                }

                // Set assertions
                (flipflopUpdateRes.body._id).should.equal(flipflopSaveRes.body._id);
                (flipflopUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Flipflops if not signed in', function (done) {
    // Create new Flipflop model instance
    var flipflopObj = new Flipflop(flipflop);

    // Save the flipflop
    flipflopObj.save(function () {
      // Request Flipflops
      request(app).get('/api/flipflops')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Flipflop if not signed in', function (done) {
    // Create new Flipflop model instance
    var flipflopObj = new Flipflop(flipflop);

    // Save the Flipflop
    flipflopObj.save(function () {
      request(app).get('/api/flipflops/' + flipflopObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', flipflop.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Flipflop with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/flipflops/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Flipflop is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Flipflop which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Flipflop
    request(app).get('/api/flipflops/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Flipflop with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Flipflop if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Flipflop
        agent.post('/api/flipflops')
          .send(flipflop)
          .expect(200)
          .end(function (flipflopSaveErr, flipflopSaveRes) {
            // Handle Flipflop save error
            if (flipflopSaveErr) {
              return done(flipflopSaveErr);
            }

            // Delete an existing Flipflop
            agent.delete('/api/flipflops/' + flipflopSaveRes.body._id)
              .send(flipflop)
              .expect(200)
              .end(function (flipflopDeleteErr, flipflopDeleteRes) {
                // Handle flipflop error error
                if (flipflopDeleteErr) {
                  return done(flipflopDeleteErr);
                }

                // Set assertions
                (flipflopDeleteRes.body._id).should.equal(flipflopSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Flipflop if not signed in', function (done) {
    // Set Flipflop user
    flipflop.user = user;

    // Create new Flipflop model instance
    var flipflopObj = new Flipflop(flipflop);

    // Save the Flipflop
    flipflopObj.save(function () {
      // Try deleting Flipflop
      request(app).delete('/api/flipflops/' + flipflopObj._id)
        .expect(403)
        .end(function (flipflopDeleteErr, flipflopDeleteRes) {
          // Set message assertion
          (flipflopDeleteRes.body.message).should.match('User is not authorized');

          // Handle Flipflop error error
          done(flipflopDeleteErr);
        });

    });
  });

  it('should be able to get a single Flipflop that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Flipflop
          agent.post('/api/flipflops')
            .send(flipflop)
            .expect(200)
            .end(function (flipflopSaveErr, flipflopSaveRes) {
              // Handle Flipflop save error
              if (flipflopSaveErr) {
                return done(flipflopSaveErr);
              }

              // Set assertions on new Flipflop
              (flipflopSaveRes.body.name).should.equal(flipflop.name);
              should.exist(flipflopSaveRes.body.user);
              should.equal(flipflopSaveRes.body.user._id, orphanId);

              // force the Flipflop to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Flipflop
                    agent.get('/api/flipflops/' + flipflopSaveRes.body._id)
                      .expect(200)
                      .end(function (flipflopInfoErr, flipflopInfoRes) {
                        // Handle Flipflop error
                        if (flipflopInfoErr) {
                          return done(flipflopInfoErr);
                        }

                        // Set assertions
                        (flipflopInfoRes.body._id).should.equal(flipflopSaveRes.body._id);
                        (flipflopInfoRes.body.name).should.equal(flipflop.name);
                        should.equal(flipflopInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Flipflop.remove().exec(done);
    });
  });
});
