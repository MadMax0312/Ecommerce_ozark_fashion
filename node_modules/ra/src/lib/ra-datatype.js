/**
 * Created by karbunkul on 01.06.17.
 */

const RaException = require('./ra-exception');

class RaDatatype {

  constructor(reference) {

    this.valid = false;

    function check() {
      const requireFields = ['type', 'callback'];
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
        this.type = reference.type;
        this.callback = reference.callback;
      }
    }
    else {
      throw new RaException('Reference must be object');
    }

  }

}

module.exports = RaDatatype;
