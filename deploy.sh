#!/bin/bash
# Election Assistant - Deployment Script
# Built with Google Antigravity & Vertex AI
#
# Deploys the backend to Cloud Run and frontend to Firebase Hosting.
# Usage: ./deploy.sh

set -e

PROJECT_ID="project-c38d9dc7-c6ae-47d5-b59"
REGION="us-central1"
SERVICE_NAME="election-assistant-api"

echo "=== Election Assistant Deployment ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set the active project
gcloud config set project $PROJECT_ID

# 1. Build and deploy backend to Cloud Run
echo "--- Deploying backend to Cloud Run ---"
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --project $PROJECT_ID

gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,VERTEX_AI_LOCATION=$REGION,VERTEX_AI_MODEL=gemini-1.5-flash,GCS_BUCKET_NAME=election-assistant-data,ADMIN_EMAILS=ashfaque.rifaye94@gmail.com" \
  --project $PROJECT_ID

# Get the Cloud Run URL
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID)
echo "Backend deployed at: $BACKEND_URL"

# 2. Build and deploy frontend to Firebase Hosting
echo ""
echo "--- Deploying frontend to Firebase Hosting ---"
cd client
npm run build
firebase deploy --only hosting --project $PROJECT_ID
cd ..

echo ""
echo "=== Deployment Complete ==="
echo "Backend: $BACKEND_URL"
echo "Frontend: https://$PROJECT_ID.web.app"
