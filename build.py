"""Validate and package the dependency-free static portfolio."""
from html.parser import HTMLParser
from pathlib import Path
from shutil import copy2, copytree

ROOT = Path(__file__).resolve().parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            assert values["id"] not in self.ids, "Duplicate element ID"
            self.ids.add(values["id"])
        for key in ("href", "src"):
            if key in values:
                self.links.append(values[key])


page = Page()
page.feed((ROOT / "index.html").read_text(encoding="utf-8"))
for link in page.links:
    if link.startswith("#"):
        assert link[1:] in page.ids, f"Missing anchor: {link}"
    elif not link.startswith(("https:", "mailto:")):
        assert (ROOT / link).is_file(), f"Missing asset: {link}"

output = ROOT / "dist"
output.mkdir(exist_ok=True)
for name in ("index.html", "styles.css", "script.js"):
    copy2(ROOT / name, output / name)
if (ROOT / "assets").is_dir():
    copytree(ROOT / "assets", output / "assets", dirs_exist_ok=True)
print("Static build complete. All internal links and local assets validated.")
