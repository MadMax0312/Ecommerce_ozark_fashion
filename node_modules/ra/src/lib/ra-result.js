/**
 * Created by karbunkul on 21.05.17.
 */

const RaError = require('./ra-error');

class RaResult {

  constructor(response) {

    console.log(response);

    if (response instanceof RaError) {
      return {
        data: {
          status: 'fail',
          code: response.code,
          message: response.message,
        },
        code: response.code,
      };
    }
    else{
      return {
        data: {
          status: 'ok',
          response: response,
        },
        code: 200,
      };
    }
  }

}

module.exports = RaResult;
