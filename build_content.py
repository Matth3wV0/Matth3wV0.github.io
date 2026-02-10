#!/usr/bin/env python3
"""
Build script for Markdown content management system.
Scans content/ folder, parses Markdown files with YAML frontmatter,
and generates content.json for the portfolio website.
"""

import os
import json
import re
from pathlib import Path

# Optional dependencies - will work without them but with reduced functionality
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False
    print("Warning: PyYAML not installed. Using basic YAML parser.")

try:
    import markdown
    HAS_MARKDOWN = True
except ImportError:
    HAS_MARKDOWN = False
    print("Warning: markdown not installed. Using basic Markdown parser.")


def parse_yaml_basic(yaml_str: str) -> dict:
    """Basic YAML parser for simple frontmatter without PyYAML."""
    result = {}
    current_key = None
    current_list = None
    indent_level = 0
    
    for line in yaml_str.strip().split('\n'):
        if not line.strip():
            continue
            
        # Check for list item
        if line.strip().startswith('- '):
            if current_list is not None:
                value = line.strip()[2:].strip().strip('"').strip("'")
                # Handle dict items in list
                if ':' in value and not value.startswith('{'):
                    parts = value.split(':', 1)
                    if isinstance(current_list, list) and len(current_list) > 0 and isinstance(current_list[-1], dict):
                        current_list[-1][parts[0].strip()] = parts[1].strip().strip('"').strip("'")
                    else:
                        current_list.append({parts[0].strip(): parts[1].strip().strip('"').strip("'")})
                else:
                    current_list.append(value)
            continue
            
        # Check for key-value pair
        if ':' in line:
            parts = line.split(':', 1)
            key = parts[0].strip()
            value = parts[1].strip()
            
            if value == '' or value == '|':
                # Start of list or multiline
                current_key = key
                current_list = []
                result[key] = current_list
            else:
                # Simple key-value
                value = value.strip('"').strip("'")
                if value.lower() == 'true':
                    value = True
                elif value.lower() == 'false':
                    value = False
                elif value.isdigit():
                    value = int(value)
                result[key] = value
                current_key = None
                current_list = None
                
    return result


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Extract YAML frontmatter and body from Markdown content."""
    if not content.startswith('---'):
        return {}, content
    
    # Find the closing ---
    end_match = re.search(r'\n---\s*\n', content[3:])
    if not end_match:
        return {}, content
    
    yaml_str = content[3:end_match.start() + 3]
    body = content[end_match.end() + 3:]
    
    if HAS_YAML:
        try:
            metadata = yaml.safe_load(yaml_str)
        except yaml.YAMLError as e:
            print(f"YAML parse error: {e}")
            metadata = parse_yaml_basic(yaml_str)
    else:
        metadata = parse_yaml_basic(yaml_str)
    
    return metadata or {}, body


def markdown_to_html(md_content: str) -> str:
    """Convert Markdown to HTML."""
    if HAS_MARKDOWN:
        md = markdown.Markdown(extensions=['tables', 'fenced_code', 'codehilite'])
        return md.convert(md_content)
    else:
        # Basic conversion without library
        html = md_content
        # Headers
        html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
        # Bold
        html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
        # Code
        html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
        # Images
        html = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1">', html)
        # Links
        html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
        # Paragraphs
        html = re.sub(r'\n\n+', '</p><p>', html)
        html = f'<p>{html}</p>'
        return html


def fix_image_paths(html: str, lang: str) -> str:
    """Fix relative image paths for web serving."""
    # Convert ../../assets to assets (relative to root)
    html = re.sub(r'src="\.\.\/\.\.\/assets/', 'src="assets/', html)
    html = re.sub(r'src="\.\.\/assets/', 'src="assets/', html)
    return html


def scan_content_files(content_dir: Path) -> dict:
    """Scan content directory and organize files by type and language."""
    files = {
        'projects': {'en': [], 'vi': []},
        'writeups': {'en': [], 'vi': []}
    }
    
    for content_type in ['projects', 'writeups']:
        type_dir = content_dir / content_type
        if not type_dir.exists():
            continue
            
        for lang in ['en', 'vi']:
            lang_dir = type_dir / lang
            if not lang_dir.exists():
                continue
                
            for md_file in lang_dir.glob('*.md'):
                files[content_type][lang].append(md_file)
    
    return files


def build_content(content_dir: Path) -> dict:
    """Build the content.json structure from Markdown files."""
    files = scan_content_files(content_dir)
    result = {
        'projects': [],
        'writeups': []
    }
    
    # Process projects
    project_map = {}  # id -> project data
    for lang in ['en', 'vi']:
        for file_path in files['projects'][lang]:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            metadata, body = parse_frontmatter(content)
            if not metadata.get('id'):
                print(f"Warning: No id in {file_path}")
                continue
            
            proj_id = metadata['id']
            html_content = markdown_to_html(body)
            html_content = fix_image_paths(html_content, lang)
            
            if proj_id not in project_map:
                project_map[proj_id] = {
                    'id': proj_id,
                    'title': {},
                    'description': {},
                    'category': metadata.get('category', ''),
                    'icon': metadata.get('icon', ''),
                    'color': metadata.get('color', 'gray'),
                    'tags': metadata.get('tags', []),
                    'stats': [],
                    'hasModal': metadata.get('hasModal', False),
                    'span': metadata.get('span', 1),
                    'github': metadata.get('github', ''),
                    'video': metadata.get('video', ''),
                    'order': metadata.get('order', 999),
                    'content': {}
                }
            
            project_map[proj_id]['title'][lang] = metadata.get('title', '')
            project_map[proj_id]['description'][lang] = metadata.get('description', '')
            project_map[proj_id]['content'][lang] = html_content
            
            # Stats with language support
            if metadata.get('stats'):
                if not project_map[proj_id]['stats']:
                    project_map[proj_id]['stats'] = []
                for i, stat in enumerate(metadata['stats']):
                    if len(project_map[proj_id]['stats']) <= i:
                        project_map[proj_id]['stats'].append({'value': stat.get('value', ''), 'label': {}})
                    project_map[proj_id]['stats'][i]['label'][lang] = stat.get('label', '')
    
    result['projects'] = sorted(project_map.values(), key=lambda x: x['order'])
    
    # Process writeups
    writeup_map = {}
    for lang in ['en', 'vi']:
        for file_path in files['writeups'][lang]:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            metadata, body = parse_frontmatter(content)
            if not metadata.get('id'):
                print(f"Warning: No id in {file_path}")
                continue
            
            writeup_id = metadata['id']
            html_content = markdown_to_html(body)
            html_content = fix_image_paths(html_content, lang)
            
            if writeup_id not in writeup_map:
                writeup_map[writeup_id] = {
                    'id': writeup_id,
                    'title': {},
                    'description': {},
                    'category': metadata.get('category', ''),
                    'event': metadata.get('event', ''),
                    'flag': metadata.get('flag', ''),
                    'mitre': metadata.get('mitre', []),
                    'order': metadata.get('order', 999),
                    'content': {}
                }
            
            writeup_map[writeup_id]['title'][lang] = metadata.get('title', '')
            writeup_map[writeup_id]['description'][lang] = metadata.get('description', '')
            writeup_map[writeup_id]['content'][lang] = html_content
    
    result['writeups'] = sorted(writeup_map.values(), key=lambda x: x['order'])
    
    return result


def main():
    """Main entry point."""
    script_dir = Path(__file__).parent
    content_dir = script_dir / 'content'
    output_file = script_dir / 'content.json'
    
    if not content_dir.exists():
        print(f"Error: Content directory not found: {content_dir}")
        return 1
    
    print(f"Scanning content in: {content_dir}")
    result = build_content(content_dir)
    
    print(f"Found {len(result['projects'])} projects, {len(result['writeups'])} writeups")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"Generated: {output_file}")
    return 0


if __name__ == '__main__':
    exit(main())
