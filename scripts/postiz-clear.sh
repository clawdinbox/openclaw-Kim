#!/bin/bash
# Clear all scheduled posts from Postiz

source .env.postiz

echo "🧹 Clearing Postiz scheduled posts..."

# Get list of scheduled posts
SCHEDULED=$(curl -s -X GET "https://api.postiz.com/posts?status=scheduled" \
  -H "Authorization: $POSTIZ_API_KEY" \
  -H "Content-Type: application/json")

echo "Current scheduled posts:"
echo "$SCHEDULED" | jq -r '.[] | "\(.id): \(.posts[0].value[0].content[:50])..."' 2>/dev/null || echo "None found or API error"

# Delete each scheduled post
echo "$SCHEDULED" | jq -r '.[].id' 2>/dev/null | while read postId; do
  if [ ! -z "$postId" ]; then
    echo "Deleting post $postId..."
    curl -s -X DELETE "https://api.postiz.com/posts/$postId" \
      -H "Authorization: $POSTIZ_API_KEY"
  fi
done

echo "✅ Postiz schedule cleared"
