/**
 * Simple S3 link validation utility
 */

/**
 * Checks if an S3 link is valid by making a GET request
 * @param {string} url - The S3 presigned URL to validate
 * @returns {Promise<boolean>} - True if link is valid, false if expired/invalid
 */
export const validateS3Link = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      headers: { 'Range': 'bytes=0-1023' }
    });
    
    clearTimeout(timeoutId);
    
    // If we get a 200 or 206, the link is valid
    if (response.ok || response.status === 206) {
      return true;
    }
    
    // If we get a 403 or 401, the link is expired/invalid
    if (response.status === 403 || response.status === 401) {
      return false;
    }
    
    // For other status codes, assume valid
    return true;
    
  } catch (error) {
    console.error('Error validating S3 link:', error);
    // For errors (timeout, CORS, etc.), assume valid
    return true;
  }
};

/**
 * Checks if an error is related to S3 link expiration
 * @param {Error} error - The error object to check
 * @returns {boolean} - True if error indicates expired/invalid S3 link
 */
export const isS3LinkExpiredError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  const errorStatus = error.status || error.statusCode || error.response?.status;
  
  // Check status codes
  if (errorStatus === 403 || errorStatus === 401) {
    return true;
  }
  
  // Check error message patterns
  const expirationPatterns = [/403/i, /forbidden/i, /access denied/i, /expired/i, /invalid/i];
  return expirationPatterns.some(pattern => pattern.test(errorMessage));
}; 