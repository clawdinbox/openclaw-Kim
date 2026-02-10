"""
Sam Handler - CI/Brand Check Agent 🎨
Handles design, branding, and visual identity materials.
"""

from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class ColorInfo:
    """Color information from design analysis."""
    hex: str
    rgb: tuple
    usage: str
    percentage: float

@dataclass
class BrandElement:
    """Brand element detection."""
    element_type: str  # logo, typography, icon, etc.
    description: str
    position: str
    size: str


class SamHandler:
    """
    Sam 🎨 - The Design & Brand Specialist
    
    Capabilities:
    - Check brand compliance
    - Analyze color schemes
    - Verify typography usage
    - Assess visual hierarchy
    - Flag design inconsistencies
    """
    
    def __init__(self):
        self.name = "Sam 🎨"
        self.specialty = "Design & Brand Compliance"
        self.supported_types = ["design", "branding", "logo", "mockup"]
        
        # Brand guidelines (example - would be configurable)
        self.brand_guidelines = {
            "primary_colors": ["#FF5733", "#33FF57", "#3357FF"],
            "fonts": ["Helvetica", "Arial"],
            "logo_clearspace": "20px",
            "min_logo_size": "100px"
        }
    
    def process(self, image_path: str, analysis: Dict, classification: Dict) -> Dict[str, Any]:
        """
        Process a design/branding image for CI compliance.
        
        Args:
            image_path: Path to the image
            analysis: Vision model analysis
            classification: Classification result
            
        Returns:
            Design analysis and compliance report
        """
        # Analyze design elements
        colors = self._extract_colors(analysis)
        elements = self._detect_elements(analysis)
        typography = self._analyze_typography(analysis)
        
        # Check compliance
        compliance = self._check_compliance(colors, elements, typography)
        
        return {
            "agent": "sam",
            "agent_name": self.name,
            "task": "Brand Compliance Check",
            "classification": classification,
            "analysis": {
                "color_palette": colors,
                "brand_elements": elements,
                "typography": typography,
                "composition": self._analyze_composition(analysis)
            },
            "compliance": compliance,
            "recommendations": self._generate_design_recommendations(compliance),
            "export_formats": ["pdf_report", "json"],
            "confidence": classification["confidence"]
        }
    
    def _extract_colors(self, analysis: Dict) -> List[Dict]:
        """Extract and analyze color palette."""
        description = analysis.get("description", "").lower()
        
        colors = []
        color_keywords = {
            "red": "#FF0000", "blue": "#0000FF", "green": "#00FF00",
            "yellow": "#FFFF00", "orange": "#FFA500", "purple": "#800080",
            "black": "#000000", "white": "#FFFFFF", "gray": "#808080"
        }
        
        for color_name, hex_code in color_keywords.items():
            if color_name in description:
                colors.append({
                    "name": color_name,
                    "hex": hex_code,
                    "in_brand_palette": hex_code in self.brand_guidelines["primary_colors"]
                })
        
        return colors
    
    def _detect_elements(self, analysis: Dict) -> List[Dict]:
        """Detect brand elements in the design."""
        description = analysis.get("description", "").lower()
        elements = []
        
        # Check for logo
        if "logo" in description:
            elements.append({
                "type": "logo",
                "detected": True,
                "notes": "Logo presence confirmed"
            })
        
        # Check for icons
        if "icon" in description:
            elements.append({
                "type": "icon",
                "detected": True,
                "notes": "Icon elements found"
            })
        
        # Check for text/headlines
        if "text" in description or "headline" in description:
            elements.append({
                "type": "text",
                "detected": True,
                "notes": "Text elements present"
            })
        
        return elements
    
    def _analyze_typography(self, analysis: Dict) -> Dict:
        """Analyze typography usage."""
        description = analysis.get("description", "").lower()
        
        fonts_detected = []
        for font in self.brand_guidelines["fonts"]:
            if font.lower() in description:
                fonts_detected.append(font)
        
        return {
            "detected_fonts": fonts_detected,
            "brand_compliant": len(fonts_detected) > 0,
            "readability": "good" if "readable" in description or "clear" in description else "review_needed"
        }
    
    def _analyze_composition(self, analysis: Dict) -> Dict:
        """Analyze visual composition."""
        description = analysis.get("description", "").lower()
        
        return {
            "layout": "balanced" if "balanced" in description else "asymmetric",
            "visual_hierarchy": "clear" if "hierarchy" in description or "organized" in description else "unclear",
            "white_space": "appropriate" if "space" in description else "review",
            "alignment": "consistent" if "aligned" in description else "varied"
        }
    
    def _check_compliance(self, colors: List[Dict], elements: List[Dict], typography: Dict) -> Dict:
        """Check design against brand guidelines."""
        issues = []
        warnings = []
        passed = []
        
        # Color compliance
        non_brand_colors = [c for c in colors if not c.get("in_brand_palette", False)]
        if non_brand_colors:
            warnings.append(f"{len(non_brand_colors)} colors not in brand palette")
        else:
            passed.append("Color palette follows brand guidelines")
        
        # Typography compliance
        if typography["brand_compliant"]:
            passed.append("Typography is brand compliant")
        else:
            issues.append("Non-brand fonts detected")
        
        # Overall score
        total_checks = len(issues) + len(warnings) + len(passed)
        compliance_score = (len(passed) / total_checks * 100) if total_checks > 0 else 0
        
        return {
            "score": round(compliance_score, 1),
            "status": "pass" if compliance_score >= 80 else "review" if compliance_score >= 50 else "fail",
            "issues": issues,
            "warnings": warnings,
            "passed": passed
        }
    
    def _generate_design_recommendations(self, compliance: Dict) -> List[str]:
        """Generate design improvement recommendations."""
        recommendations = []
        
        if compliance["score"] < 80:
            recommendations.append("Review brand guidelines for color usage")
        
        if compliance["issues"]:
            recommendations.extend([f"Fix: {issue}" for issue in compliance["issues"]])
        
        if compliance["warnings"]:
            recommendations.extend([f"Consider: {warn}" for warn in compliance["warnings"]])
        
        if not recommendations:
            recommendations.append("Design is brand compliant - great work!")
        
        recommendations.extend([
            "Ensure logo has proper clearspace",
            "Verify contrast ratios for accessibility",
            "Test design across different screen sizes"
        ])
        
        return recommendations
