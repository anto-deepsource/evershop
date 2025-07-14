const fs = require('fs').promises;
const { join, normalize, resolve } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');

module.exports = async function publiStatic(request, response, next) {
  // Get the request path
  const { path } = request;
  try {
    // Sanitize and resolve the requested path to prevent path traversal
    const baseDir = join(CONSTANTS.ROOTPATH, 'public');
    const normalizedPath = normalize(path);
    const resolvedPath = resolve(baseDir, normalizedPath);
    if (!resolvedPath.startsWith(baseDir)) {
      throw new Error('Invalid path');
    }
    if (!normalizedPath.includes('.')) {
      throw new Error('No file extension');
    }
    // Asynchronously check if the path is a file and exists in the public folder
    const test = await fs.stat(resolvedPath);
    if (test.isFile()) {
      // If it is a file, serve it
      staticMiddleware(baseDir)(
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
