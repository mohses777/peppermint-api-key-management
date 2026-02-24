# ECR Repository for Docker images
resource "aws_ecr_repository" "app" {
  name         = "peppermint-backend"
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# IAM Role for App Runner to access ECR
resource "aws_iam_role" "apprunner_ecr_role" {
  name = "peppermint-apprunner-ecr-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "build.apprunner.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_policy" {
  role       = aws_iam_role.apprunner_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# App Runner Service
resource "aws_apprunner_service" "app" {
  service_name = "peppermint-backend"

  source_configuration {
    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NODE_ENV           = "production"
          DB_URI             = var.mongodb_uri
          JWT_SECRET         = var.jwt_secret
          JWT_EXPIRES_IN     = var.jwt_expires_in
          MAX_ACTIVE_API_KEYS = var.max_active_api_keys
        }
      }
    }

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_role.arn
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    cpu    = "0.25 vCPU"
    memory = "0.5 GB"
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Name        = "peppermint-backend"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
