#!/bin/bash
# Election Assistant - Deployment Script
# Built with Google Antigravity & Vertex AI
#
# Deploys backend to Cloud Run (with Secret Manager) and frontend to Firebase Hosting.

set -e

PROJECT_ID="project-c38d9dc7-c6ae-47d5-b59"
REGION="us-central1"
SERVICE_NAME="election-assistant-api"
IMAGE="us-central1-docker.pkg.dev/$PROJECT_ID/election-assistant/$SERVICE_NAME:latest"

echo "=== Election Assistant Deployment ==="
gcloud config set project $PROJECT_ID

# 1. Build Docker image
echo "--- Building backend image ---"
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID

# 2. Deploy to Cloud Run with Secret Manager references
echo "--- Deploying to Cloud Run ---"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,VERTEX_AI_LOCATION=$REGION,VERTEX_AI_MODEL=gemini-2.5-flash,GCS_BUCKET_NAME=election-assistant-data,ADMIN_EMAILS=ashfaque.rifaye94@gmail.com" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest" \
  --project $PROJECT_ID

BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID)
echo "Backend: $BACKEND_URL"

# 3. Deploy frontend
echo "--- Deploying frontend ---"
cd client && npm run build && firebase deploy --only hosting --project $PROJECT_ID && cd ..

echo "=== Deployment Complete ==="
echo "Frontend: https://$PROJECT_ID.web.app"
echo "Backend: $BACKEND_URL"
