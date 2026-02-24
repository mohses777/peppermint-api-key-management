variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "luminalog"
}

variable "mongodb_uri" {
  description = "MongoDB connection URI (use MongoDB Atlas)"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for token signing"
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "JWT expiration time in seconds"
  type        = string
  default     = "3600"
}

variable "max_active_api_keys" {
  description = "Maximum number of active API keys per user"
  type        = string
  default     = "3"
}
