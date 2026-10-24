import json

def generate_python_scene_file(project_data: dict, scene_durations: dict, output_file: str):
    """
    Takes project JSON data and exact audio durations per scene,
    and dynamically produces a valid Manim Python script with calibrated timings.
    """
    scenes = project_data.get("scenes", [])
    theme_bg = project_data.get("theme", {}).get("background", "#0e1117")
    
    code_lines = [
        "from manim import *",
        f'config.background_color = "{theme_bg}"',
        ""
    ]

    for idx, sc in enumerate(scenes):
        sc_type = sc.get("type", "title_intro")
        sc_name = f"StudioScene_{idx}_{sc_type}"
        dur = scene_durations.get(idx, 10.0)
        
        code_lines.append(f"class {sc_name}(Scene):")
        code_lines.append("    def construct(self):")

        if sc_type == "title_intro":
            title_text = sc.get("title", "Topic Title")
            subtitle_text = sc.get("subtitle", "How does it work?")
            prompt = sc.get("prompt", "Question?")
            tag = sc.get("tag", "Mathematical Concept")
            
            # Divide duration among animations
            t_write = min(2.0, dur * 0.18)
            t_box = min(2.5, dur * 0.22)
            t_ind = min(1.5, dur * 0.12)
            t_trans = min(2.5, dur * 0.22)
            t_out = min(1.5, dur * 0.15)
            t_wait = max(0.2, dur - (t_write + t_box + t_ind + t_trans + t_out))

            code_lines.extend([
                f'        title = Text("{title_text}", font_size=46, color=BLUE_B, weight=BOLD)',
                f'        subtitle = Text("{subtitle_text}", font_size=24, color=GRAY_B)',
                '        head = VGroup(title, subtitle).arrange(DOWN, buff=0.2).to_edge(UP, buff=1.0)',
                f'        self.play(Write(title), FadeIn(subtitle, shift=UP*0.2), run_time={t_write:.2f})',
                '        box = RoundedRectangle(corner_radius=0.2, height=1.5, width=9.0, color=BLUE_D, fill_color="#182232", fill_opacity=0.85)',
                f'        prompt_txt = Text(\'{prompt}\', font_size=28, color=WHITE).move_to(box)',
                f'        self.play(Create(box), Write(prompt_txt), run_time={t_box:.2f})',
                f'        self.play(Indicate(prompt_txt, color=YELLOW), run_time={t_ind:.2f})',
                f'        tag_card = VGroup(Text("{tag}", font_size=34, color=TEAL_B, weight=BOLD), Text("Core Principle", font_size=20, color=YELLOW_C)).arrange(DOWN, buff=0.15).move_to(DOWN*1.8)',
                f'        self.play(FadeIn(tag_card, shift=UP*0.3), run_time={t_trans:.2f})',
                f'        self.wait({t_wait:.2f})',
                f'        self.play(FadeOut(Group(*self.mobjects)), run_time={t_out:.2f})'
            ])

        elif sc_type == "prob_distribution":
            header = sc.get("header", "Probability Distribution")
            tokens = sc.get("tokens", ["Input", "Tokens"])
            items = sc.get("items", [{"word": "Choice A", "prob": 0.8}, {"word": "Choice B", "prob": 0.2}])
            sampled = sc.get("sampled", items[0]["word"] if items else "Choice")

            t_head = min(2.0, dur * 0.12)
            t_in = min(3.0, dur * 0.2)
            t_bars = min(4.0, dur * 0.3)
            t_high = min(2.5, dur * 0.18)
            t_out = min(1.5, dur * 0.1)
            t_wait = max(0.5, dur - (t_head + t_in + t_bars + t_high + t_out))

            tokens_json = json.dumps(tokens)
            items_json = json.dumps(items)

            code_lines.extend([
                f'        head = Text("{header}", font_size=36, color=BLUE_B, weight=BOLD).to_edge(UP, buff=0.7)',
                f'        self.play(FadeIn(head, shift=DOWN*0.2), run_time={t_head:.2f})',
                f'        words = {tokens_json}',
                '        t_boxes = VGroup()',
                '        for w in words:',
                '            r = RoundedRectangle(corner_radius=0.15, height=0.9, width=1.5, color=BLUE_C, fill_color="#182538", fill_opacity=0.9)',
                '            t_boxes.add(VGroup(r, Text(w, font_size=24, color=WHITE)))',
                '        t_boxes.arrange(RIGHT, buff=0.2).move_to(LEFT * 4.2 + DOWN * 0.2)',
                '        llm_r = RoundedRectangle(corner_radius=0.25, height=2.6, width=2.2, color=PURPLE_B, fill_color="#241432", fill_opacity=0.95).move_to(LEFT*0.5 + DOWN*0.2)',
                '        llm_lbl = VGroup(Text("MODEL", font_size=26, color=PURPLE_A, weight=BOLD), Text("Neural Engine", font_size=14, color=GRAY_B)).arrange(DOWN, buff=0.15).move_to(llm_r)',
                '        in_arr = Arrow(t_boxes.get_right(), llm_r.get_left(), buff=0.15, color=BLUE_B)',
                f'        self.play(LaggedStart(*[FadeIn(b) for b in t_boxes], lag_ratio=0.2), Create(llm_r), FadeIn(llm_lbl), GrowArrow(in_arr), run_time={t_in:.2f})',
                f'        items = {items_json}',
                '        colors = [TEAL_C, ORANGE, YELLOW_D, RED_E, BLUE_C]',
                '        bars = VGroup()',
                '        for i, item in enumerate(items[:4]):',
                '            col = colors[i % len(colors)]',
                '            w_txt = Text(f\'"{item.get("word", "")}"\', font_size=20, color=WHITE).set_width(1.1)',
                '            b_rect = Rectangle(height=0.35, width=max(0.3, item.get("prob", 0.1) * 3.5), color=col, fill_color=col, fill_opacity=0.85).align_to(ORIGIN, LEFT)',
                '            pct = Text(f"{int(item.get(\'prob\', 0)*100)}%", font_size=18, color=col).next_to(b_rect, RIGHT, buff=0.15)',
                '            bars.add(VGroup(w_txt, b_rect, pct).arrange(RIGHT, buff=0.2))',
                '        bars.arrange(DOWN, buff=0.25, aligned_edge=LEFT).move_to(RIGHT * 3.5 + DOWN * 0.2)',
                f'        self.play(LaggedStart(*[FadeIn(row, shift=LEFT*0.2) for row in bars], lag_ratio=0.3), run_time={t_bars:.2f})',
                f'        choice_box = SurroundingRectangle(bars[0], buff=0.12, color=YELLOW, stroke_width=3)',
                f'        choice_lbl = Text("Selected: {sampled}", font_size=22, color=YELLOW, weight=BOLD).next_to(bars, DOWN, buff=0.4)',
                f'        self.play(Create(choice_box), FadeIn(choice_lbl, shift=UP*0.2), run_time={t_high:.2f})',
                f'        self.wait({t_wait:.2f})',
                f'        self.play(FadeOut(Group(*self.mobjects)), run_time={t_out:.2f})'
            ])

        elif sc_type == "vector_embeddings":
            header = sc.get("header", "Vectors & Semantic Space")
            context = sc.get("context", "Context: Shifting Meaning")
            main_word = sc.get("main_word", "Target")
            target_cluster = sc.get("attractor", "Attractor")

            t_head = min(2.0, dur * 0.12)
            t_axes = min(3.0, dur * 0.18)
            t_attract = min(3.5, dur * 0.25)
            t_out = min(1.5, dur * 0.1)
            t_wait = max(0.5, dur - (t_head + t_axes + t_attract + t_out))

            code_lines.extend([
                f'        head = Text("{header}", font_size=36, color=TEAL_B, weight=BOLD).to_edge(UP, buff=0.7)',
                f'        self.play(Write(head), run_time={t_head:.2f})',
                '        axes = Axes(x_range=[-4, 4, 1], y_range=[-2.5, 2.5, 1], x_length=7.5, y_length=4.2, axis_config={"color": GREY_D, "stroke_width": 2}).shift(DOWN*0.3)',
                '        dot_a = Dot(axes.c2p(2.2, 1.2), color=YELLOW, radius=0.1)',
                f'        lbl_a = Text("{main_word}", font_size=20, color=YELLOW, weight=BOLD).next_to(dot_a, DOWN, buff=0.1)',
                '        mob_a = VGroup(dot_a, lbl_a)',
                '        dot_b = Dot(axes.c2p(-2.2, -1.0), color=BLUE_B, radius=0.1)',
                f'        lbl_b = Text("{target_cluster}", font_size=20, color=BLUE_B, weight=BOLD).next_to(dot_b, UP, buff=0.1)',
                '        mob_b = VGroup(dot_b, lbl_b)',
                f'        self.play(Create(axes), FadeIn(mob_a), FadeIn(mob_b), run_time={t_axes:.2f})',
                f'        card = RoundedRectangle(corner_radius=0.15, height=0.6, width=6.5, color=BLUE_D, fill_color="#101e30", fill_opacity=0.9).to_edge(UP, buff=1.8)',
                f'        card_txt = Text(\'{context}\', font_size=18, color=WHITE).move_to(card)',
                '        attn_line = DashedLine(dot_b.get_center(), dot_a.get_center(), color=YELLOW_B, stroke_width=3)',
                '        self.play(FadeIn(VGroup(card, card_txt)), Create(attn_line), run_time=1.5)',
                '        new_pos = axes.c2p(-1.4, -0.8)',
                f'        self.play(mob_a.animate.move_to(new_pos), FadeOut(attn_line), run_time={t_attract:.2f})',
                '        self.play(Indicate(mob_a, color=TEAL_A), run_time=1.2)',
                f'        self.wait({t_wait:.2f})',
                f'        self.play(FadeOut(Group(*self.mobjects)), run_time={t_out:.2f})'
            ])

        elif sc_type == "feedback_loop":
            header = sc.get("header", "The Auto-Regressive Loop")
            scale_text = sc.get("scale", "175 Billion Parameters")
            step_text = sc.get("step", "Input -> Predict -> Append -> Repeat")

            t_step1 = min(3.0, dur * 0.22)
            t_scale = min(3.5, dur * 0.25)
            t_out = min(1.5, dur * 0.1)
            t_wait = max(0.5, dur - (t_step1 + t_scale + t_out))

            code_lines.extend([
                f'        head = Text("{header}", font_size=36, color=BLUE_B, weight=BOLD).to_edge(UP, buff=0.7)',
                '        box = RoundedRectangle(corner_radius=0.15, height=1.0, width=7.5, color=BLUE_D, fill_color="#15202e", fill_opacity=0.9).move_to(UP*1.2)',
                f'        txt = Text("{step_text}", font_size=20, color=WHITE).move_to(box)',
                '        arr = CurvedArrow(box.get_right()+RIGHT*0.2, box.get_left()+LEFT*0.2, angle=TAU/3, color=YELLOW, stroke_width=3)',
                f'        self.play(Write(head), FadeIn(VGroup(box, txt)), Create(arr), run_time={t_step1:.2f})',
                '        s_box = RoundedRectangle(corner_radius=0.2, height=1.8, width=9.2, color=PURPLE_C, fill_color="#1c1228", fill_opacity=0.95).move_to(DOWN*0.7)',
                f'        s_title = Text("{scale_text}", font_size=28, color=PURPLE_A, weight=BOLD).next_to(s_box.get_top(), DOWN, buff=0.3)',
                '        s_sub = Text("Continuous optimization across billions of connections", font_size=18, color=GRAY_B).next_to(s_title, DOWN, buff=0.2)',
                f'        self.play(FadeIn(VGroup(s_box, s_title, s_sub), shift=UP*0.3), run_time={t_scale:.2f})',
                '        self.play(Indicate(s_title, color=YELLOW), run_time=1.5)',
                f'        self.wait({t_wait:.2f})',
                f'        self.play(FadeOut(Group(*self.mobjects)), run_time={t_out:.2f})'
            ])

        elif sc_type == "quote_conclusion":
            final_title = sc.get("title", "Not Magic. Pure Mathematics.")
            quote = sc.get("quote", "Behind every output lies geometry.")
            tag = sc.get("tag", "Manim Studio Production")

            t_title = min(2.5, dur * 0.2)
            t_quote = min(2.5, dur * 0.25)
            t_out = min(1.5, dur * 0.1)
            t_wait = max(0.5, dur - (t_title + t_quote + t_out))

            code_lines.extend([
                f'        title = Text("{final_title}", font_size=40, color=BLUE_B, weight=BOLD).move_to(UP*0.8)',
                '        r1 = Rectangle(height=0.7, width=1.5, color=TEAL_C, fill_opacity=0.2).move_to(LEFT*2.8 + DOWN*0.6)',
                '        r2 = Rectangle(height=0.7, width=1.5, color=PURPLE_C, fill_opacity=0.2).move_to(DOWN*0.6)',
                '        r3 = Rectangle(height=0.7, width=1.5, color=YELLOW_C, fill_opacity=0.2).move_to(RIGHT*2.8 + DOWN*0.6)',
                '        c1 = Line(r1.get_right(), r2.get_left(), color=GRAY_C)',
                '        c2 = Line(r2.get_right(), r3.get_left(), color=GRAY_C)',
                '        geom = VGroup(r1, Text("Vectors", font_size=16, color=TEAL_B).move_to(r1), c1, r2, Text("Attention", font_size=16, color=PURPLE_B).move_to(r2), c2, r3, Text("Probability", font_size=16, color=YELLOW_B).move_to(r3))',
                f'        self.play(Write(title), FadeIn(geom, shift=UP*0.2), run_time={t_title:.2f})',
                f'        q_txt = Text(\'{quote}\', font_size=22, color=GRAY_A, slant=ITALIC).move_to(DOWN*1.8)',
                f'        badge = Text("{tag}", font_size=16, color=GRAY_C).to_edge(DOWN, buff=0.3)',
                f'        self.play(FadeIn(q_txt, shift=UP*0.2), FadeIn(badge), run_time={t_quote:.2f})',
                f'        self.wait({t_wait:.2f})',
                f'        self.play(FadeOut(Group(*self.mobjects)), run_time={t_out:.2f})'
            ])

        code_lines.append("")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(code_lines))
    return [f"StudioScene_{idx}_{sc.get('type', 'title_intro')}" for idx, sc in enumerate(scenes)]

