const fs = require('fs').promises;
const { join } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');
const { getConfig } = require('../util/getConfig');

module.exports = async function themePubliStatic(request, response, next) {
  // Get the request path
  const { path } = request;
  const theme = getConfig('system.theme', null);
  if (!theme) {
    next();
  } else {
    try {
      // Validate and sanitize the request path to prevent path traversal
      const normalizedPath = normalize(path);
      if (normalizedPath.startsWith('..') || normalizedPath.includes('../')) {
        throw new Error('Invalid path');
      }
      if (!normalizedPath.includes('.')) {
        throw new Error('No file extension');
      }
      // Asynchoronously check if the path is a file and exists in the public folder
      const filePath = join(CONSTANTS.THEMEPATH, theme, 'public', normalizedPath);
      const test = await fs.stat(filePath);
      if (test.isFile()) {
        // If it is a file, serve it
        staticMiddleware(join(CONSTANTS.THEMEPATH, theme, 'public'))(
          request,
          response,
          next
        );
      }
    } catch (e) {
      // If the path is not a file or does not exist in the public folder, call next
      next();
    }
  }
};
