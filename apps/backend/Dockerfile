# Backend Dockerfile - AWS Lambda Container Image
FROM public.ecr.aws/lambda/python:3.11

# Install uv for fast dependency management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv pip compile pyproject.toml -o requirements.txt && \
    uv pip install --system --no-cache -r requirements.txt && \
    rm requirements.txt

# Copy source code to Lambda task root with proper permissions
COPY --chmod=644 src/ ${LAMBDA_TASK_ROOT}/src/
RUN chmod -R 755 ${LAMBDA_TASK_ROOT}/src/

# Set the Lambda handler
CMD ["src.lambda_handler.handler"]
