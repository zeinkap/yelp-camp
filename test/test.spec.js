// with chai you can do assertion with expect and should 
const   assert      = require('assert'),
        expect      = require('chai').expect,
        should      = require('chai').should(),
        operations  = require('./operations.spec.js')

beforeEach('Navigate to site', () => {
    console.log("beforeEach");
})

describe('Basic Mocha String Test', () => {
    it('should return number of characters in a string', function () {
        assert.equal("Hello".length, 5);
    });

    it('should return first character of the string', function () {
        assert.equal("Hello".charAt(0), 'H');
        //throw {myError:'throwing error to fail test'}
    });

    // its better to skip test rather than to comment out
    it.skip('should return false if invalid user id', function(){   
        let isValid = loginController.isValidUserId('abc1234')
        //assert.equal(isValid, false);
        isValid.should.equal(false);
    });

    it('correctly calculates sum of two numbers', () => {
        assert.equal(operations.add(2, 4), 6)
    });

});

afterEach('Close down', () => {
    console.log("afterEach");
})

// use it.only to run a specific test