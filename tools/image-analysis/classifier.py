"""
Image Classification Module
Classifies images into categories for routing to appropriate agents.
"""

from enum import Enum
from typing import Dict, List, Tuple
import json

class ImageType(Enum):
    CHART = "chart"           # Charts, graphs, data visualizations → Alex
    DESIGN = "design"         # Design/branding materials → Sam
    DOCUMENT = "document"     # Documents, forms, text-heavy → Sales
    PRODUCT = "product"       # Product images, competitors → Marketing
    SCREENSHOT = "screenshot" # Screenshots, UI captures → Alex
    UNKNOWN = "unknown"       # Fallback

class ImageClassifier:
    """Classifies images based on visual content analysis."""
    
    def __init__(self):
        self.keywords = {
            ImageType.CHART: [
                "chart", "graph", "plot", "bar", "line graph", "pie chart",
                "data visualization", "analytics", "statistics", "trend",
                "axis", "legend", "data point", "series", "histogram",
                "scatter plot", "dashboard", "metric", "kpi"
            ],
            ImageType.DESIGN: [
                "logo", "brand", "color palette", "typography", "font",
                "layout", "design system", "mockup", "wireframe", "ui design",
                "visual identity", "style guide", "composition", "gradient",
                "branding", "creative", "artwork", "illustration"
            ],
            ImageType.DOCUMENT: [
                "document", "text", "page", "form", "invoice", "receipt",
                "contract", "letter", "report", "paper", "scan", "pdf",
                "handwritten", "typed", "paragraph", "header", "footer",
                "table of contents", "signature"
            ],
            ImageType.PRODUCT: [
                "product", "item", "merchandise", "packaging", "box",
                "bottle", "container", "label", "price tag", "catalog",
                "e-commerce", "retail", "goods", "merchandise", "shelf"
            ],
            ImageType.SCREENSHOT: [
                "screenshot", "screen capture", "interface", "ui", "app",
                "website", "browser", "window", "dialog", "menu", "toolbar",
                "desktop", "application", "software interface"
            ]
        }
    
    def classify(self, analysis_result: Dict) -> Tuple[ImageType, float]:
        """
        Classify image based on AI analysis result.
        
        Args:
            analysis_result: Dict containing image analysis from vision model
            
        Returns:
            Tuple of (ImageType, confidence_score)
        """
        description = analysis_result.get("description", "").lower()
        labels = analysis_result.get("labels", [])
        text_detected = analysis_result.get("text_detected", False)
        
        scores = {img_type: 0.0 for img_type in ImageType}
        
        # Score based on keywords
        for img_type, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in description:
                    scores[img_type] += 1.0
        
        # Boost scores based on detected labels
        for label in labels:
            label_lower = label.lower()
            for img_type, keywords in self.keywords.items():
                for keyword in keywords:
                    if keyword in label_lower:
                        scores[img_type] += 0.5
        
        # Special rules
        if text_detected and scores[ImageType.DOCUMENT] < 2:
            scores[ImageType.DOCUMENT] += 1.5
        
        # Determine best match
        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]
        
        # Normalize confidence
        confidence = min(best_score / 5.0, 1.0) if best_score > 0 else 0.0
        
        # Fallback if confidence too low
        if confidence < 0.2:
            return ImageType.UNKNOWN, confidence
            
        return best_type, confidence
    
    def get_agent_for_type(self, img_type: ImageType) -> str:
        """Get the agent name for a given image type."""
        routing = {
            ImageType.CHART: "alex",
            ImageType.SCREENSHOT: "alex",
            ImageType.DESIGN: "sam",
            ImageType.DOCUMENT: "sales",
            ImageType.PRODUCT: "marketing",
            ImageType.UNKNOWN: "manual_review"
        }
        return routing.get(img_type, "manual_review")
    
    def get_routing_info(self, img_type: ImageType) -> Dict:
        """Get full routing information for an image type."""
        routing_info = {
            ImageType.CHART: {
                "agent": "alex",
                "name": "Alex 🔬",
                "task": "Data extraction and analysis",
                "icon": "📊"
            },
            ImageType.SCREENSHOT: {
                "agent": "alex", 
                "name": "Alex 🔬",
                "task": "UI/data extraction",
                "icon": "📸"
            },
            ImageType.DESIGN: {
                "agent": "sam",
                "name": "Sam 🎨",
                "task": "CI/Brand check",
                "icon": "🎨"
            },
            ImageType.DOCUMENT: {
                "agent": "sales",
                "name": "Sales 📄",
                "task": "Text extraction",
                "icon": "📄"
            },
            ImageType.PRODUCT: {
                "agent": "marketing",
                "name": "Marketing 🛍️",
                "task": "Competitor analysis",
                "icon": "🛍️"
            },
            ImageType.UNKNOWN: {
                "agent": "manual_review",
                "name": "Manual Review 👤",
                "task": "Human classification needed",
                "icon": "❓"
            }
        }
        return routing_info.get(img_type, routing_info[ImageType.UNKNOWN])


# Convenience function
def classify_image(analysis_result: Dict) -> Dict:
    """
    Quick classify function that returns full classification info.
    
    Returns dict with:
        - type: Image type string
        - confidence: Confidence score (0-1)
        - agent: Target agent ID
        - agent_name: Display name
        - task: What the agent will do
        - icon: Emoji icon
    """
    classifier = ImageClassifier()
    img_type, confidence = classifier.classify(analysis_result)
    routing = classifier.get_routing_info(img_type)
    
    return {
        "type": img_type.value,
        "confidence": round(confidence, 2),
        "agent": routing["agent"],
        "agent_name": routing["name"],
        "task": routing["task"],
        "icon": routing["icon"],
        "needs_manual_review": confidence < 0.4 or img_type == ImageType.UNKNOWN
    }
