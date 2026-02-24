# Peppermint Backend Assessment: API Key Management

This project implements a secure API Key Management system as required by the Peppermint Tech assessment. It features key generation, listing, rotating, and revoking securely associated with the logged-in user.

## �� Production Deployment

**Live URL**: https://xcrmuq63iy.us-east-1.awsapprunner.com

## Features

- **Authentication**: JWT-based login and registration.
- **API Key Lifecycle**: Generate, List, Revoke, and Rotate keys.
- **Security Check**: Enforces a maximum limit of 3 active keys per user. Keys are stored as bcrypt hashes in the MongoDB database, never in plain-text.
- **Audit Logs (Bonus)**: All API calls authenticated using the `x-api-key` header automatically create traceable `AccessLog` documents within MongoDB.
- **Rate Limiting (Bonus)**: Implements `express-rate-limit` grouping strictly by the resolved `x-api-key` used by the client. Rate limit applies globally to routes utilizing `apiGuard`.
- **Migrations**: Uses `migrate-mongo` to backfill existing records with an `expiresAt` flag.
- **Testing**: Over 90% unit and integration test coverage via Jest.

---

## 🚀 Setup & Execution (Local)

**1. Install Dependencies**

```bash
npm install
```

**2. Setup Environment Variables**

Copy the development environment file:

```bash
cp env/development.env.example env/development.env
```

Edit `env/development.env` with your MongoDB connection string and JWT secret. For local development, you can use:
- MongoDB: `mongodb://localhost:27017/peppermint_test` or MongoDB Atlas
- JWT_SECRET: Generate a secure random string

**3. Run Database Migrations**

To simulate adding the `expiresAt` field to existing API keys:

```bash
npm run migrate:up
```

**4. Start the Application**

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 🧪 Testing

To run the automated test suite and view coverage statistics:

```bash
npm run test:coverage
```

Test results demonstrate `>90%` coverage across controllers and services.

---

## 📚 API Documentation (Postman Collection)

Included in the root directory is **`Peppermint_API_Key_Management.postman_collection.json`**.

**How to use it:**

1. Open Postman.
2. Click **Import** in the top left corner.
3. Drag and drop the `Peppermint_API_Key_Management.postman_collection.json` file into the window.
4. Update the base URL variable to either:
   - Local: `http://localhost:5000`
   - Production: `https://xcrmuq63iy.us-east-1.awsapprunner.com`
5. The collection contains all endpoints with pre-configured JSON bodies. A script automatically captures your JWT token on login and adds it to subsequent requests!

---

## 🌐 AWS Deployment

The application is deployed on AWS App Runner using Terraform for infrastructure as code.

**Production URL**: https://xcrmuq63iy.us-east-1.awsapprunner.com

### Prerequisites

- AWS CLI configured with credentials
- Terraform installed (v1.0+)
- Docker installed
- MongoDB Atlas with IP whitelist configured (see step 1 below)

### Deployment Steps

**1. Configure MongoDB Atlas IP Whitelist**

IMPORTANT: App Runner needs access to your MongoDB Atlas cluster.

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Save

**2. Configure Terraform Variables**

The `infrastructure/terraform.tfvars` file contains your configuration. Edit if needed.

**3. Deploy Infrastructure**

```bash
cd infrastructure
terraform init
terraform apply
```

This creates:
- ECR repository for Docker images
- IAM roles for App Runner
- App Runner service (0.25 vCPU / 0.5 GB)

**4. Deploy Application**

```bash
cd ..
./scripts/deploy.sh
```

The script will:
- Build your Docker image
- Push it to ECR
- App Runner auto-deploys the new version

**5. Get Your Production URL**

```bash
cd infrastructure
terraform output app_url
```

### Updating the App

Simply run the deploy script again:

```bash
./scripts/deploy.sh
```

### Troubleshooting

**App not starting / Connection errors:**
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0 or App Runner IPs
- View logs: `aws logs tail /aws/apprunner/peppermint-backend/<service-id>/application --profile luminalog --region us-east-1 --follow`
- Check service status: `aws apprunner describe-service --service-arn <arn> --profile luminalog --region us-east-1`

**Docker build issues:**
- Ensure mongoose is in dependencies (not devDependencies) in package.json
- Clear Docker cache: `docker system prune -a`

### Cost Estimate

With the 0.25 vCPU / 0.5 GB configuration:
- ~$5-10/month for low traffic
- AWS Free Tier: 2,000 vCPU-minutes/month

### Cleanup

To destroy all AWS resources:

```bash
cd infrastructure
terraform destroy
```

---

## 🏛️ Project Structure

- `src/controllers/ApiKeyController.ts` & `AuthController.ts`: Route handlers.
- `src/services/ApiKeyService.ts` & `AuthService.ts`: Core business logic.
- `src/validators/`: Express-validators ensuring data payloads are sound.
- `src/models/ApiKey.ts`: Mongoose Schema adhering to strict design standards.
- `migrations/`: MongoDB migration handlers for backward capability syncing.
- `src/__tests__/`: Jest integration and core unit tests.

---

## ✅ Assessment Requirements Checklist

### Core Requirements

- ✅ API Design: Generate, List, Revoke, Rotate API keys
- ✅ DTO Validation: Using express-validator
- ✅ Controller/Service Pattern: Implemented
- ✅ Authentication & Authorization: JWT-based, users manage only their keys
- ✅ Data Modelling & Migration: Added `expiresAt` field with migrate-mongo
- ✅ Edge Case Handling: Max 3 active keys per user
- ✅ Testing: >90% coverage
- ✅ AWS Deployment: Deployed on AWS App Runner

### Bonus Features

- ✅ Rate Limiting: Per API key using express-rate-limit
- ✅ Audit Logs: AccessLog model tracks all API key usage

### Submission Requirements

- ✅ API Documentation: Postman collection included
- ✅ Local Instructions: Documented above
- ✅ Deployment URL: https://xcrmuq63iy.us-east-1.awsapprunner.com
