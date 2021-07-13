import Ajv from 'ajv';

/**
 * Validate JSON against a schema
 * 
 * @param {Object} data 
 * @param {Object} schema 
 * @returns {Object};
 */
const jsonSchema = (data, schema) => {

    const ajv = new Ajv({
        allErrors: true
    });
    const valid = ajv.validate(schema, data);
    return valid ? false : {
        msg: ajv.errors
    };
}

export default jsonSchema;