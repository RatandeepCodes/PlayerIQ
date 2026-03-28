export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error?.code === 11000) {
    return res.status(409).json({
      message: "Resource already exists",
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      message: error.message || "Validation failed",
    });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};
