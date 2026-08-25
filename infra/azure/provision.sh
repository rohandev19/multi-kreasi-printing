#!/bin/bash
# Script to provision Azure Virtual Machine for Multi Kreasi Printing
# Make sure you are logged in to Azure CLI (`az login`) before running this script.

set -e

# Configuration Variables
RESOURCE_GROUP="rg-mkprinting-prod"
LOCATION="southeastasia" # Singapore (closest to Indonesia)
VM_NAME="vm-mkprinting-prod"
IMAGE="Ubuntu2204"
SIZE="Standard_B2s" # 2 vCPUs, 4GB RAM (Minimum recommended for PM2 Cluster + DB)
ADMIN_USERNAME="azureuser"
# You can change the ssh-key-value path if you already have an existing key.
# Alternatively, use --generate-ssh-keys to auto-generate one.

echo "🚀 Starting Azure Provisioning for Multi Kreasi Printing..."

# 1. Create Resource Group
echo "📦 Creating Resource Group: $RESOURCE_GROUP in $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# 2. Create Virtual Machine (with cloud-init)
echo "🖥️  Creating Virtual Machine: $VM_NAME (Size: $SIZE)..."
echo "⏳ This will take a few minutes..."
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --image $IMAGE \
  --size $SIZE \
  --admin-username $ADMIN_USERNAME \
  --generate-ssh-keys \
  --custom-data ./cloud-init.yaml \
  --public-ip-sku Standard \
  --output json > vm-output.json

# Extract Public IP from the output
PUBLIC_IP=$(jq -r '.publicIpAddress' vm-output.json)

echo "✅ VM Created Successfully!"
echo "🌐 Public IP: $PUBLIC_IP"

# 3. Open Ports in Network Security Group (NSG)
echo "🔐 Configuring Firewall (NSG) rules for HTTP and HTTPS..."
NSG_NAME="${VM_NAME}NSG"

az network nsg rule create \
  --resource-group $RESOURCE_GROUP \
  --nsg-name $NSG_NAME \
  --name Allow-HTTP \
  --priority 1001 \
  --destination-port-ranges 80 \
  --protocol Tcp \
  --access Allow \
  --output none

az network nsg rule create \
  --resource-group $RESOURCE_GROUP \
  --nsg-name $NSG_NAME \
  --name Allow-HTTPS \
  --priority 1002 \
  --destination-port-ranges 443 \
  --protocol Tcp \
  --access Allow \
  --output none

echo "🎉 Provisioning Complete!"
echo "========================================="
echo "SSH Command: ssh $ADMIN_USERNAME@$PUBLIC_IP"
echo "Note: The cloud-init script will take another ~5 minutes to install Node.js, Nginx, PostgreSQL, and Redis in the background."
echo "You can view the cloud-init progress by logging in via SSH and running: tail -f /var/log/cloud-init-output.log"
echo "========================================="
