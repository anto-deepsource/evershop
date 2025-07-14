const fs = require('fs').promises;
const { join, normalize, resolve, sep } = require('path');
const staticMiddleware = require('serve-static');
const { CONSTANTS } = require('../helpers');

module.exports = async function publiStatic(request, response, next) {
  // Get the request path
  const { path } = request;
  try {
    if (!path.includes('.')) {
      throw new Error('No file extension');
    }
    // Normalize and sanitize the requested path to prevent path traversal
    const normalizedPath = normalize(path);
    const baseDir = join(CONSTANTS.ROOTPATH, 'public');
    const resolvedPath = resolve(baseDir, normalizedPath);
    // Ensure the resolved path is within the public directory
    if (!resolvedPath.startsWith(resolve(baseDir) + sep)) {
      throw new Error('Invalid path');
    }
    // Asynchoronously check if the path is a file and exists in the public folder
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
