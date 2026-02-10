"""
Image Analysis System - Main Entry Point
Complete workflow for image classification and agent routing.
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional
import json
import argparse

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from classifier import classify_image, ImageClassifier
from router import AgentRouter, BatchRouter, quick_route
from templates import format_result, OutputTemplates


class ImageAnalysisSystem:
    """
    Main Image Analysis System
    
    Workflow:
    1. Receive image + analysis
    2. Classify image type
    3. Route to appropriate agent
    4. Return formatted result
    """
    
    def __init__(self):
        self.classifier = ImageClassifier()
        self.router = AgentRouter()
        self.batch_router = BatchRouter()
    
    def analyze(self, image_path: str, vision_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a single image through the complete pipeline.
        
        Args:
            image_path: Path to image file
            vision_analysis: Results from vision model analysis
            
        Returns:
            Complete analysis result with routing and agent output
        """
        return self.router.route(image_path, vision_analysis)
    
    def analyze_batch(self, items: list) -> Dict[str, Any]:
        """
        Analyze multiple images in batch.
        
        Args:
            items: List of (image_path, vision_analysis) tuples
            
        Returns:
            Batch processing results grouped by agent
        """
        return self.batch_router.process_batch(items)
    
    def quick_classify(self, vision_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Quick classification without full routing.
        
        Args:
            vision_analysis: Vision model analysis
            
        Returns:
            Classification result only
        """
        return classify_image(vision_analysis)


def create_sample_analysis(image_type: str) -> Dict[str, Any]:
    """Create sample vision analysis for testing/demo."""
    
    samples = {
        "chart": {
            "description": "A bar chart showing quarterly sales data with increasing trend",
            "labels": ["chart", "graph", "bar", "data visualization", "analytics"],
            "text_detected": True,
            "title": "Q4 Sales Performance"
        },
        "design": {
            "description": "A brand logo design with modern typography and color palette",
            "labels": ["design", "logo", "branding", "creative", "visual identity"],
            "text_detected": True,
            "title": "Brand Identity Mockup"
        },
        "document": {
            "description": "A scanned invoice document with text and table",
            "labels": ["document", "text", "invoice", "paper", "scan"],
            "text_detected": True,
            "text": "Invoice #12345\nDate: 2024-01-15\nTotal: $500.00\nEmail: contact@example.com",
            "title": "Invoice"
        },
        "product": {
            "description": "A premium electronics product in sleek packaging on white background",
            "labels": ["product", "electronics", "packaging", "premium", "merchandise"],
            "text_detected": False,
            "title": "Product Shot"
        }
    }
    
    return samples.get(image_type, samples["document"])


def main():
    """CLI entry point for the image analysis system."""
    parser = argparse.ArgumentParser(
        description="Image Analysis System - Classify and route images to specialized agents"
    )
    parser.add_argument(
        "--demo", 
        action="store_true",
        help="Run demo with sample images"
    )
    parser.add_argument(
        "--type",
        choices=["chart", "design", "document", "product"],
        help="Sample type for demo"
    )
    parser.add_argument(
        "--format",
        choices=["markdown", "json", "summary"],
        default="markdown",
        help="Output format"
    )
    
    args = parser.parse_args()
    
    system = ImageAnalysisSystem()
    
    if args.demo:
        # Run demo
        test_type = args.type or "chart"
        sample_analysis = create_sample_analysis(test_type)
        
        print(f"🖼️  Demo: Processing {test_type} image...\n")
        
        result = system.analyze(f"demo_{test_type}.jpg", sample_analysis)
        
        print(format_result(result, args.format))
        
        return
    
    # Interactive mode
    print("=" * 60)
    print("🖼️  Image Analysis System")
    print("=" * 60)
    print("\nThis system classifies images and routes them to specialized agents:")
    print("  📊 Alex 🔬  → Charts & Data")
    print("  🎨 Sam 🎨   → Design & Branding")
    print("  📄 Sales 📄 → Documents")
    print("  🛍️ Marketing 🛍️ → Products")
    print("\nUsage:")
    print("  python main.py --demo --type chart")
    print("  python main.py --demo --type design")
    print("  python main.py --demo --type document")
    print("  python main.py --demo --type product")
    print("\n")


if __name__ == "__main__":
    main()
