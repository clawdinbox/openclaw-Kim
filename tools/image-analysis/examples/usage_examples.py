"""
Example usage of the Image Analysis System
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import ImageAnalysisSystem, create_sample_analysis
from templates import format_result


def example_single_image():
    """Example: Analyze a single image."""
    print("=" * 60)
    print("Example 1: Single Image Analysis")
    print("=" * 60)
    
    # Initialize system
    system = ImageAnalysisSystem()
    
    # Simulate vision model analysis result
    vision_result = {
        "description": "A quarterly sales bar chart showing revenue growth across 4 quarters",
        "labels": ["chart", "graph", "bar chart", "data visualization", "sales"],
        "text_detected": True,
        "title": "Q1-Q4 Revenue Chart"
    }
    
    # Analyze
    result = system.analyze("sales_chart_q4.png", vision_result)
    
    # Output formatted report
    print(format_result(result, "markdown"))
    
    return result


def example_batch_processing():
    """Example: Batch process multiple images."""
    print("\n" + "=" * 60)
    print("Example 2: Batch Processing")
    print("=" * 60)
    
    system = ImageAnalysisSystem()
    
    # Multiple images
    batch_items = [
        ("chart1.png", create_sample_analysis("chart")),
        ("logo_design.jpg", create_sample_analysis("design")),
        ("invoice.pdf", create_sample_analysis("document")),
        ("competitor_product.png", create_sample_analysis("product")),
    ]
    
    # Process batch
    results = system.analyze_batch(batch_items)
    
    # Display summary
    print("\n📊 Batch Processing Summary:")
    print(f"Total Images: {results['summary']['total']}")
    print("\nRouting Distribution:")
    for agent, count in results['summary']['by_agent'].items():
        if count > 0:
            emoji = {"alex": "🔬", "sam": "🎨", "sales": "📄", "marketing": "🛍️", "manual_review": "❓"}.get(agent, "📎")
            print(f"  {emoji} {agent.title()}: {count} images")
    
    return results


def example_quick_classification():
    """Example: Quick classification without full analysis."""
    print("\n" + "=" * 60)
    print("Example 3: Quick Classification")
    print("=" * 60)
    
    system = ImageAnalysisSystem()
    
    test_cases = [
        {
            "description": "A colorful brand logo with modern typography",
            "labels": ["logo", "design", "branding", "creative"]
        },
        {
            "description": "A scanned contract document with signatures",
            "labels": ["document", "text", "contract", "paper"],
            "text_detected": True
        },
        {
            "description": "A dashboard showing KPI metrics and line graphs",
            "labels": ["dashboard", "chart", "analytics", "metrics"]
        }
    ]
    
    print("\nQuick Classifications:")
    for i, analysis in enumerate(test_cases, 1):
        classification = system.quick_classify(analysis)
        print(f"  {i}. {classification['icon']} {classification['type'].upper()} → {classification['agent_name']} ({classification['confidence']*100:.0f}% confidence)")


def example_custom_agent_usage():
    """Example: Use agents directly."""
    print("\n" + "=" * 60)
    print("Example 4: Direct Agent Usage")
    print("=" * 60)
    
    from agents.alex_handler import AlexHandler
    from agents.sam_handler import SamHandler
    
    # Use Alex directly for data extraction
    alex = AlexHandler()
    chart_analysis = {
        "description": "Line graph showing website traffic over 6 months with upward trend",
        "labels": ["chart", "graph", "line graph", "analytics"],
        "title": "Website Traffic"
    }
    
    classification = {
        "type": "chart",
        "confidence": 0.92,
        "agent": "alex",
        "agent_name": "Alex 🔬"
    }
    
    alex_result = alex.process("traffic_chart.png", chart_analysis, classification)
    print(f"\n🔬 Alex processed chart: {alex_result['extraction']['chart_type']}")
    print(f"   Insights found: {len(alex_result['insights'])}")
    
    # Use Sam directly for brand check
    sam = SamHandler()
    design_analysis = {
        "description": "Brand logo with red and blue colors, modern design",
        "labels": ["logo", "design", "branding"]
    }
    
    sam_result = sam.process("logo_mockup.jpg", design_analysis, classification)
    print(f"\n🎨 Sam analyzed design: {len(sam_result['analysis']['color_palette'])} colors detected")
    print(f"   Compliance score: {sam_result['compliance']['score']}%")


def example_different_output_formats():
    """Example: Different output formats."""
    print("\n" + "=" * 60)
    print("Example 5: Output Formats")
    print("=" * 60)
    
    system = ImageAnalysisSystem()
    
    analysis = create_sample_analysis("document")
    result = system.analyze("sample_invoice.pdf", analysis)
    
    print("\n📄 Markdown Format (full report):")
    print(format_result(result, "markdown")[:500] + "...")
    
    print("\n📋 Summary Format:")
    print(format_result(result, "summary"))
    
    print("\n💻 JSON Format (truncated):")
    json_output = format_result(result, "json")
    print(json_output[:500] + "...")


if __name__ == "__main__":
    print("\n" + "🖼️ " * 20)
    print("Image Analysis System - Usage Examples")
    print("🖼️ " * 20 + "\n")
    
    # Run all examples
    example_single_image()
    example_batch_processing()
    example_quick_classification()
    example_custom_agent_usage()
    example_different_output_formats()
    
    print("\n" + "=" * 60)
    print("✅ All examples completed!")
    print("=" * 60)
    print("\n📚 Next steps:")
    print("   1. Import the system: from main import ImageAnalysisSystem")
    print("   2. Create instance: system = ImageAnalysisSystem()")
    print("   3. Analyze images: result = system.analyze(path, analysis)")
    print("   4. Format output: print(format_result(result, 'markdown'))")
