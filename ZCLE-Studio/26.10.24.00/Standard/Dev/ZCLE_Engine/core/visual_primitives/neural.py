"""
Deep Learning, Transformers & Neural Network Visual Primitives for Manim
Faithfully reconstructed from the 3Blue1Brown Reference Standard.
"""
from manim import *
import numpy as np

class NeuralSlab3D(VGroup):
    """
    3D perspective glass layer slab filled with circular parameter dials (weights).
    """
    def __init__(self, num_slabs=8, slab_width=4.5, slab_height=2.8, depth_step=0.25, dial_grid=(4, 6), **kwargs):
        super().__init__(**kwargs)
        self.slabs = VGroup()

        rows, cols = dial_grid
        for s in range(num_slabs):
            # Perspective displacement
            offset = np.array([- (num_slabs - 1 - s) * 0.15, (num_slabs - 1 - s) * 0.08, 0])
            alpha = 0.25 + 0.65 * (s / (num_slabs - 1)) if num_slabs > 1 else 0.85
            col = interpolate_color(GRAY_D, BLUE_E, s / max(1, num_slabs - 1))

            rect = Rectangle(
                width=slab_width, height=slab_height,
                stroke_color=col, stroke_width=1.5,
                fill_color="#101826", fill_opacity=alpha
            ).shift(offset)

            # Dials on front slab
            dial_group = VGroup()
            if s == num_slabs - 1:
                dx = (slab_width - 0.8) / max(1, cols - 1)
                dy = (slab_height - 0.6) / max(1, rows - 1)
                for r in range(rows):
                    for c in range(cols):
                        cx = - (slab_width - 0.8)/2 + c * dx
                        cy = - (slab_height - 0.6)/2 + r * dy
                        dial = Circle(radius=0.10, stroke_color=TEAL_C, stroke_width=1.2, stroke_opacity=0.7)
                        needle = Line(ORIGIN, UP*0.08, stroke_color=YELLOW, stroke_width=1.0)
                        needle.rotate(np.random.uniform(-PI, PI))
                        dial_comp = VGroup(dial, needle).shift(rect.get_center() + np.array([cx, cy, 0]))
                        dial_group.add(dial_comp)

            slab_unit = VGroup(rect, dial_group)
            self.slabs.add(slab_unit)

        self.add(self.slabs)


class TokenVectorColumn(VGroup):
    """
    Vertical high-dimensional coordinate vector bracket with float values.
    Faithful to 3b1b frame 021.
    """
    def __init__(self, token="river", values=None, bracket_color="#58C4DD", **kwargs):
        super().__init__(**kwargs)
        if values is None:
            values = ["+5.8", "+0.6", "-0.9", "+8.4", "-8.5", "...", "-2.3"]

        token_box = RoundedRectangle(corner_radius=0.1, width=1.4, height=0.55, stroke_color=bracket_color, stroke_width=1.5, fill_color="#0A192F", fill_opacity=0.85)
        token_txt = Text(token, font_size=20, color=WHITE).move_to(token_box)
        header = VGroup(token_box, token_txt)

        arrow = Arrow(header.get_bottom(), header.get_bottom() + DOWN*0.6, buff=0.1, stroke_width=2.0, max_tip_length_to_length_ratio=0.35, color=WHITE)

        val_mobs = [Text(str(v), font_size=16, color=YELLOW if v.startswith("+") else (TEAL_B if v.startswith("-") else GRAY_B)) for v in values]
        val_group = VGroup(*val_mobs).arrange(DOWN, buff=0.12)

        # Surrounding square brackets
        left_bracket = Text("[", font_size=55, color=WHITE).next_to(val_group, LEFT, buff=0.08)
        right_bracket = Text("]", font_size=55, color=WHITE).next_to(val_group, RIGHT, buff=0.08)

        matrix_group = VGroup(left_bracket, val_group, right_bracket).next_to(arrow, DOWN, buff=0.1)

        self.add(header, arrow, matrix_group)


class ProbabilityBarChart(VGroup):
    """
    Horizontal probability distribution bar chart reacting to next-token prediction.
    """
    def __init__(self, items=None, max_width=3.5, **kwargs):
        super().__init__(**kwargs)
        if items is None:
            items = [
                {"word": "worst", "prob": 0.63, "color": "#00E5FF"},
                {"word": "age", "prob": 0.21, "color": "#00E5FF"},
                {"word": "worse", "prob": 0.09, "color": "#76FF03"},
                {"word": "best", "prob": 0.05, "color": "#FFEA00"},
                {"word": "most", "prob": 0.01, "color": "#9E9E9E"}
            ]

        rows = VGroup()
        for it in items:
            word = it["word"]
            p = it["prob"]
            col = it.get("color", "#00E5FF")

            lbl = Text(word, font_size=18, color=WHITE)
            lbl.set_width(1.0) # uniform width
            bar = Rectangle(
                width=max(0.05, p * max_width), height=0.28,
                fill_color=col, fill_opacity=0.9, stroke_width=0
            )
            pct = Text(f"{int(p*100)}%", font_size=16, color=GRAY_B)

            row = VGroup(lbl, bar, pct).arrange(RIGHT, buff=0.15)
            rows.add(row)

        rows.arrange(DOWN, buff=0.16, aligned_edge=LEFT)
        self.add(rows)

