"""Author-only copy of the local VinaGen browser editor's SVG icon paths."""
from pathlib import Path
import argparse
import re

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
source = Path(parser.parse_args().source) / 'editor.js'
text = source.read_text(encoding='utf-8')
paths = re.search(r'const iconPaths = (\{.*?\n\});', text, re.S)
if not paths:
    raise RuntimeError('Local editor icon paths were not found')
target = Path(__file__).resolve().parents[1] / 'tools' / 'designer-source' / 'icons.mjs'
target.write_text("""// SVG paths shared with the Unity-hosted local browser editor.
// No icon fonts, network dependencies or raster approximations.
import {canvasToolIcons} from './canvas-tools.mjs';
export const iconPaths = """ + paths.group(1) + """;
iconPaths.demo='M8 4l12 8-12 8z';
export function icon(name){
  const ns='http://www.w3.org/2000/svg',root=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
  root.setAttribute('viewBox','0 0 24 24');root.setAttribute('class','ui-icon');root.setAttribute('aria-hidden','true');root.setAttribute('focusable','false');root.dataset.icon=name;
  path.setAttribute('d',iconPaths[name]||iconPaths.frame);root.append(path);return root;
}
""", encoding='utf-8')
print('Copied local SVG icons to', target)
