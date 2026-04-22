import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import User from '../../modules/auth/infrastructure/persistence/userModel.js';
import {
  registerUserHandler as registerUser,
  loginUserHandler as loginUser,
} from '../../modules/auth/infrastructure/http/httpHandlers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const flushAsyncHandler = () => new Promise((resolve) => setImmediate(resolve));

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
        const next = sinon.spy();
  
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
  
        sandbox.stub(User, 'findOne').resolves(null);
        sandbox.stub(bcrypt, 'hash').resolves('hashed-password');
        sandbox.stub(User, 'create').resolves(mockUser);
        sandbox.stub(jwt, 'sign').returns('mocked_token'); // Stub JWT sign method
  
        // Call the function
        registerUser(req, res, next);
        await flushAsyncHandler();
  
        // Assertions
        expect(User.findOne.calledOnce).to.be.true;
        expect(User.create.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(next.called).to.be.false;
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
        const next = sinon.spy();
  
        sandbox.stub(User, 'findOne').rejects(new Error('Registration failed'));
        sandbox.stub(bcrypt, 'hash').resolves('hashed-password');
  
        // Call the function
        registerUser(req, res, next);
        await flushAsyncHandler();
  
        // Assertions
        expect(res.status.called).to.be.false;
        expect(res.json.called).to.be.false;
        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.instanceOf(Error);
        expect(next.firstCall.args[0].message).to.equal('Registration failed');
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
        const next = sinon.spy();
  
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
  
        sandbox.stub(User, 'findOne').resolves({ ...mockUser, password: 'hashed-password' });
        sandbox.stub(bcrypt, 'compare').resolves(true);
        sandbox.stub(jwt, 'sign').returns('mocked_token'); // Stub JWT sign method
  
        // Call the function
        loginUser(req, res, next);
        await flushAsyncHandler();
  
        // Assertions
        expect(User.findOne.calledOnce).to.be.true;
        expect(bcrypt.compare.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(next.called).to.be.false;
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
        const next = sinon.spy();
  
        sandbox.stub(User, 'findOne').resolves(null);
        sandbox.stub(bcrypt, 'compare').resolves(false);
  
        // Call the function
        loginUser(req, res, next);
        await flushAsyncHandler();
  
        // Assertions
        expect(res.status.called).to.be.false;
        expect(res.json.called).to.be.false;
        expect(next.calledOnce).to.be.true;
        expect(next.firstCall.args[0]).to.be.instanceOf(Error);
        expect(next.firstCall.args[0].message).to.equal('Email or Password are not correct');
      });
    });
  });
