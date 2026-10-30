"""
Regenerates src/content/legal/{privacy,cookies}-content.ts from
docs/legal/privacy-cookie-policies-draft3.md.
Usage: python scripts/build-legal-content.py <repo-root>
"""
import os, re, sys
repo = sys.argv[1] if len(sys.argv) > 1 else "."
md_path = os.path.join(repo, "docs", "legal", "privacy-cookie-policies-draft3.md")
with open(md_path, encoding="utf-8") as f:
    md = f.read()
parts = md.split("# Part B")
part_a = re.sub(r"^# Part A — Privacy Policy\r?\n", "", parts[0])
part_b = re.sub(r"^# Part B — Cookie Policy\r?\n", "", "# Part B" + parts[1])
def lit(t):
    return "`" + t.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${") + "`"
for name, part in [("privacy", part_a), ("cookies", part_b)]:
    const = "PRIVACY" if name == "privacy" else "COOKIES"
    out = f"export const {const}_MARKDOWN: string = {lit(part)};\n"
    d = os.path.join(repo, "src", "content", "legal")
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f"{name}-content.ts"), "w", encoding="utf-8") as f:
        f.write(
            "/**\n"
            " * GENERATED from docs/legal/privacy-cookie-policies-draft3.md — do not edit by hand.\n"
            " * Re-run scripts/build-legal-content.py when the source markdown changes.\n"
            " */\n" + out
        )
    print("wrote", name)
