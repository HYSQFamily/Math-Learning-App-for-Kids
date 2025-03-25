#!/bin/bash
set -e

echo "Building frontend..."
cd "$(dirname "$0")"
npm run build

echo "Deploying frontend to Fly.io..."
export FLYCTL_AUTH_TOKEN="FlyV1 fm2_lJPECAAAAAAACCh9xBD1b6i1/cHRxXXbJu3gacEewrVodHRwczovL2FwaS5mbHkuaW8vdjGUAJLOAA595x8Lk7lodHRwczovL2FwaS5mbHkuaW8vYWFhL3YxxDyh0RCjhewz36iBmWGo5160Nya+tJMqRqU9Ipmhpx8Epb0Ymmd68YuUIg4xLduzCVwBbR3rZ+xPQL49dLDETuph9tDod7GHCBk/RqfeL+8sE1JZgb/Q2Ke9qHfoDyviZsxCL/u0d+XS4U/J0Qgmjfp8x9tagSmza+Ee/BN2Zs36xvl1SG/aml0MvI7Tg8Qga+GDcMg/6rY/+LwG8wBeWKpvU8RQkPwTzpgsfPYAAu4=,fm2_lJPETuph9tDod7GHCBk/RqfeL+8sE1JZgb/Q2Ke9qHfoDyviZsxCL/u0d+XS4U/J0Qgmjfp8x9tagSmza+Ee/BN2Zs36xvl1SG/aml0MvI7Tg8QQMcJpl0cPt+SHPC/x6AdB+sO5aHR0cHM6Ly9hcGkuZmx5LmlvL2FhYS92MZgEks5n2ubvzwAAAAEj0wUNF84ADfh0CpHOAA34dAzEEGy0+6K42T2QakFhPn3myF3EIDOHXVSbO8UyUQ8ALf3TTZJiMnpg2MveUoam1/K12+4R"
flyctl deploy

echo "Frontend deployment complete!"
