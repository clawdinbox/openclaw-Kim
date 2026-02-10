#!/bin/bash
# Test Ollama Rate Limits locally

echo "🧪 Testing Ollama Local Rate Limits"
echo "===================================="
echo ""

# Check if ollama is running
echo "Checking Ollama status..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
  echo "❌ Ollama not running on localhost:11434"
  exit 1
fi

echo "✓ Ollama is running"
echo ""

# Test 1: Sequential requests
echo "--- Test 1: 3 Sequential Requests ---"
for i in 1 2 3; do
  START=$(date +%s%N)
  RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-oss:20b",
      "prompt": "Write one sentence about sportswear trends.",
      "stream": false,
      "options": {"num_predict": 50}
    }' 2>/dev/null)
  END=$(date +%s%N)
  DURATION=$(( (END - START) / 1000000 ))
  
  if echo "$RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "Request $i: ❌ ERROR ($DURATION ms) - $ERROR"
  else
    echo "Request $i: ✅ SUCCESS ($DURATION ms)"
  fi
  
  sleep 1
done

echo ""
echo "--- Test 2: 5 Rapid-Fire Parallel Requests ---"

# Launch 5 parallel requests
PIDS=""
for i in 1 2 3 4 5; do
  (
    START=$(date +%s%N)
    RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-oss:20b",
        "prompt": "Quick analysis: Nike trends?",
        "stream": false,
        "options": {"num_predict": 50}
      }' 2>/dev/null)
    END=$(date +%s%N)
    DURATION=$(( (END - START) / 1000000 ))
    
    if echo "$RESPONSE" | grep -q "error"; then
      echo "Request $i: ❌ ERROR ($DURATION ms)"
    else
      echo "Request $i: ✅ SUCCESS ($DURATION ms)"
    fi
  ) &
  PIDS="$PIDS $!"
done

# Wait for all to complete
wait $PIDS

echo ""
echo "===================================="
echo "Test complete"
