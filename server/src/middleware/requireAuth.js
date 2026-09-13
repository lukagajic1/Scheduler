function requireAuth(request, response, next) {
  if (!request.session.user) {
    return response.status(401).json({
      message: "You must be logged in.",
    });
  }

  next();
}

module.exports = requireAuth;