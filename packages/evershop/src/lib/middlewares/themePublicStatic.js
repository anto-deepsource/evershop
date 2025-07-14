const fs = require('fs').promises;
const { join, normalize } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');
const { getConfig } = require('../util/getConfig');

module.exports = async function themePubliStatic(request, response, next) {
  // Get the request path
  const { path } = request;
  const normalizedReqPath = normalize(path);
  if (normalizedReqPath.includes('..') || normalizedReqPath.startsWith('/')) {
    // Invalid path, possible path traversal
    next();
    return;
  }
  const theme = getConfig('system.theme', null);
  if (!theme) {
    next();
  } else {
    try {
      if (!normalizedReqPath.includes('.')) {
        throw new Error('No file extension');
      }
      // Asynchronously check if the path is a file and exists in the public folder
      const filePath = join(CONSTANTS.THEMEPATH, theme, 'public', normalizedReqPath);
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
