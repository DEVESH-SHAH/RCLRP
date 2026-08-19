import { useState } from 'react';

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field was touched
    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValue,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
};

// Validation rules
export const validationRules = {
  email: [
    (value) => !value ? 'Email is required' : '',
    (value) => value && !/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : ''
  ],
  phone: [
    (value) => !value ? 'Phone is required' : '',
    (value) => value && !/^\+?[\d\s\-\(\)]+$/.test(value) ? 'Phone number is invalid' : ''
  ],
  name: [
    (value) => !value ? 'Name is required' : '',
    (value) => value && value.length < 2 ? 'Name must be at least 2 characters' : ''
  ],
  required: [
    (value) => !value ? 'This field is required' : ''
  ],
  password: [
    (value) => !value ? 'Password is required' : '',
    (value) => value && value.length < 6 ? 'Password must be at least 6 characters' : ''
  ],
  number: [
    (value) => !value ? 'This field is required' : '',
    (value) => value && isNaN(value) ? 'Must be a valid number' : ''
  ],
  positiveNumber: [
    (value) => !value ? 'This field is required' : '',
    (value) => value && (isNaN(value) || parseFloat(value) <= 0) ? 'Must be a positive number' : ''
  ],
  dateTime: [
    (value) => !value ? 'Date and time is required' : '',
    (value) => value && new Date(value).toString() === 'Invalid Date' ? 'Invalid date format' : ''
  ]
};

export default useFormValidation;
