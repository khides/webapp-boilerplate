"""AWS Lambda handler for FastAPI application.

This module provides the entry point for running the FastAPI application
on AWS Lambda using the Mangum ASGI adapter.
"""

import logging

from mangum import Mangum

from src.main import create_app

# Configure logging for Lambda environment
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Create the FastAPI application
app = create_app()

# Create Mangum handler for Lambda
# lifespan="auto" ensures FastAPI lifespan events work correctly
handler = Mangum(app, lifespan="auto")
