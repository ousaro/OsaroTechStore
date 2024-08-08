import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
//import request from 'supertest';
//import app from "../../server.js"
import { registerUser, loginUser } from '../../controllers/userAuthController.js';
import User from '../../models/userModel.js';
import jwt from 'jsonwebtoken';

// Setup stubs and spies
describe('UserAuth Controller - Unit Tests', function() {
    let sandbox;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    describe('registerUser', () => {
      it('should register a new user successfully', async () => {
        // Mock request and response objects
        const req = {
          body: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            picture: 'profile.jpg',
          }
        };
  
        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy(),
        };
  
        // Stub User.register method
        const mockUser = {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          picture: 'profile.jpg',
          admin: false,
          favorites: [],
          cart: [],
          address: '',
          city: '',
          country: '',
          state: '',
          postalCode: 0,
        };
  
        sandbox.stub(User, 'register').resolves(mockUser);
        sandbox.stub(jwt, 'sign').returns('mocked_token'); // Stub JWT sign method
  
        // Call the function
        await registerUser(req, res);
  
        // Assertions
        expect(User.register.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseBody = res.json.firstCall.args[0];
        expect(responseBody).to.have.property('token', 'mocked_token');
        expect(responseBody).to.have.property('_id');
        expect(responseBody.email).to.equal('john@example.com');
      });
  
      it('should handle errors when registration fails', async () => {
        // Mock request and response objects
        const req = {
          body: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            picture: 'profile.jpg',
          }
        };
  
        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy(),
        };
  
        // Stub User.register method to throw an error
        sandbox.stub(User, 'register').rejects(new Error('Registration failed'));
  
        // Call the function
        await registerUser(req, res);
  
        // Assertions
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseBody = res.json.firstCall.args[0];
        expect(responseBody).to.have.property('error');
        expect(responseBody.error).to.equal('Registration failed');
      });
    });
  
    describe('loginUser', () => {
      it('should login an existing user successfully', async () => {
        // Mock request and response objects
        const req = {
          body: {
            email: 'john@example.com',
            password: 'Password123!',
          }
        };
  
        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy(),
        };
  
        // Stub User.login method
        const mockUser = {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          picture: 'profile.jpg',
          admin: false,
          favorites: [],
          cart: [],
          address: '',
          city: '',
          country: '',
          state: '',
          postalCode: 0,
        };
  
        sandbox.stub(User, 'login').resolves(mockUser);
        sandbox.stub(jwt, 'sign').returns('mocked_token'); // Stub JWT sign method
  
        // Call the function
        await loginUser(req, res);
  
        // Assertions
        expect(User.login.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseBody = res.json.firstCall.args[0];
        expect(responseBody).to.have.property('token', 'mocked_token');
        expect(responseBody).to.have.property('_id');
        expect(responseBody.email).to.equal('john@example.com');
      });
  
      it('should handle errors when login fails', async () => {
        // Mock request and response objects
        const req = {
          body: {
            email: 'john@example.com',
            password: 'Password123!',
          }
        };
  
        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy(),
        };
  
        // Stub User.login method to throw an error
        sandbox.stub(User, 'login').rejects(new Error('Login failed'));
  
        // Call the function
        await loginUser(req, res);
  
        // Assertions
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseBody = res.json.firstCall.args[0];
        expect(responseBody).to.have.property('error');
        expect(responseBody.error).to.equal('Login failed');
      });
    });
  });

// describe('UserAuth Controller - Integration tests', function() {

//     after(async () => {
//         await User.deleteMany({});
//     })

//     it('should register a new user', async () => {
//         const response = await request(app)
//           .post('/api/users/auth/register')
//           .send({
//             firstName: 'John',
//             lastName: 'Doe',
//             email: 'john@example.com',
//             password: 'Password123!',
//             confirmPassword: 'Password123!',
//             picture: 'profile.jpg',
//           });
  
//         expect(response.status).to.equal(200);
//         expect(response.body).to.have.property('token');
//         expect(response.body).to.have.property('_id');
//         expect(response.body.email).to.equal('john@example.com');
//       });

//       it('should login an existing user', async () => {
//         // First, register a user
//         await request(app)
//           .post('/api/users/auth/register')
//           .send({
//             firstName: 'John',
//             lastName: 'Doe',
//             email: 'john@example.com',
//             password: 'Password123!',
//             confirmPassword: 'Password123!',
//             picture: 'profile.jpg',
//           });
  
//         // Now login with that user
//         const response = await request(app)
//           .post('/api/users/auth/login')
//           .send({
//             email: 'john@example.com',
//             password: 'Password123!',
//           });
  
//         expect(response.status).to.equal(200);
//         expect(response.body).to.have.property('token');
//         expect(response.body).to.have.property('_id');
//         expect(response.body.email).to.equal('john@example.com');
//       });
// });
