# High-Level Architecture

## Core Flow

Browser  
↓  
Next.js Frontend  
↓  
Cognito  
↓  
API Gateway  
↓  
Lambda  
↓  
S3 / DynamoDB / OpenSearch  
↓  
Bedrock

## System Zones

### 1. Frontend
- Next.js
- user interface
- routing
- layouts
- navigation
- forms

### 2. Application and Security
- Cognito
- API Gateway
- Lambda

### 3. Data and AI
- S3
- DynamoDB
- OpenSearch Serverless
- Bedrock

## Core System Layers

### Authentication Layer
Answers: who is the user?

### Application Layer
Answers: what action does the user want to perform?

### AI Layer
Answers: what grounded answer should be generated from retrieved context?