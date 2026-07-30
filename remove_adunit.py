import re

path = "src/legacy/Home.js"
with open(path, "r") as f:
    content = f.read()

original = content

# Remove standalone <AdUnit ... /> blocks (self-closing tags)
# This matches <AdUnit followed by anything (non-greedy) up to the first />
pattern = re.compile(r"<AdUnit\b[^/]*?/>", re.DOTALL)
matches = pattern.findall(content)
print(f"Found {len(matches)} <AdUnit ... /> block(s)")

content = pattern.sub("", content)

# Now clean up the now-empty {showInFeedAd && ( )} wrapper if it exists
wrapper_pattern = re.compile(r"\{showInFeedAd\s*&&\s*\(\s*\)\}")
content, count = wrapper_pattern.subn("", content)
print(f"Removed {count} now-empty showInFeedAd wrapper(s)")

if content == original:
    print("WARNING: No changes made. File is unchanged.")
else:
    with open(path, "w") as f:
        f.write(content)
    print("File updated successfully.")
