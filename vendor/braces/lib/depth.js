'use strict';

// Portfolio security patch: bound both parser nesting and supplied AST walkers.
// This hard limit cannot be raised through caller-controlled options.
exports.assertDepth = depth => {
  if (depth > 128) {
    throw new SyntaxError('Brace nesting exceeds the safe limit (128)');
  }
};
