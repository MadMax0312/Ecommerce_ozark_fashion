/**
 * Created by karbunkul on 04.06.17.
 */

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const RaDefinition = require('../lib/ra-definition');
const RaException = require('../lib/ra-exception');
// const RaResult = require('../lib/ra-result');
// const RaError = require('../lib/ra-error');

describe('RaDefintion', () => {

  describe('Valid definition', () => {

    const valid = new RaDefinition({
      name: 'test',
      callback: {},
    });

    it('is valid & definition instance of RaDefinition', () => {
      expect(valid.valid).equal(true);
      expect(valid instanceof RaDefinition).equal(true);
    });

  });

  describe('Wrong definition', () => {

    it('is reference from array', () => {
      try {
        const wrong = new RaDefinition([]);
        expect(wrong.valid).notEqual(true);
      }catch (err) {
        expect(err instanceof RaException).equal(true);
      }
    });

    it('is reference from object', () => {
      try {
        const wrong = new RaDefinition({});
        expect(wrong.valid).notEqual(true);
      }catch (err) {
        expect(err instanceof RaException).equal(true);
      }
    });

    it('is reference not valid', () => {
      try {
        const wrong = new RaDefinition({
          name: '',
        });
        expect(wrong.valid).notEqual(true);
      }catch (err) {
        expect(err instanceof RaException).equal(true);
      }
    });

  });

});
