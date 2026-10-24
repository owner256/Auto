# AGENTS.md — Working Rules for AI & Developers

**Package:** ZCLE Studio (`26.10.24.00/Standard`)  
**Scope:** Developer & AI Agent Operations, Change Discipline, Safety, and SSOT Protocol.

---

## 1. Core Operating Philosophy

1. **Student-First Technical Honesty:**
   - Visuals should clarify logic, not distract with flashy but meaningless animations.
   - Analogy ko explicitly "simplified model" label kiya jaaye (e.g. CPU as a brain analogy).
2. **Deterministic Time-Coded Rendering:**
   - Har animation visual timestamp (`localMs` / `audio.currentTime`) par exactly reproducible hona chahiye. Seeking backwards or forwards should never cause desync.
3. **No Breaking Changes:**
   - Structure improve karte waqt actual working code ko delete ya disable mat karo. Existing browser pilot hamesha double-click par run hona chahiye.

---

## 2. Reading Sequence for New AI Agents

Jab koi naya AI model ya developer context start kare, to use isi sequence mein files read karni hain:

```text
1. AGENTS.md                   (Ye operating protocol aur boundary rules)
   ↓
2. Memory/README.md            (Memory architecture index)
   ↓
3. Memory/Decisions.md         (Past approved technical decisions)
   ↓
4. Memory/Current-Status.md    (Present state: Done, In-Progress, Blocked)
   ↓
5. Planning/ & Docs/           (Specs, blueprints & schemas)
   ↓
6. Dev/Studio_App/             (Authoritative source code, tools & tests)
   ↓
7. Memory/Next-Tasks.md        (Next pending tasks to execute)
```

---

## 3. Communication & Code Standards

- **Language Policy:** 
  - Documentation and discussions: **Roman Hinglish** (Clear, professional, no slang).
  - Code, variables, schemas, JSON keys, and comments: **English**.
- **File System Safety:**
  - Hardcoded absolute paths strictly avoid karein; relative paths use karein taaki kisi bhi environment mein bina error chale.
  - Windows backslashes (`\`) vs POSIX slashes (`/`) ka dhyan rakhein; code mein web URLs ke liye forward slash (`/`) use karein.
- **Git & Changes Policy:**
  - Har significant architecture modification ke sath `Memory/Decisions.md` aur `Memory/Current-Status.md` update hona mandatory hai.
  - Secrets, API keys ya temporary binaries repo mein commit na hon.

---

## 4. Single Source of Truth (SSOT) Hierarchy

| Domain | Authoritative Location |
|---|---|
| AI Rules & Guardrails | `AGENTS.md` |
| Project History & Status | `Memory/` |
| Feature Specifications | `Docs/` |
| Timeline & Scene Data | `Dev/Studio_App/specs/course.cpu.json` |
| Executable Source Code | `Dev/Studio_App/` |

