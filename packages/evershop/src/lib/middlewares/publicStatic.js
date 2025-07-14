const fs = require('fs').promises;
const { join, normalize, isAbsolute } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');

module.exports = async function publiStatic(request, response, next) {
  // Get the request path
  const { path } = request;
  try {
    // Normalize and validate the requested path to prevent path traversal
    let requestedPath = path;
    if (requestedPath.startsWith('/') || requestedPath.startsWith('\\')) {
      requestedPath = requestedPath.slice(1);
    }
    const normalizedPath = normalize(requestedPath);
    if (normalizedPath.includes('..') || isAbsolute(normalizedPath)) {
      throw new Error('Invalid path');
    }
    if (!normalizedPath.includes('.')) {
      throw new Error('No file extension');
    }
    // Asynchoronously check if the path is a file and exists in the public folder
    const test = await fs.stat(join(CONSTANTS.ROOTPATH, 'public', normalizedPath));
    if (test.isFile()) {
      // If it is a file, serve it
      staticMiddleware(join(CONSTANTS.ROOTPATH, 'public'))(
        request,
        response,
        next
      );
    }
  } catch (e) {
    // If the path is not a file or does not exist in the public folder, call next
    next();
  }
};
