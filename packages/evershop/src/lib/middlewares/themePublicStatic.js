const fs = require('fs').promises;
const { join, normalize } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');
const { getConfig } = require('../util/getConfig');

module.exports = async function themePubliStatic(request, response, next) {
  // Get the request path
  const { path } = request;
  const normalizedPath = normalize(path);

  // Reject paths that attempt traversal or are absolute
  if (normalizedPath.startsWith('..') || normalizedPath.startsWith('/')) {
    return next();
  }

  const theme = getConfig('system.theme', null);
  if (!theme) {
    next();
  } else {
    try {
      if (!normalizedPath.includes('.')) {
        throw new Error('No file extension');
      }
      // Asynchoronously check if the path is a file and exists in the public folder
      const test = await fs.stat(
        join(CONSTANTS.THEMEPATH, theme, 'public', normalizedPath)
      );
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
