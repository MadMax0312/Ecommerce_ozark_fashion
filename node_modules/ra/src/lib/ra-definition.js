/**
 * Created by karbunkul on 21.05.17.
 */

const RaException = require('./ra-exception');

class RaDefinition {

  constructor(reference) {

    this.valid = false;

    function check() {
      const requireFields = ['name', 'callback'];
      for (const index in requireFields) {
        const field = requireFields[index];
        if (!(field in reference)) {
          throw new RaException(`Required field "${field}" is missing`);
        }
      }
      return true;
    }

    if (reference instanceof Object && !Array.isArray(reference)) {
      if (check(reference)) {
        this.valid = true;
        this.name = reference.name;
        this.args = reference.args || {};
        this.method = reference.method || 'GET';
        this.callback = reference.callback;
      }
    }
    else {
      throw new RaException('Reference must be object');
    }
  }

}

module.exports = RaDefinition;
