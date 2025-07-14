const fs = require('fs').promises;
const { join, normalize } = require('path');
const staticMiddleware = require('serve-static');

module.exports = async function themePubliStatic(request, response, next) {
  // Get the request path
  const rawPath = request.path;
  const theme = getConfig('system.theme', null);
  if (!theme) {
    next();
  } else {
    try {
      // Validate and sanitize the path to prevent path traversal
      const trimmedPath = rawPath.replace(/^[/\\]+/, '');
      const normalizedPath = normalize(trimmedPath);
      if (normalizedPath.includes('..')) {
        throw new Error('Invalid path');
      }
      const safePath = normalizedPath;

      if (!safePath.includes('.')) {
        throw new Error('No file extension');
      }
      // Asynchoronously check if the path is a file and exists in the public folder
      const test = await fs.stat(
        join(CONSTANTS.THEMEPATH, theme, 'public', safePath)
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
