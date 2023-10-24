/* eslint-disable no-unused-vars */
/**
 * Created by karbunkul on 22.05.17.
 */
const http = require('http');

const RaDefinition = require('./ra-definition');
const RaDatatype = require('./ra-datatype');
const RaResult = require('./ra-result');
const RaError = require('./ra-error');
const RaException = require('./ra-exception');

class Ra {

  constructor(options) {
    this.definitions = {};
    this.types = {};

    function config() {
      return {
        prefix: (options !== undefined && options.prefix) ?
          options.prefix : 'ra',
      };
    }

    this.config = config();

    // ra.version
    this.definition({
      name: 'ra.version',
      callback: () => {
        return {
          engine: `node ${process.version} (${process.arch})`,
          version: 'ra v1.0',
        };
      },
    });

    // ra.methods
    this.definition({
      name: 'ra.methods',
      callback: () => {
        return Object.keys(this.definitions);
      },
    });

    // ra.datatypes
    this.definition({
      name: 'ra.datatypes',
      callback: () => {
        return Object.keys(this.types);
      },
    });

    // types
    this.datatype({
      type: 'number',
      callback: (value) => {
        const intVal = parseInt(value);
        return (intVal) ? intVal : false;
      },
    });

    this.datatype({
      type: 'float',
      callback: (value) => {
        const floatVal = parseFloat(value);
        return (floatVal) ? floatVal : false;
      },
    });

    this.datatype({
      type: 'string',
      callback: (value) => {
        return value;
      },
    });

  }

  call(req, res, methodName) {

    const prefix = `x-${this.config.prefix.replace('x-', '')}-`;
    const types = this.types;

    function checkInstanceTypes() {
      if (!(req instanceof http.IncomingMessage)) {
        throw new RaException('req must be instance of http.IncomingMessage');
      }
      if (!(res instanceof http.ServerResponse)) {
        throw new RaException('res must be instance of http.ServerResponse');
      }
    }

    function paramValues(definition) {

      const values = {};
      const headers = req.headers;
      const params = req.query;
      const body = req.body || false;

      for (const name in definition.args) {
        const arg = definition.args[name];
        const datatype = types[arg.dataType];
        const value = headers[prefix + name] || body[name] || params[name];

        if (value !== undefined) {
          values[name] = datatype.callback(value);
        }
        else if (arg.defaultValue !== undefined) {
          values[name] = datatype.callback(arg.defaultValue);
        }
        else {
          return new RaError(403,
              `Missing required argument '${name}'`);
        }
      }

      return values;
    }

    checkInstanceTypes();

    methodName = methodName || req.params.method;
    const definition = this.definitions[methodName];

    const values = paramValues(definition);

    if (values instanceof RaError) {
      return Promise.resolve(new RaResult(values));
    }
    else {
      return new Promise((resolve, reject) => {
        Promise.all(Object.values(values)).then((resolveAll) => {
          const params = Object.assign({}, Object.keys(values), resolveAll);

          let index = 0;
          for (const key in values) {
            values[key] = resolveAll[index];
            index++;
          }

          const response = definition.callback(values);

          if (response instanceof Promise) {
            response.then((callbackResolve) => {
              resolve(new RaResult(callbackResolve));
            });
          }
          else {
            resolve(new RaResult(response));
          }
        });
      });
    }

  }

  definition(reference) {
    const definition = new RaDefinition(reference);
    if (definition.valid) {
      this.definitions[definition.name] = definition;
    }
  }

  datatype(reference) {
    const datatype = new RaDatatype(reference);
    if (datatype.valid) {
      this.types[datatype.type] = datatype;
    }
  }

  errorInstance(code, message) {
    return new RaError(code, message);
  }

}

module.exports = Ra;
