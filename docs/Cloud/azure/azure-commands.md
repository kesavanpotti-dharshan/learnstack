---
title: Azure Cli Commands
sidebar_position: 1
---

# Check if Azure CLI is installed

az --version

# If not installed on Mac

brew install azure-cli

# Login to Azure

az login

# Check your subscription

az account show

az group create \
 --name $RESOURCE_GROUP \
 --location $LOCATION

az acr create \
 --resource-group $RESOURCE_GROUP \
 --name $REGISTRY_NAME \
 --sku Basic \
 --admin-enabled true
