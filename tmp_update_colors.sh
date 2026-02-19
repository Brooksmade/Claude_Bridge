#!/bin/bash
# Update all primitive colors to match globals.css exact values
URL="http://localhost:4001/commands"
H="Content-Type: application/json"

# Brand Scale (CSS --brand-*)
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-50","value":"#072830"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-100","value":"#07303B"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-200","value":"#073844"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-300","value":"#064150"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-400","value":"#045063"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-500","value":"#00647D"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-600","value":"#05A2C2"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-700","value":"#00B1CC"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-800","value":"#00C2D7"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-900","value":"#E1F8FA"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Brand Scale/Brand-950","value":"#EBF9FB"}}' &

# Gray/Neutral Scale (CSS --neutral-*)
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-50","value":"#171C26"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-100","value":"#31363F"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-200","value":"#4B5058"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-300","value":"#656A71"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-400","value":"#7F848A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-500","value":"#999EA3"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-600","value":"#B3B8BC"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-700","value":"#CDD2D5"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-800","value":"#E7ECEE"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-900","value":"#F0F3F7"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Gray Scale/Gray-950","value":"#F9FAFB"}}' &

# Secondary/Error Scale (CSS --error-*)
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-50","value":"#3C181A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-100","value":"#481A1D"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-200","value":"#541B1F"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-300","value":"#671E22"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-400","value":"#822025"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-500","value":"#AA2429"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-600","value":"#E5484D"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-700","value":"#F2555A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-800","value":"#FF6369"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-900","value":"#FEECEE"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Secondary Scale/Secondary-950","value":"#FFF1F2"}}' &

# Tertiary/Success Scale (CSS --success-*)
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-50","value":"#0F291E"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-100","value":"#113123"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-200","value":"#133929"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-300","value":"#164430"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-400","value":"#1B543A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-500","value":"#236E4A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-600","value":"#30A46C"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-700","value":"#3CB179"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-800","value":"#4CC38A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-900","value":"#E5FBEB"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/Tertiary Scale/Tertiary-950","value":"#EDFCF2"}}' &

# System colors
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/System/Black","value":"#030712"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/System/Success","value":"#30A46C"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/System/Warning","value":"#F5D90A"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/System/Error","value":"#E5484D"}}' &
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"name":"Color/System/Info","value":"#05A2C2"}}' &

wait
echo "All color update commands sent"
