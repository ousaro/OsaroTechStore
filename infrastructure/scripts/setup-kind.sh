#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-osarotechstore}"

echo "Creating kind cluster '${CLUSTER_NAME}'..."

cat <<EOF | kind create cluster --name "${CLUSTER_NAME}" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 5000
        protocol: TCP
      - containerPort: 30090
        hostPort: 9090
        protocol: TCP
      - containerPort: 30091
        hostPort: 3000
        protocol: TCP
EOF

echo "Cluster '${CLUSTER_NAME}' created."
echo "Deploy the application with:"
echo "  kubectl kustomize infrastructure/k8s/overlays/local | kubectl apply -f -"
