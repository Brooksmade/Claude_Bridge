#!/bin/bash
# Update Primitive [ Level 1 ] COLOR variables with dark theme hex values
# All curl commands run in parallel with & and wait at the end

API="http://localhost:4001/commands"
CT="Content-Type: application/json"

# === Brand Scale ===
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:14","value":"#072830"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:15","value":"#07303B"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:16","value":"#073844"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:17","value":"#064150"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:18","value":"#045063"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:19","value":"#00647D"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:20","value":"#05A2C2"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:21","value":"#00B1CC"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:22","value":"#00C2D7"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:23","value":"#E1F8FA"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:24","value":"#EBF9FB"}}' > /dev/null &

# === Gray Scale ===
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:3","value":"#171C26"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:4","value":"#31363F"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:5","value":"#4B5058"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:6","value":"#656A71"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:7","value":"#7F848A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:8","value":"#999EA3"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:9","value":"#B3B8BC"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:10","value":"#CDD2D5"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:11","value":"#E7ECEE"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:12","value":"#F0F3F7"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:13","value":"#F9FAFB"}}' > /dev/null &

# === Secondary Scale ===
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:25","value":"#3C181A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:26","value":"#481A1D"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:27","value":"#541B1F"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:28","value":"#671E22"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:29","value":"#822025"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:30","value":"#AA2429"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:31","value":"#E5484D"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:32","value":"#F2555A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:33","value":"#FF6369"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:34","value":"#FEECEE"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:35","value":"#FFF1F2"}}' > /dev/null &

# === Tertiary Scale ===
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:36","value":"#0F291E"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:37","value":"#113123"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:38","value":"#133929"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:39","value":"#164430"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:40","value":"#1B543A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:41","value":"#236E4A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:42","value":"#30A46C"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:43","value":"#3CB179"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:44","value":"#4CC38A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:45","value":"#E5FBEB"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:46","value":"#EDFCF2"}}' > /dev/null &

# === System Colors ===
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:48","value":"#030712"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:49","value":"#30A46C"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:50","value":"#F5D90A"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:51","value":"#E5484D"}}' > /dev/null &
curl -s -X POST "$API" -H "$CT" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:52","value":"#05A2C2"}}' > /dev/null &

# Wait for all background jobs to finish
wait

echo "All 49 color variable updates sent."
