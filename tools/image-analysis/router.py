"""
Agent Router Module
Routes classified images to the appropriate agent handler.
"""

from typing import Dict, Any, Optional
from pathlib import Path
import json

from classifier import ImageClassifier, ImageType, classify_image


class AgentRouter:
    """Routes images to appropriate agents based on classification."""
    
    def __init__(self):
        self.classifier = ImageClassifier()
        self.handlers = {
            "alex": self._route_to_alex,
            "sam": self._route_to_sam,
            "sales": self._route_to_sales,
            "marketing": self._route_to_marketing,
            "manual_review": self._route_to_manual
        }
    
    def route(self, image_path: str, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route an image to the appropriate agent.
        
        Args:
            image_path: Path to the image file
            analysis_result: Vision model analysis results
            
        Returns:
            Dict containing routing decision and agent output
        """
        # Classify the image
        classification = classify_image(analysis_result)
        
        # Get the handler
        agent_id = classification["agent"]
        handler = self.handlers.get(agent_id, self._route_to_manual)
        
        # Route to agent
        agent_output = handler(image_path, analysis_result, classification)
        
        return {
            "routing": classification,
            "agent_output": agent_output,
            "status": "success"
        }
    
    def _route_to_alex(self, image_path: str, analysis: Dict, classification: Dict) -> Dict:
        """Route charts and screenshots to Alex (data extraction)."""
        from agents.alex_handler import AlexHandler
        
        handler = AlexHandler()
        return handler.process(image_path, analysis, classification)
    
    def _route_to_sam(self, image_path: str, analysis: Dict, classification: Dict) -> Dict:
        """Route design/branding to Sam (CI check)."""
        from agents.sam_handler import SamHandler
        
        handler = SamHandler()
        return handler.process(image_path, analysis, classification)
    
    def _route_to_sales(self, image_path: str, analysis: Dict, classification: Dict) -> Dict:
        """Route documents to Sales (text extraction)."""
        from agents.sales_handler import SalesHandler
        
        handler = SalesHandler()
        return handler.process(image_path, analysis, classification)
    
    def _route_to_marketing(self, image_path: str, analysis: Dict, classification: Dict) -> Dict:
        """Route products to Marketing (competitor analysis)."""
        from agents.marketing_handler import MarketingHandler
        
        handler = MarketingHandler()
        return handler.process(image_path, analysis, classification)
    
    def _route_to_manual(self, image_path: str, analysis: Dict, classification: Dict) -> Dict:
        """Route unknown/low-confidence images to manual review."""
        return {
            "agent": "manual_review",
            "message": "Image could not be automatically classified with confidence.",
            "classification": classification,
            "suggested_actions": [
                "Review image manually",
                "Provide classification",
                "Re-analyze with different parameters"
            ]
        }


# Batch processing support
class BatchRouter:
    """Process multiple images in batch."""
    
    def __init__(self):
        self.router = AgentRouter()
    
    def process_batch(self, image_analyses: list) -> Dict[str, Any]:
        """
        Process multiple images and group by agent.
        
        Args:
            image_analyses: List of (image_path, analysis_result) tuples
            
        Returns:
            Dict with results grouped by agent
        """
        results = {
            "alex": [],
            "sam": [],
            "sales": [],
            "marketing": [],
            "manual_review": [],
            "summary": {
                "total": len(image_analyses),
                "by_agent": {}
            }
        }
        
        for image_path, analysis in image_analyses:
            try:
                result = self.router.route(image_path, analysis)
                agent = result["routing"]["agent"]
                results[agent].append({
                    "image": image_path,
                    "result": result
                })
            except Exception as e:
                results["manual_review"].append({
                    "image": image_path,
                    "error": str(e)
                })
        
        # Build summary
        for agent in ["alex", "sam", "sales", "marketing", "manual_review"]:
            count = len(results[agent])
            results["summary"]["by_agent"][agent] = count
        
        return results


def quick_route(image_path: str, analysis_result: Dict) -> Dict:
    """Quick routing function for single images."""
    router = AgentRouter()
    return router.route(image_path, analysis_result)
