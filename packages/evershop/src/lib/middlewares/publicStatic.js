const fs = require('fs').promises;
const { join, normalize, resolve, sep } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');

module.exports = async function publiStatic(request, response, next) {
  // Get the request path
  const { path: rawPath } = request;
  // Normalize and validate path to prevent path traversal
  const normalizedPath = normalize(rawPath);
  const basePublicPath = resolve(CONSTANTS.ROOTPATH, 'public');
  const fullPath = resolve(basePublicPath, normalizedPath);
  // If the requested path is outside the public directory, skip
  if (!fullPath.startsWith(basePublicPath + sep)) {
    return next();
  }
  try {
    if (normalizedPath.includes('..') || !normalizedPath.includes('.')) {
      throw new Error('Invalid file path');
    }
    // Asynchronously check if the path is a file and exists in the public folder
    const test = await fs.stat(fullPath);
    if (test.isFile()) {
      // If it is a file, serve it
      staticMiddleware(basePublicPath)(
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
