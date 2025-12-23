# ========================================
# BKN Visitor Management System - Backend
# Last Updated: December 2025
# ========================================

# Use Alpine-based Python image for smaller size and better compatibility
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies using Alpine's apk
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    curl \
    libffi-dev

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install dependencies (no cache dir for smaller image)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p uploads task_letters logs backups

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
