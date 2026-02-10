#!/usr/bin/env python3
"""
Integration Example: Using with OpenClaw's image tool
Shows how to wire the classification system to actual image analysis.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import ImageAnalysisSystem, create_sample_analysis
from templates import format_result


def analyze_with_openclaw(image_path: str):
    """
    Example integration with OpenClaw's image analysis tool.
    
    In production, you would:
    1. Use the image tool to analyze the image
    2. Pass the result to the classification system
    3. Route to appropriate agent
    """
    
    # Step 1: Get image analysis from vision model
    # In real usage, this would be:
    # analysis_result = image(prompt="Describe this image in detail", image=image_path)
    
    # Simulated analysis (replace with actual image tool call)
    analysis_result = {
        "description": "A bar chart showing monthly revenue data",
        "labels": ["chart", "data visualization", "business"],
        "text_detected": True
    }
    
    # Step 2: Run through classification system
    system = ImageAnalysisSystem()
    result = system.analyze(image_path, analysis_result)
    
    # Step 3: Output result
    return format_result(result, "markdown")


def telegram_bot_integration_example():
    """
    Example: How to integrate with a Telegram bot.
    
    When user sends an image:
    1. Bot receives image
    2. Analyze with vision model
    3. Classify and route
    4. Return formatted response
    """
    print("""
# Telegram Bot Integration Pseudocode

@bot.message_handler(content_types=['photo'])
def handle_image(message):
    # Download image
    file_info = bot.get_file(message.photo[-1].file_id)
    downloaded_file = bot.download_file(file_info.file_path)
    
    # Save temporarily
    with open('temp_image.jpg', 'wb') as f:
        f.write(downloaded_file)
    
    # Analyze with vision model (OpenClaw image tool)
    vision_result = image(
        prompt="Describe this image in detail. Identify if it's a chart, design, document, or product.",
        image='temp_image.jpg'
    )
    
    # Process through classification system
    system = ImageAnalysisSystem()
    result = system.analyze('temp_image.jpg', vision_result)
    
    # Send formatted response
    report = format_result(result, 'markdown')
    bot.reply_to(message, report, parse_mode='Markdown')
    
    # Optional: Route to specific agent channel
    agent = result['routing']['agent']
    if agent == 'alex':
        bot.send_message(ALEX_CHANNEL_ID, f"New data extraction task: {message.photo[-1].file_id}")
    elif agent == 'sam':
        bot.send_message(SAM_CHANNEL_ID, f"New brand check task: {message.photo[-1].file_id}")
    # ... etc
""")


def webhook_api_example():
    """Example: REST API endpoint using the system."""
    print("""
# Flask/FastAPI Integration Example

from fastapi import FastAPI, UploadFile, File
from main import ImageAnalysisSystem
from templates import format_result

app = FastAPI()
system = ImageAnalysisSystem()

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Save uploaded file
    contents = await file.read()
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(contents)
    
    # Get vision analysis (integrate with your vision API)
    vision_result = await call_vision_api(f"uploads/{file.filename}")
    
    # Process through system
    result = system.analyze(f"uploads/{file.filename}", vision_result)
    
    return {
        "classification": result["routing"],
        "agent_result": result["agent_output"],
        "formatted_report": format_result(result, "markdown")
    }

@app.post("/analyze-batch")
async def analyze_batch(files: List[UploadFile] = File(...)):
    items = []
    for file in files:
        contents = await file.read()
        path = f"uploads/{file.filename}"
        with open(path, "wb") as f:
            f.write(contents)
        
        vision_result = await call_vision_api(path)
        items.append((path, vision_result))
    
    results = system.analyze_batch(items)
    return results
""")


if __name__ == "__main__":
    print("🔄 Integration Examples")
    print("=" * 60)
    
    print("\n1. Basic OpenClaw Integration")
    print("-" * 40)
    result = analyze_with_openclaw("sample_chart.png")
    print(result[:1000])
    
    print("\n\n2. Telegram Bot Integration")
    telegram_bot_integration_example()
    
    print("\n\n3. REST API Integration")
    webhook_api_example()
