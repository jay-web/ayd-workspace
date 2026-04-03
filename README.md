# AYD Workspace

A production-style AI workspace SaaS project.

## Goal
Build a commercial-grade application where users can:

- sign up and log in
- create workspaces
- upload PDFs
- ask questions from their documents
- get AI-generated answers grounded in retrieved context

## Planned Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Auth
- Amazon Cognito
- Authorization Code Flow with PKCE
- No Amplify

### Backend
- API Gateway
- AWS Lambda
- AWS SAM

### Storage
- Amazon S3
- RDS(Postgres)
- OpenSearch Serverless

### AI / RAG
- Custom RAG pipeline
- Amazon Bedrock

## Current Progress
- Authenication layer implemented to signIn/signOut

## Learning Approach
This project is being built step by step with deep focus on:
- architecture
- production thinking
- interview readiness
- practical AWS and Next.js understanding
