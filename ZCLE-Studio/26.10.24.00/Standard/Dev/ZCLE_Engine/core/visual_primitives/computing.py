"""
Computing, Silicon Microarchitecture & Hardware Visual Primitives for Manim
Used for CPUs, GPUs, Logic Circuits, Instruction Pipelines, and Memory Hierarchy.
"""
from manim import *
import numpy as np

class SiliconDie(VGroup):
    """
    Detailed Silicon Die Floorplan with functional execution units and data buses.
    """
    def __init__(self, width=6.5, height=4.2, border_color="#00E5FF", **kwargs):
        super().__init__(**kwargs)
        # Die boundary substrate
        self.substrate = RoundedRectangle(
            corner_radius=0.25, width=width, height=height,
            stroke_color=border_color, stroke_width=3.0,
            fill_color="#08101C", fill_opacity=0.9
        )
        self.add(self.substrate)

        # Core blocks (ALU, Control Unit, L1/L2, Registers)
        w2 = (width - 1.2) / 2
        h2 = (height - 1.0) / 2

        self.block_cu = self._create_block("CONTROL UNIT", w2, h2, "#00E5FF").shift(LEFT * (w2/2 + 0.2) + UP * (h2/2 + 0.15))
        self.block_alu = self._create_block("ALU CORE", w2, h2, "#FF9100").shift(RIGHT * (w2/2 + 0.2) + UP * (h2/2 + 0.15))
        self.block_reg = self._create_block("REGISTERS", w2, h2, "#D500F9").shift(LEFT * (w2/2 + 0.2) + DOWN * (h2/2 + 0.15))
        self.block_cache = self._create_block("L1 / L2 CACHE", w2, h2, "#00E676").shift(RIGHT * (w2/2 + 0.2) + DOWN * (h2/2 + 0.15))

        self.blocks = VGroup(self.block_cu, self.block_alu, self.block_reg, self.block_cache)
        self.add(self.blocks)

    def _create_block(self, title, w, h, col):
        rect = RoundedRectangle(corner_radius=0.15, width=w, height=h, stroke_color=col, stroke_width=2.0, fill_color="#0D1B2A", fill_opacity=0.85)
        txt = Text(title, font_size=18, color=WHITE, weight=BOLD).move_to(rect)
        return VGroup(rect, txt)


class ClockSquareWave(VGroup):
    """
    Digital Clock Signal Square Wave (0 to 1 oscillating at frequency).
    """
    def __init__(self, cycles=6, cycle_width=1.2, amplitude=1.0, wave_color="#00E5FF", **kwargs):
        super().__init__(**kwargs)
        pts = []
        x_curr = - (cycles * cycle_width) / 2
        y_low = - amplitude / 2
        y_high = amplitude / 2

        for _ in range(cycles):
            # Low segment
            pts.append(np.array([x_curr, y_low, 0]))
            pts.append(np.array([x_curr + cycle_width/2, y_low, 0]))
            # Rising edge
            pts.append(np.array([x_curr + cycle_width/2, y_high, 0]))
            # High segment
            pts.append(np.array([x_curr + cycle_width, y_high, 0]))
            # Falling edge
            pts.append(np.array([x_curr + cycle_width, y_low, 0]))
            x_curr += cycle_width

        self.wave = VMobject(stroke_color=wave_color, stroke_width=2.5)
        self.wave.set_points_as_corners(pts)
        self.add(self.wave)


class LogicGateCircuit(VGroup):
    """
    Standard Logic Gate (AND / NAND / OR) with input pins and output line.
    """
    def __init__(self, gate_type="AND", gate_color="#FFD600", **kwargs):
        super().__init__(**kwargs)
        body = RoundedRectangle(corner_radius=0.2, width=1.6, height=1.2, stroke_color=gate_color, stroke_width=2.5, fill_color="#1A202C", fill_opacity=0.9)
        txt = Text(gate_type, font_size=22, color=gate_color, weight=BOLD).move_to(body)

        in_a = Line(LEFT * 1.8 + UP * 0.3, LEFT * 0.8 + UP * 0.3, stroke_width=2.0, color=WHITE)
        in_b = Line(LEFT * 1.8 + DOWN * 0.3, LEFT * 0.8 + DOWN * 0.3, stroke_width=2.0, color=WHITE)
        out = Line(RIGHT * 0.8, RIGHT * 1.8, stroke_width=2.0, color=gate_color)

        self.add(body, txt, in_a, in_b, out)

