"""
Output Templates for Image Analysis Results
"""

from typing import Dict, Any
from datetime import datetime


class OutputTemplates:
    """Templates for formatting agent output."""
    
    @staticmethod
    def format_classification_result(result: Dict[str, Any]) -> str:
        """Format classification result as markdown."""
        routing = result["routing"]
        
        template = f"""## 🔍 Image Classification Result

**Classified As:** {routing['icon']} {routing['type'].upper()}
**Confidence:** {'🟢' if routing['confidence'] > 0.7 else '🟡' if routing['confidence'] > 0.4 else '🔴'} {routing['confidence']*100:.0f}%

### 🎯 Routing Decision
- **Agent:** {routing['agent_name']}
- **Task:** {routing['task']}

---
"""
        return template
    
    @staticmethod
    def format_alex_output(agent_output: Dict[str, Any]) -> str:
        """Format Alex (data extraction) output."""
        extraction = agent_output.get("extraction", {})
        insights = agent_output.get("insights", [])
        
        template = f"""### 📊 Alex 🔬 - Data Extraction Report

**Chart Type:** {extraction.get('chart_type', 'N/A').replace('_', ' ').title()}
**Title:** {extraction.get('title', 'N/A')}

#### 📈 Data Summary
- **Data Points:** {extraction.get('data_count', 0)}
- **X-Axis:** {extraction.get('axes', {}).get('x', 'N/A')}
- **Y-Axis:** {extraction.get('axes', {}).get('y', 'N/A')}

#### 💡 Insights
{chr(10).join(f"- {insight}" for insight in insights)}

#### 📋 Recommendations
{chr(10).join(f"- {rec}" for rec in agent_output.get('recommendations', []))}

**Export Formats:** {', '.join(agent_output.get('export_formats', []))}
"""
        return template
    
    @staticmethod
    def format_sam_output(agent_output: Dict[str, Any]) -> str:
        """Format Sam (brand compliance) output."""
        analysis = agent_output.get("analysis", {})
        compliance = agent_output.get("compliance", {})
        
        colors = analysis.get('color_palette', [])
        elements = analysis.get('brand_elements', [])
        
        status_emoji = "✅" if compliance.get('status') == "pass" else "⚠️" if compliance.get('status') == "review" else "❌"
        
        template = f"""### 🎨 Sam 🎨 - Brand Compliance Report

#### 📊 Compliance Score
**{status_emoji} {compliance.get('score', 0)}%** - {compliance.get('status', 'unknown').upper()}

#### 🎨 Color Palette
{chr(10).join(f"- {'✅' if c.get('in_brand_palette') else '⚠️'} {c['name']} ({c['hex']})" for c in colors) if colors else "- No colors detected"}

#### 🏷️ Brand Elements Detected
{chr(10).join(f"- {e['type'].title()}: {e['notes']}" for e in elements) if elements else "- No brand elements detected"}

#### ✏️ Typography
- **Brand Compliant:** {'✅ Yes' if analysis.get('typography', {}).get('brand_compliant') else '❌ No'}
- **Readability:** {analysis.get('typography', {}).get('readability', 'unknown')}

#### 📋 Recommendations
{chr(10).join(f"- {rec}" for rec in agent_output.get('recommendations', [])[:5])}
"""
        return template
    
    @staticmethod
    def format_sales_output(agent_output: Dict[str, Any]) -> str:
        """Format Sales (text extraction) output."""
        extraction = agent_output.get("extraction", {})
        summary = agent_output.get("summary", {})
        
        fields = extraction.get('fields', [])
        action_items = agent_output.get('action_items', [])
        
        template = f"""### 📄 Sales 📄 - Document Extraction Report

**Document Type:** {extraction.get('document_type', 'unknown').title()}
**Word Count:** {extraction.get('word_count', 0)}

#### 📝 Extracted Fields
{chr(10).join(f"- **{f['field'].replace('_', ' ').title()}:** {f['value']} {'(multiple)' if f.get('multiple') else ''}" for f in fields) if fields else "- No structured fields detected"}

#### 📋 Summary
{summary.get('summary_preview', 'No preview available')}

#### ✅ Action Items
{chr(10).join(f"- {item}" for item in action_items) if action_items else "- No action items detected"}

**Export Formats:** {', '.join(agent_output.get('export_formats', []))}
"""
        return template
    
    @staticmethod
    def format_marketing_output(agent_output: Dict[str, Any]) -> str:
        """Format Marketing (competitor analysis) output."""
        analysis = agent_output.get("analysis", {})
        insights = agent_output.get('competitive_insights', [])
        
        features = analysis.get('detected_features', [])
        packaging = analysis.get('packaging_analysis', {})
        positioning = analysis.get('positioning', {})
        
        template = f"""### 🛍️ Marketing 🛍️ - Competitor Analysis Report

**Product Category:** {analysis.get('product_category', 'unknown').title()}
**Market Position:** {positioning.get('market_position', 'unknown').title()}

#### 🎯 Detected Features
{chr(10).join(f"- {f['feature'].replace('_', ' ').title()}: {f['value']}" for f in features) if features else "- No specific features detected"}

#### 📦 Packaging Analysis
- **Elements:** {', '.join(packaging.get('elements_present', [])) if packaging.get('elements_present') else 'None detected'}
- **Sustainability Focus:** {'✅ Yes' if packaging.get('sustainability_focus') else '❌ No'}
- **Premium Packaging:** {'✅ Yes' if packaging.get('premium_packaging') else '❌ No'}

#### 💡 Competitive Insights
{chr(10).join(f"- **{i['type'].replace('_', ' ').title()}:** {i['message']}" for i in insights) if insights else "- No insights generated"}

#### 📋 Recommendations
{chr(10).join(f"- {rec}" for rec in agent_output.get('recommendations', [])[:5])}
"""
        return template
    
    @staticmethod
    def format_full_report(result: Dict[str, Any]) -> str:
        """Format complete report with all sections."""
        agent = result["agent_output"].get("agent", "unknown")
        
        report = OutputTemplates.format_classification_result(result)
        report += "\n"
        
        if agent == "alex":
            report += OutputTemplates.format_alex_output(result["agent_output"])
        elif agent == "sam":
            report += OutputTemplates.format_sam_output(result["agent_output"])
        elif agent == "sales":
            report += OutputTemplates.format_sales_output(result["agent_output"])
        elif agent == "marketing":
            report += OutputTemplates.format_marketing_output(result["agent_output"])
        else:
            report += "### ⚠️ Manual Review Required\n\n"
            report += str(result["agent_output"].get("message", "Unable to process"))
        
        report += f"\n\n---\n*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*"
        
        return report


# Convenience function
def format_result(result: Dict[str, Any], format_type: str = "markdown") -> str:
    """
    Format analysis result in specified format.
    
    Args:
        result: Analysis result dict
        format_type: Output format (markdown, json, summary)
        
    Returns:
        Formatted string
    """
    if format_type == "markdown":
        return OutputTemplates.format_full_report(result)
    elif format_type == "summary":
        routing = result["routing"]
        return f"{routing['icon']} {routing['type'].upper()} → {routing['agent_name']} ({routing['confidence']*100:.0f}% confidence)"
    elif format_type == "json":
        import json
        return json.dumps(result, indent=2)
    else:
        return str(result)
