/**
 * Helper functions to handle API responses consistently
 * Handles both paginated (results) and non-paginated responses
 */

export const getResponseData = (response) => {
  // Handle paginated responses (Django REST Framework pagination)
  if (response.data && response.data.results !== undefined) {
    return response.data.results;
  }
  // Handle non-paginated responses
  return response.data || [];
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error
    const data = error.response.data;
    if (data.error) return data.error;
    if (data.message) return data.message;
    if (data.detail) return data.detail;
    if (typeof data === 'string') return data;
    if (data.non_field_errors) return data.non_field_errors.join(', ');
    
    // Handle field-specific errors
    const fieldErrors = Object.keys(data)
      .map(key => `${key}: ${Array.isArray(data[key]) ? data[key].join(', ') : data[key]}`)
      .join('; ');
    if (fieldErrors) return fieldErrors;
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check if backend is running.';
  }
  return defaultMessage;
};

