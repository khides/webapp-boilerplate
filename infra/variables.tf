variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-northeast-1"
}

# Domain configuration (optional)
variable "domain_name" {
  description = "Custom domain name for the application (e.g., app.example.com)"
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route 53 hosted zone ID for the domain"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for custom domain (must be in us-east-1)"
  type        = string
  default     = ""
}

# Lambda configuration
variable "lambda_memory_size" {
  description = "Memory size for Lambda function (MB)"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Timeout for Lambda function (seconds)"
  type        = number
  default     = 30
}

# CORS configuration
variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = ["*"]
}

# Feature flags
variable "enable_custom_domain" {
  description = "Enable custom domain configuration"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable WAF for CloudFront"
  type        = bool
  default     = false
}

# RDS configuration
variable "enable_rds" {
  description = "Enable RDS MySQL database"
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Initial storage allocation in GB"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "Maximum storage allocation for autoscaling in GB"
  type        = number
  default     = 100
}

variable "rds_engine_version" {
  description = "MySQL engine version"
  type        = string
  default     = "8.0"
}

variable "rds_database_name" {
  description = "Database name"
  type        = string
  default     = "webapp"
}

variable "rds_master_username" {
  description = "Master username for RDS"
  type        = string
  default     = "admin"
}
