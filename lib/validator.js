'use strict';

var debug = require('debug')('domain:validator'),
  _ = require('lodash'),
  ValidationError = require('./errors/validationError'),
  tv4Formats = require('tv4-formats')
  ;

/**
 * Returns a validator function.
 * @param {Object} tv4    The tv4 object.
 * @param {Object} schema The schema object.
 * @returns {Function}
 */
function getValidator (tv4, schema) {
  if (!tv4 || !_.isFunction(tv4.validateMultiple)) {
    var err = new Error('Please pass a valid tv4!');
    debug(err);
    throw err;
  }

  if (!schema || !_.isObject(schema)) {
    var err = new Error('Please pass a valid schema!');
    debug(err);
    throw err;
  }
  
  // augment tv4 with new formats
  tv4.addFormat(tv4Formats);
  
  return function (data) {
    var validation = tv4.validateMultiple(data, schema);

    if (validation.missing.length > 0) {
      var missingString = validation.missing[0];
      
      for (var m = 1, lenM = validation.missing.length; m < lenM; m++) {
        missingString += ', ' + validation.missing[m];
      }
      
      var err = new Error('Validation schema(s) "' + missingString + '" missing!');
      debug(err);
      return err;
    }

    if (!validation.valid) {
      var firstError = validation.errors[0];
      return new ValidationError(firstError.dataPath + ' => ' + firstError.message, validation.errors);      
    }
    
    return null;
  };
}

module.exports = getValidator;
