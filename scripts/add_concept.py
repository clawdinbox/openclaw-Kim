import argparse
import os
import re
from datetime import datetime

def sanitize_filename(title):
    """Sanitizes a string to be used as a filename."""
    s = title.lower()
    s = re.sub(r'[^\w\s-]', '', s)  # Remove non-alphanumeric characters except spaces and hyphens
    s = re.sub(r'[\s-]+', '-', s) # Replace spaces and hyphens with a single hyphen
    s = s.strip('-') # Trim leading/trailing hyphens
    if not s:
        return "untitled"
    return s

def create_concept_file(title, description, base_dir="."):
    """Creates a markdown file for a new concept."""
    sanitized_title = sanitize_filename(title)
    filename = f"{sanitized_title}.md"
    concept_dir = os.path.join(base_dir, "documents", "concepts")
    
    # Ensure the directory exists
    os.makedirs(concept_dir, exist_ok=True)
    
    filepath = os.path.join(concept_dir, filename)
    
    now = datetime.now()
    creation_date = now.strftime("%Y-%m-%d %H:%M:%S")
    
    frontmatter = f"""---
title: "{title}"
date: "{creation_date}"
tags: []
---

"""
    
    content = frontmatter + description
    
    try:
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Successfully created concept file: {filepath}")
    except IOError as e:
        print(f"Error writing to file {filepath}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add a new concept to the knowledge base.")
    parser.add_argument("title", help="The title of the concept.")
    parser.add_argument("description", help="A detailed description of the concept.")
    
    args = parser.parse_args()
    
    # Assuming the script is run from the workspace/scripts directory
    # The base_dir should be the workspace root.
    # We can construct this by going up two levels from the script's directory.
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.join(script_dir, "..", "..") # workspace/scripts -> workspace
    
    create_concept_file(args.title, args.description, base_dir=workspace_root)
