import os
import json

history_dir = os.path.expandvars('%APPDATA%/Code/User/History')
found_files = []
if os.path.exists(history_dir):
    for root, dirs, files in os.walk(history_dir):
        if 'entries.json' in files:
            with open(os.path.join(root, 'entries.json'), 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    if 'resource' in data and 'SchoolExamPage.tsx' in data['resource']:
                        found_files.append((data['resource'], root, data['entries']))
                except:
                    pass

for resource, root, entries in found_files:
    print(f'Found {resource} in {root}')
    for entry in entries:
        print(f"  Entry {entry.get('id')} at {entry.get('timestamp')}")
