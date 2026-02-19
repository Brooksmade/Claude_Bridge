#!/bin/bash

# Update primitive color variables in Figma design system
# Brand Scale (11 colors)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:14","values":{"Value":"#072830"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:15","values":{"Value":"#07303B"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:16","values":{"Value":"#073844"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:17","values":{"Value":"#064150"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:18","values":{"Value":"#045063"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:19","values":{"Value":"#00647D"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:20","values":{"Value":"#05A2C2"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:21","values":{"Value":"#00B1CC"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:22","values":{"Value":"#00C2D7"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:23","values":{"Value":"#E1F8FA"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:24","values":{"Value":"#EBF9FB"}}}' > /dev/null
sleep 0.1

# Gray Scale (11 colors)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:3","values":{"Value":"#171C26"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:4","values":{"Value":"#31363F"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:5","values":{"Value":"#4B5058"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:6","values":{"Value":"#656A71"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:7","values":{"Value":"#7F848A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:8","values":{"Value":"#999EA3"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:9","values":{"Value":"#B3B8BC"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:10","values":{"Value":"#CDD2D5"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:11","values":{"Value":"#E7ECEE"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:12","values":{"Value":"#F0F3F7"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:13","values":{"Value":"#F9FAFB"}}}' > /dev/null
sleep 0.1

# Secondary/Error Scale (11 colors)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:25","values":{"Value":"#3C181A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:26","values":{"Value":"#481A1D"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:27","values":{"Value":"#541B1F"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:28","values":{"Value":"#671E22"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:29","values":{"Value":"#822025"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:30","values":{"Value":"#AA2429"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:31","values":{"Value":"#E5484D"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:32","values":{"Value":"#F2555A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:33","values":{"Value":"#FF6369"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:34","values":{"Value":"#FEECEE"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:35","values":{"Value":"#FFF1F2"}}}' > /dev/null
sleep 0.1

# Tertiary/Success Scale (11 colors)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:36","values":{"Value":"#0F291E"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:37","values":{"Value":"#113123"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:38","values":{"Value":"#133929"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:39","values":{"Value":"#164430"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:40","values":{"Value":"#1B543A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:41","values":{"Value":"#236E4A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:42","values":{"Value":"#30A46C"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:43","values":{"Value":"#3CB179"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:44","values":{"Value":"#4CC38A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:45","values":{"Value":"#E5FBEB"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:46","values":{"Value":"#EDFCF2"}}}' > /dev/null
sleep 0.1

# System Colors (5 colors - excluding White which we keep as-is)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:47","values":{"Value":"#030712"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:49","values":{"Value":"#30A46C"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:50","values":{"Value":"#F5D90A"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:51","values":{"Value":"#E5484D"}}}' > /dev/null
sleep 0.1

curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:52","values":{"Value":"#05A2C2"}}}' > /dev/null
sleep 0.1

echo "All 49 color updates sent"
