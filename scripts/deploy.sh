#!/bin/bash
set -e

echo "🚀 Deploying Peppermint Backend to AWS App Runner"

# AWS Profile
AWS_PROFILE="luminalog"

# Get ECR URL from Terraform
cd infrastructure
ECR_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1")

if [ -z "$ECR_URL" ]; then
  echo "❌ Error: Could not get ECR URL. Have you run 'terraform apply'?"
  exit 1
fi

echo "📦 ECR Repository: $ECR_URL"
echo "🌍 Region: $AWS_REGION"
echo "👤 Profile: $AWS_PROFILE"

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin $ECR_URL

# Build Docker image
cd ..
echo "🏗️  Building Docker image..."
docker build -t peppermint-backend .

# Tag and push
echo "📤 Pushing to ECR..."
docker tag peppermint-backend:latest $ECR_URL:latest
docker push $ECR_URL:latest

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at:"
cd infrastructure
terraform output app_url
