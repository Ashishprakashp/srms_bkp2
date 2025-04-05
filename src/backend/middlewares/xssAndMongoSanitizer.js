// middlewares/xssAndMongoSanitizer.js
import xss from "xss";
import { sanitize } from "express-mongo-sanitize";

/**
 * Recursively sanitize input for XSS
 */
function sanitizeXSS(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeXSS);
  } else if (typeof obj === "object" && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = sanitizeXSS(obj[key]);
    }
    return result;
  } else if (typeof obj === "string") {
    return xss(obj);
  }
  return obj;
}

/**
 * Middleware: Sanitize request from both XSS and Mongo injection
 */
export default function xssAndMongoSanitizer(req, res, next) {
  sanitize(req); // express-mongo-sanitize
  if (req.body) req.body = sanitizeXSS(req.body);
  if (req.query) req.query = sanitizeXSS(req.query);
  if (req.params) req.params = sanitizeXSS(req.params);
  next();
}
