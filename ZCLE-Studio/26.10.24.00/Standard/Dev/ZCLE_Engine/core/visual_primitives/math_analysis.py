"""
Mathematics, Calculus & Analytic Geometry Visual Primitives for Manim
"""
from manim import *
import numpy as np

class DynamicCoordinatePlane(VGroup):
    """
    2D Cartesian Coordinate Plane with axis labels and grid lines.
    """
    def __init__(self, x_range=(-5, 5, 1), y_range=(-3, 3, 1), plane_color="#1E3A5F", **kwargs):
        super().__init__(**kwargs)
        self.plane = NumberPlane(
            x_range=x_range, y_range=y_range,
            background_line_style={"stroke_color": plane_color, "stroke_width": 1.0, "stroke_opacity": 0.6},
            axis_config={"stroke_color": WHITE, "stroke_width": 2.0}
        )
        self.add(self.plane)


class TangentSlopeVector(VGroup):
    """
    Tangent slope line showing derivative at a curve point.
    """
    def __init__(self, point=ORIGIN, slope=1.0, length=2.0, vector_color=YELLOW, **kwargs):
        super().__init__(**kwargs)
        dx = length / (2 * np.sqrt(1 + slope**2))
        dy = slope * dx
        start = point + np.array([-dx, -dy, 0])
        end = point + np.array([dx, dy, 0])
        self.line = Line(start, end, stroke_color=vector_color, stroke_width=3.0)
        self.dot = Dot(point, radius=0.08, color=RED)
        self.add(self.line, self.dot)

