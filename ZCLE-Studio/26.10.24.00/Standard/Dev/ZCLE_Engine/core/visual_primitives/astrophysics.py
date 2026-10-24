"""
Astrophysics & General Relativity Visual Primitives for Manim
Used for Black Holes, Gravity, Spacetime, and Stellar Dynamics.
"""
from manim import *
import numpy as np

class SpacetimeGrid(VGroup):
    """
    A 2D/3D distorted spacetime elastic mesh that curves downward
    in proportion to mass density (General Relativity Rubber Sheet).
    """
    def __init__(self, x_range=(-7, 7, 0.5), y_range=(-4, 4, 0.5), grid_color="#1E3A5F", **kwargs):
        super().__init__(**kwargs)
        self.grid_color = grid_color
        self.lines = VGroup()
        self.x_min, self.x_max, self.step = x_range
        self.y_min, self.y_max, _ = y_range

        # Create horizontal lines
        y = self.y_min
        while y <= self.y_max:
            line = Line(np.array([self.x_min, y, 0]), np.array([self.x_max, y, 0]), stroke_width=1.2, stroke_color=grid_color)
            self.lines.add(line)
            y += self.step

        # Create vertical lines
        x = self.x_min
        while x <= self.x_max:
            line = Line(np.array([x, self.y_min, 0]), np.array([x, self.y_max, 0]), stroke_width=1.2, stroke_color=grid_color)
            self.lines.add(line)
            x += self.step

        self.add(self.lines)

    def warp_towards_center(self, center=ORIGIN, strength=2.2, radius=3.5):
        """
        Calculates a warped replacement group where lines curve inwards towards center.
        """
        warped_group = VGroup()
        for original_line in self.lines:
            points = original_line.get_points()
            new_points = []
            # Subdivide line into many segments to curve smoothly
            subdivided = np.linspace(points[0], points[-1], num=45)
            for pt in subdivided:
                diff = pt - center
                dist = np.linalg.norm(diff[:2])
                if dist < radius and dist > 0.05:
                    # Inward pull proportional to 1 / distance
                    pull_factor = strength * (1.0 - (dist / radius)**1.5)
                    displacement = - (diff / dist) * min(pull_factor, dist * 0.75)
                    new_pt = pt + displacement
                else:
                    new_pt = pt
                new_points.append(new_pt)

            warped_line = VMobject(stroke_width=original_line.get_stroke_width(), stroke_color=original_line.get_color())
            warped_line.set_points_smoothly([*new_points])
            warped_group.add(warped_line)
        return warped_group


class EventHorizonSphere(VGroup):
    """
    Physically inspired Black Hole Event Horizon:
    Singularity core (pitch black), Photon Sphere (intense bright ring),
    and outer Accretion Disk glow.
    """
    def __init__(self, radius=1.4, glow_color="#FF8C00", **kwargs):
        super().__init__(**kwargs)
        self.radius = radius

        # Accretion Glow layers
        self.glow_rings = VGroup()
        for i in range(12):
            r = radius * (1.0 + (i + 1) * 0.12)
            alpha = max(0.04, 0.45 * (1.0 - (i / 12.0)))
            ring = Circle(radius=r, stroke_color=glow_color, stroke_width=3.5 - i * 0.2, stroke_opacity=alpha)
            self.glow_rings.add(ring)

        # Photon Sphere (Luminous edge)
        self.photon_sphere = Circle(radius=radius * 1.05, stroke_color="#FFFFFF", stroke_width=4.0, stroke_opacity=0.95)

        # Black Core (Event Horizon)
        self.core = Circle(radius=radius, fill_color="#000000", fill_opacity=1.0, stroke_color="#FF6B00", stroke_width=2.0)

        self.add(self.glow_rings, self.photon_sphere, self.core)


class GeodesicPhotonBeam(VGroup):
    """
    Light rays that bend along spacetime geodesics into the black hole.
    """
    def __init__(self, start_pos=LEFT*6+UP*2, target_core=ORIGIN, bend_strength=1.8, ray_color="#00FFFF", **kwargs):
        super().__init__(**kwargs)
        pts = []
        num_pts = 35
        for i in range(num_pts):
            t = i / (num_pts - 1)
            # Parametric interpolation with gravitational deflection
            base_pt = start_pos * (1 - t) + (target_core + RIGHT*0.4) * t
            dist = np.linalg.norm(base_pt - target_core)
            if dist < 3.0:
                deflection = (target_core - base_pt) * (bend_strength / (dist + 0.5)) * t
                pt = base_pt + deflection
            else:
                pt = base_pt
            pts.append(pt)

        self.curve = VMobject(stroke_color=ray_color, stroke_width=3.0)
        self.curve.set_points_smoothly(pts)
        self.add(self.curve)

