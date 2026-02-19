#!/bin/bash
# Full Design System Binding Script
# Part 1: Set 49 Primitive color values
# Part 2: Bind 13 Semantic variables → Primitives (Light + Dark modes)
# Part 3: Bind 13 Token variables → Semantic (Light Mode + Dark Mode)
# Part 4: Bind 23 Theme variables → Tokens (Light + Dark modes)

URL="http://localhost:4001/commands"
H="Content-Type: application/json"

echo "============================================"
echo "  FULL DESIGN SYSTEM BINDING SCRIPT"
echo "============================================"
echo ""

# ============================================
# PART 1: Set Primitive Values (mode = "Value")
# ============================================
echo ">>> PART 1: Setting 49 Primitive color values..."
echo ""

# --- Brand Scale (11 colors) ---
echo "  Setting Brand scale (11 colors)..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:14","values":{"Value":"#072830"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:15","values":{"Value":"#07303B"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:16","values":{"Value":"#073844"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:17","values":{"Value":"#064150"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:18","values":{"Value":"#045063"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:19","values":{"Value":"#00647D"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:20","values":{"Value":"#05A2C2"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:21","values":{"Value":"#00B1CC"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:22","values":{"Value":"#00C2D7"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:23","values":{"Value":"#E1F8FA"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:24","values":{"Value":"#EBF9FB"}}}' > /dev/null 2>&1
sleep 0.15
echo "  Brand scale done."

# --- Gray Scale (11 colors) ---
echo "  Setting Gray scale (11 colors)..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:3","values":{"Value":"#171C26"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:4","values":{"Value":"#31363F"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:5","values":{"Value":"#4B5058"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:6","values":{"Value":"#656A71"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:7","values":{"Value":"#7F848A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:8","values":{"Value":"#999EA3"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:9","values":{"Value":"#B3B8BC"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:10","values":{"Value":"#CDD2D5"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:11","values":{"Value":"#E7ECEE"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:12","values":{"Value":"#F0F3F7"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:13","values":{"Value":"#F9FAFB"}}}' > /dev/null 2>&1
sleep 0.15
echo "  Gray scale done."

# --- Secondary Scale (11 colors) ---
echo "  Setting Secondary/Error scale (11 colors)..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:25","values":{"Value":"#3C181A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:26","values":{"Value":"#481A1D"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:27","values":{"Value":"#541B1F"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:28","values":{"Value":"#671E22"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:29","values":{"Value":"#822025"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:30","values":{"Value":"#AA2429"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:31","values":{"Value":"#E5484D"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:32","values":{"Value":"#F2555A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:33","values":{"Value":"#FF6369"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:34","values":{"Value":"#FEECEE"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:35","values":{"Value":"#FFF1F2"}}}' > /dev/null 2>&1
sleep 0.15
echo "  Secondary/Error scale done."

# --- Tertiary Scale (11 colors) ---
echo "  Setting Tertiary/Success scale (11 colors)..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:36","values":{"Value":"#0F291E"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:37","values":{"Value":"#113123"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:38","values":{"Value":"#133929"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:39","values":{"Value":"#164430"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:40","values":{"Value":"#1B543A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:41","values":{"Value":"#236E4A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:42","values":{"Value":"#30A46C"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:43","values":{"Value":"#3CB179"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:44","values":{"Value":"#4CC38A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:45","values":{"Value":"#E5FBEB"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:46","values":{"Value":"#EDFCF2"}}}' > /dev/null 2>&1
sleep 0.15
echo "  Tertiary/Success scale done."

# --- System Colors (6 colors) ---
echo "  Setting System colors (6 colors)..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:47","values":{"Value":"#FFFFFF"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:48","values":{"Value":"#030712"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:49","values":{"Value":"#30A46C"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:50","values":{"Value":"#F5D90A"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:51","values":{"Value":"#E5484D"}}}' > /dev/null 2>&1
sleep 0.15
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:20:52","values":{"Value":"#05A2C2"}}}' > /dev/null 2>&1
sleep 0.15
echo "  System colors done."

echo ""
echo ">>> PART 1 COMPLETE: 49 Primitive values set."
echo ""

# ============================================
# PART 2: Bind Semantic → Primitive (Light + Dark modes)
# ============================================
echo ">>> PART 2: Binding 13 Semantic variables to Primitives..."
echo ""

# Brand/Primary (VariableID:21:54)
# Dark → Brand-600 (VariableID:20:20), Light → Brand-300 (VariableID:20:17)
echo "  Binding Brand/Primary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:54","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:20"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:17"}}}}' > /dev/null 2>&1
sleep 0.15

# Brand/Primary-Light (VariableID:21:55)
# Dark → Brand-800 (VariableID:20:22), Light → Brand-200 (VariableID:20:16)
echo "  Binding Brand/Primary-Light..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:55","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:22"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:16"}}}}' > /dev/null 2>&1
sleep 0.15

# Brand/Primary-Dark (VariableID:21:56)
# Dark → Brand-400 (VariableID:20:18), Light → Brand-500 (VariableID:20:19)
echo "  Binding Brand/Primary-Dark..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:56","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:18"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:19"}}}}' > /dev/null 2>&1
sleep 0.15

# Secondary/Secondary (VariableID:21:57)
# Dark → Secondary-600 (VariableID:20:31), Light → Secondary-600 (VariableID:20:31)
echo "  Binding Secondary/Secondary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:57","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:31"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:31"}}}}' > /dev/null 2>&1
sleep 0.15

# Secondary/Secondary-Light (VariableID:21:58)
# Dark → Secondary-800 (VariableID:20:33), Light → Secondary-200 (VariableID:20:27)
echo "  Binding Secondary/Secondary-Light..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:58","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:33"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:27"}}}}' > /dev/null 2>&1
sleep 0.15

# Secondary/Secondary-Dark (VariableID:21:59)
# Dark → Secondary-400 (VariableID:20:29), Light → Secondary-500 (VariableID:20:30)
echo "  Binding Secondary/Secondary-Dark..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:59","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:29"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:30"}}}}' > /dev/null 2>&1
sleep 0.15

# Tertiary/Tertiary (VariableID:21:60)
# Dark → Tertiary-600 (VariableID:20:42), Light → Tertiary-600 (VariableID:20:42)
echo "  Binding Tertiary/Tertiary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:60","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:42"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:42"}}}}' > /dev/null 2>&1
sleep 0.15

# Tertiary/Tertiary-Light (VariableID:21:61)
# Dark → Tertiary-800 (VariableID:20:44), Light → Tertiary-200 (VariableID:20:38)
echo "  Binding Tertiary/Tertiary-Light..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:61","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:44"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:38"}}}}' > /dev/null 2>&1
sleep 0.15

# Tertiary/Tertiary-Dark (VariableID:21:62)
# Dark → Tertiary-400 (VariableID:20:40), Light → Tertiary-500 (VariableID:20:41)
echo "  Binding Tertiary/Tertiary-Dark..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:62","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:40"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:41"}}}}' > /dev/null 2>&1
sleep 0.15

# System/Success (VariableID:21:63)
# Dark → Success (VariableID:20:49), Light → Success (VariableID:20:49)
echo "  Binding System/Success..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:63","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:49"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:49"}}}}' > /dev/null 2>&1
sleep 0.15

# System/Warning (VariableID:21:64)
# Dark → Warning (VariableID:20:50), Light → Warning (VariableID:20:50)
echo "  Binding System/Warning..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:64","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:50"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:50"}}}}' > /dev/null 2>&1
sleep 0.15

# System/Error (VariableID:21:65)
# Dark → Error (VariableID:20:51), Light → Error (VariableID:20:51)
echo "  Binding System/Error..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:65","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:51"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:51"}}}}' > /dev/null 2>&1
sleep 0.15

# System/Info (VariableID:21:66)
# Dark → Info (VariableID:20:52), Light → Info (VariableID:20:52)
echo "  Binding System/Info..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:66","values":{"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:20:52"},"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:20:52"}}}}' > /dev/null 2>&1
sleep 0.15

echo ""
echo ">>> PART 2 COMPLETE: 13 Semantic variables bound to Primitives (Light + Dark)."
echo ""

# ============================================
# PART 3: Bind Tokens → Semantic (Light Mode + Dark Mode)
# ============================================
echo ">>> PART 3: Binding 13 Token variables to Semantic..."
echo ""

# Surface/Background/Primary (VariableID:21:68) → Brand/Primary (VariableID:21:54)
echo "  Binding Surface/Background/Primary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:68","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:54"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:54"}}}}' > /dev/null 2>&1
sleep 0.15

# Surface/Page (VariableID:21:69) → Brand/Primary-Light (VariableID:21:55)
echo "  Binding Surface/Page..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:69","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:55"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:55"}}}}' > /dev/null 2>&1
sleep 0.15

# Surface/Card (VariableID:21:70) → Brand/Primary-Light (VariableID:21:55)
echo "  Binding Surface/Card..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:70","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:55"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:55"}}}}' > /dev/null 2>&1
sleep 0.15

# Text/Inverse (VariableID:21:71) → Brand/Primary-Dark (VariableID:21:56)
echo "  Binding Text/Inverse..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:71","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:56"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:56"}}}}' > /dev/null 2>&1
sleep 0.15

# Text/Brand (VariableID:21:72) → Brand/Primary (VariableID:21:54)
echo "  Binding Text/Brand..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:72","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:54"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:54"}}}}' > /dev/null 2>&1
sleep 0.15

# Text/Link (VariableID:21:73) → Brand/Primary (VariableID:21:54)
echo "  Binding Text/Link..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:73","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:54"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:54"}}}}' > /dev/null 2>&1
sleep 0.15

# Text/Link-Hover (VariableID:21:74) → Brand/Primary-Dark (VariableID:21:56)
echo "  Binding Text/Link-Hover..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:74","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:56"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:56"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Secondary (VariableID:21:75) → Secondary/Secondary (VariableID:21:57)
echo "  Binding Accent/Secondary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:75","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:57"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:57"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Secondary-Subtle (VariableID:21:76) → Secondary/Secondary-Light (VariableID:21:58)
echo "  Binding Accent/Secondary-Subtle..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:76","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:58"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:58"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Secondary-Strong (VariableID:21:77) → Secondary/Secondary-Dark (VariableID:21:59)
echo "  Binding Accent/Secondary-Strong..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:77","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:59"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:59"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Tertiary (VariableID:21:78) → Tertiary/Tertiary (VariableID:21:60)
echo "  Binding Accent/Tertiary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:78","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:60"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:60"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Tertiary-Subtle (VariableID:21:79) → Tertiary/Tertiary-Light (VariableID:21:61)
echo "  Binding Accent/Tertiary-Subtle..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:79","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:61"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:61"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Tertiary-Strong (VariableID:21:80) → Tertiary/Tertiary-Dark (VariableID:21:62)
echo "  Binding Accent/Tertiary-Strong..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:80","values":{"Light Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:62"},"Dark Mode":{"type":"VARIABLE_ALIAS","id":"VariableID:21:62"}}}}' > /dev/null 2>&1
sleep 0.15

echo ""
echo ">>> PART 3 COMPLETE: 13 Token variables bound to Semantic (Light Mode + Dark Mode)."
echo ""

# ============================================
# PART 4: Bind Theme → Tokens (Light + Dark modes)
# ============================================
echo ">>> PART 4: Binding 23 Theme variables to Tokens..."
echo ""

# Background/Primary (VariableID:21:82) → Surface/Background/Primary (VariableID:21:68)
echo "  Binding Background/Primary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:82","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:68"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:68"}}}}' > /dev/null 2>&1
sleep 0.15

# Background/Tertiary (VariableID:21:83) → Surface/Page (VariableID:21:69)
echo "  Binding Background/Tertiary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:83","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:69"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:69"}}}}' > /dev/null 2>&1
sleep 0.15

# Background/Accent (VariableID:21:84) → Surface/Card (VariableID:21:70)
echo "  Binding Background/Accent..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:84","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:70"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:70"}}}}' > /dev/null 2>&1
sleep 0.15

# Background/Neutral (VariableID:21:85) → Surface/Page (VariableID:21:69)
echo "  Binding Background/Neutral..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:85","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:69"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:69"}}}}' > /dev/null 2>&1
sleep 0.15

# Foreground/Inverse (VariableID:21:86) → Text/Inverse (VariableID:21:71)
echo "  Binding Foreground/Inverse..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:86","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:71"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:71"}}}}' > /dev/null 2>&1
sleep 0.15

# Foreground/On-Brand (VariableID:21:87) → Text/Inverse (VariableID:21:71)
echo "  Binding Foreground/On-Brand..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:87","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:71"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:71"}}}}' > /dev/null 2>&1
sleep 0.15

# Foreground/On-Secondary (VariableID:21:88) → Text/Inverse (VariableID:21:71)
echo "  Binding Foreground/On-Secondary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:88","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:71"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:71"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Default (VariableID:21:89) → Text/Brand (VariableID:21:72)
echo "  Binding Interactive/Default..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:89","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:72"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:72"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Hover (VariableID:21:90) → Text/Link-Hover (VariableID:21:74)
echo "  Binding Interactive/Hover..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:90","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:74"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:74"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Active (VariableID:21:91) → Text/Link (VariableID:21:73)
echo "  Binding Interactive/Active..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:91","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:73"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:73"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Secondary-Default (VariableID:21:92) → Accent/Secondary (VariableID:21:75)
echo "  Binding Interactive/Secondary-Default..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:92","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:75"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:75"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Secondary-Hover (VariableID:21:93) → Accent/Secondary-Subtle (VariableID:21:76)
echo "  Binding Interactive/Secondary-Hover..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:93","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:76"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:76"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Secondary-Active (VariableID:21:94) → Accent/Secondary-Strong (VariableID:21:77)
echo "  Binding Interactive/Secondary-Active..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:94","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:77"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:77"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Tertiary-Default (VariableID:21:95) → Accent/Tertiary (VariableID:21:78)
echo "  Binding Interactive/Tertiary-Default..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:95","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:78"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:78"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Tertiary-Hover (VariableID:21:96) → Accent/Tertiary-Subtle (VariableID:21:79)
echo "  Binding Interactive/Tertiary-Hover..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:96","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:79"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:79"}}}}' > /dev/null 2>&1
sleep 0.15

# Interactive/Tertiary-Active (VariableID:21:97) → Accent/Tertiary-Strong (VariableID:21:80)
echo "  Binding Interactive/Tertiary-Active..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:97","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:80"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:80"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Primary (VariableID:21:98) → Text/Brand (VariableID:21:72)
echo "  Binding Accent/Primary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:98","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:72"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:72"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Secondary (VariableID:21:99) → Accent/Secondary (VariableID:21:75)
echo "  Binding Accent/Secondary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:99","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:75"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:75"}}}}' > /dev/null 2>&1
sleep 0.15

# Accent/Tertiary (VariableID:21:100) → Accent/Tertiary (VariableID:21:78)
echo "  Binding Accent/Tertiary..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:100","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:78"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:78"}}}}' > /dev/null 2>&1
sleep 0.15

# Feedback/Success (VariableID:21:101) → System/Success (VariableID:21:63)
echo "  Binding Feedback/Success..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:101","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:63"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:63"}}}}' > /dev/null 2>&1
sleep 0.15

# Feedback/Warning (VariableID:21:102) → System/Warning (VariableID:21:64)
echo "  Binding Feedback/Warning..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:102","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:64"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:64"}}}}' > /dev/null 2>&1
sleep 0.15

# Feedback/Error (VariableID:21:103) → System/Error (VariableID:21:65)
echo "  Binding Feedback/Error..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:103","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:65"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:65"}}}}' > /dev/null 2>&1
sleep 0.15

# Feedback/Info (VariableID:21:104) → System/Info (VariableID:21:66)
echo "  Binding Feedback/Info..."
curl -s -X POST "$URL" -H "$H" -d '{"type":"editVariable","payload":{"variableId":"VariableID:21:104","values":{"Light":{"type":"VARIABLE_ALIAS","id":"VariableID:21:66"},"Dark":{"type":"VARIABLE_ALIAS","id":"VariableID:21:66"}}}}' > /dev/null 2>&1
sleep 0.15

echo ""
echo ">>> PART 4 COMPLETE: 23 Theme variables bound to Tokens (Light + Dark)."
echo ""

# ============================================
# SUMMARY
# ============================================
echo "============================================"
echo "  ALL DONE!"
echo "============================================"
echo ""
echo "  Part 1: 49 Primitive color values set"
echo "  Part 2: 13 Semantic → Primitive aliases (Light + Dark)"
echo "  Part 3: 13 Token → Semantic aliases (Light Mode + Dark Mode)"
echo "  Part 4: 23 Theme → Token aliases (Light + Dark)"
echo ""
echo "  Total operations: 98"
echo "============================================"
