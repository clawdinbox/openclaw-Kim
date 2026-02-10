"""
Sales Handler - Text Extraction Agent 📄
Handles documents, forms, and text-heavy images.
"""

from typing import Dict, Any, List
from dataclasses import dataclass
import re


@dataclass
class ExtractedField:
    """Extracted field from document."""
    field_name: str
    value: str
    confidence: float
    bbox: tuple = None


class SalesHandler:
    """
    Sales 📄 - The Document & Text Extraction Specialist
    
    Capabilities:
    - Extract text from documents
    - Parse forms and fields
    - Identify document type
    - Extract key information
    - Generate structured data
    """
    
    def __init__(self):
        self.name = "Sales 📄"
        self.specialty = "Document Text Extraction"
        self.supported_types = ["document", "invoice", "receipt", "form", "contract"]
        
        # Common field patterns
        self.field_patterns = {
            "invoice_number": r"(?i)(?:invoice\s*(?:#|num|number)?[:\s]*)([A-Z0-9\-]+)",
            "date": r"(?i)(?:date|dated)[:\s]*(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4})",
            "total": r"(?i)(?:total|amount|sum)[:\s]*[$€£]?\s*([\d,]+\.?\d*)",
            "email": r"[\w\.-]+@[\w\.-]+\.\w+",
            "phone": r"[\+]?\d[\d\s\-\(\)]{7,}\d"
        }
    
    def process(self, image_path: str, analysis: Dict, classification: Dict) -> Dict[str, Any]:
        """
        Process a document image and extract text/fields.
        
        Args:
            image_path: Path to the image
            analysis: Vision model analysis (including OCR text)
            classification: Classification result
            
        Returns:
            Structured text extraction result
        """
        # Get extracted text
        raw_text = analysis.get("text", "")
        description = analysis.get("description", "")
        
        # Identify document type
        doc_type = self._identify_document_type(raw_text, description)
        
        # Extract fields
        fields = self._extract_fields(raw_text)
        
        # Structure the content
        structured_content = self._structure_content(raw_text, doc_type)
        
        return {
            "agent": "sales",
            "agent_name": self.name,
            "task": "Text Extraction",
            "classification": classification,
            "extraction": {
                "document_type": doc_type,
                "raw_text": raw_text,
                "word_count": len(raw_text.split()),
                "fields": fields,
                "structured_content": structured_content
            },
            "summary": self._generate_summary(raw_text, doc_type, fields),
            "action_items": self._extract_action_items(raw_text),
            "export_formats": ["txt", "json", "csv", "markdown"],
            "confidence": classification["confidence"]
        }
    
    def _identify_document_type(self, text: str, description: str) -> str:
        """Identify the type of document."""
        text_lower = text.lower()
        desc_lower = description.lower()
        
        # Check for invoice indicators
        if any(word in text_lower for word in ["invoice", "bill to", "payment due", "invoice number"]):
            return "invoice"
        
        # Check for receipt indicators
        if any(word in text_lower for word in ["receipt", "thank you for your purchase", "cashier", "change due"]):
            return "receipt"
        
        # Check for contract/agreement
        if any(word in text_lower for word in ["agreement", "contract", "terms and conditions", "parties"]):
            return "contract"
        
        # Check for form
        if any(word in text_lower for word in ["form", "application", "please fill", "signature"]):
            return "form"
        
        # Check for letter
        if "dear" in text_lower and "sincerely" in text_lower:
            return "letter"
        
        return "document"
    
    def _extract_fields(self, text: str) -> List[Dict]:
        """Extract structured fields from text."""
        fields = []
        
        for field_name, pattern in self.field_patterns.items():
            matches = re.findall(pattern, text)
            if matches:
                fields.append({
                    "field": field_name,
                    "value": matches[0] if isinstance(matches[0], str) else matches[0][0],
                    "confidence": 0.85,
                    "multiple": len(matches) > 1
                })
        
        return fields
    
    def _structure_content(self, text: str, doc_type: str) -> Dict:
        """Structure content based on document type."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        structure = {
            "header": lines[0] if lines else "",
            "paragraphs": [],
            "lists": [],
            "tables": []
        }
        
        current_paragraph = []
        for line in lines[1:]:
            # Check if it's a list item
            if re.match(r"^[\s]*[\-\*\•\d]+[\.\)]?\s", line):
                if current_paragraph:
                    structure["paragraphs"].append(" ".join(current_paragraph))
                    current_paragraph = []
                structure["lists"].append(line)
            else:
                current_paragraph.append(line)
        
        if current_paragraph:
            structure["paragraphs"].append(" ".join(current_paragraph))
        
        return structure
    
    def _generate_summary(self, text: str, doc_type: str, fields: List[Dict]) -> Dict:
        """Generate document summary."""
        sentences = text.split(".")
        
        return {
            "document_type": doc_type,
            "length": f"{len(text)} characters, {len(text.split())} words",
            "key_fields_found": len(fields),
            "field_names": [f["field"] for f in fields],
            "first_sentence": sentences[0] if sentences else "",
            "summary_preview": text[:200] + "..." if len(text) > 200 else text
        }
    
    def _extract_action_items(self, text: str) -> List[str]:
        """Extract action items from document."""
        action_items = []
        text_lower = text.lower()
        
        # Look for action keywords
        action_keywords = [
            "please sign", "return by", "due date", "action required",
            "please complete", "submit by", "deadline", "response needed"
        ]
        
        for keyword in action_keywords:
            if keyword in text_lower:
                # Find the sentence containing the keyword
                sentences = text.split(".")
                for sentence in sentences:
                    if keyword in sentence.lower():
                        action_items.append(sentence.strip())
        
        return list(set(action_items))  # Remove duplicates
    
    def export_text(self, result: Dict, format: str = "txt") -> str:
        """Export extracted text to specified format."""
        extraction = result["extraction"]
        
        if format == "txt":
            return extraction["raw_text"]
        
        elif format == "markdown":
            md = f"# Document Analysis\n\n"
            md += f"**Type:** {extraction['document_type']}\n\n"
            md += f"**Content:**\n\n{extraction['raw_text']}\n\n"
            md += "## Extracted Fields\n\n"
            for field in extraction["fields"]:
                md += f"- **{field['field']}:** {field['value']}\n"
            return md
        
        elif format == "json":
            import json
            return json.dumps(extraction, indent=2)
        
        return "Unsupported format"
