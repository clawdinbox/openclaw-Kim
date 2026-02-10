"""
Alex Handler - Data Extraction Agent 🔬
Handles charts, graphs, and data visualizations.
"""

from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class DataPoint:
    """Represents a single data point."""
    label: str
    value: float
    category: str = ""
    
@dataclass
class ChartData:
    """Structured chart data extraction."""
    chart_type: str
    title: str
    x_axis_label: str
    y_axis_label: str
    data_points: List[DataPoint]
    trends: List[str]
    insights: List[str]


class AlexHandler:
    """
    Alex 🔬 - The Data Extraction Specialist
    
    Capabilities:
    - Extract data from charts and graphs
    - Identify trends and patterns
    - Convert visualizations to structured data
    - Generate insights from data
    """
    
    def __init__(self):
        self.name = "Alex 🔬"
        self.specialty = "Data Extraction & Analysis"
        self.supported_types = ["chart", "graph", "screenshot", "dashboard"]
    
    def process(self, image_path: str, analysis: Dict, classification: Dict) -> Dict[str, Any]:
        """
        Process a chart/graph image and extract structured data.
        
        Args:
            image_path: Path to the image
            analysis: Vision model analysis
            classification: Classification result
            
        Returns:
            Structured data extraction result
        """
        # Extract chart-specific information
        chart_data = self._extract_chart_data(analysis)
        
        # Generate insights
        insights = self._generate_insights(chart_data)
        
        # Create structured output
        return {
            "agent": "alex",
            "agent_name": self.name,
            "task": "Data Extraction",
            "classification": classification,
            "extraction": {
                "chart_type": chart_data.chart_type,
                "title": chart_data.title,
                "axes": {
                    "x": chart_data.x_axis_label,
                    "y": chart_data.y_axis_label
                },
                "data_points": [
                    {"label": dp.label, "value": dp.value, "category": dp.category}
                    for dp in chart_data.data_points
                ],
                "data_count": len(chart_data.data_points)
            },
            "insights": insights,
            "recommendations": self._generate_recommendations(chart_data),
            "export_formats": ["csv", "json", "excel"],
            "confidence": classification["confidence"]
        }
    
    def _extract_chart_data(self, analysis: Dict) -> ChartData:
        """Extract chart data from vision analysis."""
        description = analysis.get("description", "").lower()
        
        # Determine chart type
        chart_type = "unknown"
        if "bar" in description:
            chart_type = "bar_chart"
        elif "line" in description or "trend" in description:
            chart_type = "line_chart"
        elif "pie" in description:
            chart_type = "pie_chart"
        elif "scatter" in description:
            chart_type = "scatter_plot"
        elif "histogram" in description:
            chart_type = "histogram"
        
        # Extract data points (simplified - in real impl, use vision model)
        data_points = []
        trends = []
        insights = []
        
        # Look for trend indicators
        if "increasing" in description or "growth" in description:
            trends.append("Upward trend detected")
        if "decreasing" in description or "decline" in description:
            trends.append("Downward trend detected")
        if "stable" in description or "flat" in description:
            trends.append("Stable/flat trend")
        
        return ChartData(
            chart_type=chart_type,
            title=analysis.get("title", "Untitled Chart"),
            x_axis_label="X Axis",
            y_axis_label="Y Axis",
            data_points=data_points,
            trends=trends,
            insights=insights
        )
    
    def _generate_insights(self, chart_data: ChartData) -> List[str]:
        """Generate insights from chart data."""
        insights = []
        
        if chart_data.trends:
            insights.extend(chart_data.trends)
        
        if chart_data.chart_type == "bar_chart":
            insights.append("Bar chart suitable for comparing categories")
        elif chart_data.chart_type == "line_chart":
            insights.append("Line chart shows temporal trends well")
        elif chart_data.chart_type == "pie_chart":
            insights.append("Pie chart shows part-to-whole relationships")
        
        return insights if insights else ["Analysis completed - manual review recommended for detailed insights"]
    
    def _generate_recommendations(self, chart_data: ChartData) -> List[str]:
        """Generate recommendations based on chart analysis."""
        return [
            "Export data to CSV for further analysis",
            "Consider alternative visualizations for different perspectives",
            "Verify data accuracy against source",
            "Add annotations for key data points"
        ]
    
    def export_data(self, result: Dict, format: str = "json") -> str:
        """Export extracted data to specified format."""
        import json
        
        if format == "json":
            return json.dumps(result["extraction"], indent=2)
        elif format == "csv":
            # Simplified CSV export
            rows = ["Label,Value,Category"]
            for dp in result["extraction"]["data_points"]:
                rows.append(f"{dp['label']},{dp['value']},{dp['category']}")
            return "\n".join(rows)
        else:
            return "Unsupported format"
