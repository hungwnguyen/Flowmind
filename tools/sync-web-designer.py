"""Author-only extraction of the browser design modules; no runtime build step.

Run with --source <toolkit Editor/WebGraph directory>. Custom standalone modules
remain owned by Flowmind and are never overwritten by this script.
"""
from pathlib import Path
import argparse
import re
import shutil

parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True)
args=parser.parse_args()
source=Path(args.source).resolve()
target=Path(__file__).resolve().parents[1]/'designer'
target.mkdir(exist_ok=True)

def method(text,name,body=''):
    found=re.search(r'^  (?:async )?'+name+r'\(',text,re.M)
    if not found: raise RuntimeError('Missing method '+name)
    end=re.search(r'^  (?:async )?[A-Za-z_$][\w$]*\(',text[found.end():],re.M)
    stop=found.end()+end.start() if end else text.rfind('\n}')
    return text[:found.start()]+body+text[stop:]

def studio(text):
    text=text.replace("import {bridgeClient} from './bridge-client.mjs';","import {workspace,resourceURL} from './workspace.mjs';")
    text=text.replace("import {savedUI,previewURL} from './saved-ui.mjs';","const savedUI=async()=>null; const previewURL=(map,key,fallback)=>map?.[key]||fallback;")
    text=re.sub(r"^import \{registerEditorContext.*\n",'',text,flags=re.M)
    text=text.replace("`api/media?guid=${encodeURIComponent(image.guid)}&localId=${encodeURIComponent(image.localId||'')}${revision?'&revision='+encodeURIComponent(revision):''}`","resourceURL(image.guid)")
    text=re.sub(r"const sliceMedia=image=>[^\n]+;","const sliceMedia=image=>resourceURL(image.guid);",text)
    text=text.replace("'api/ui-font?guid='+encodeURIComponent(guid)","resourceURL(guid,'font')")
    text=text.replace('layer.fillGradient,layer.image,imageMode(layer)','layer.fillGradient,layer.image,layer.image?resourceURL(layer.image.guid):null,imageMode(layer)')
    text=method(text,'api',"  async api(action,payload){return workspace.api(action,payload);}\n")
    text=method(text,'activateShell',"""  activateShell(){
    document.getElementById('reload').title='Reload saved document';
    document.getElementById('reload').setAttribute('aria-label','Reload saved document');
    document.getElementById('save').title='Save document · Ctrl/Cmd+S';
    this.paintShell();
  }
""")
    text=method(text,'deactivateShell',"""  deactivateShell(){
    this.cancelGesture();this.closeDrawers();this.root.hidden=true;
    this.tab?.remove();this.tab=null;
    this.shell.onClose?.();
  }
""")
    text=method(text,'startWebDemoBridge')
    text=text.replace('  app.startWebDemoBridge();','')
    text=method(text,'importUnity')
    text=method(text,'showInEditor')
    text=method(text,'exportSvgPro',"""  async exportSvgPro(){
    if(this.busy||this.psdExporting||this.pngExporting||this.imageFusing)return false;
    this.busy=true;this.message('Preparing portable SVGPRO…');
    try{const version=this.version,blob=await workspace.package(copy(this.doc));
      if(version!==this.version)throw Error('The document changed during export. Export again.');
      this.download(blob,this.doc.name.replace(/[<>:\"/\\\\|?*\\x00-\\x1f]/g,'_')+'.svgpro','application/vnd.vinagen.svgpro');
      this.message('Downloaded a portable copy. Save separately to update your workspace file.');return true;
    }catch(error){this.message(error,true);return false;}finally{this.busy=false;this.paintShell();}
  }
""")
    text=text.replace('this.tab.append(this.tabButton,close)','this.tab.append(this.tabButton)')
    text=text.replace('styledTextPreview,liveStyledText,','styledTextPreview,')
    text=re.sub(r"          const binding=.*?\n          this.styledPreview\?\?=",'          this.styledPreview??=',text,flags=re.S)
    text=text.replace("native:()=>this.showInEditor(),'ui-studio-open':()=>this.importUnity(),",'')
    text=text.replace("settings:()=>this.settings(),","settings:()=>this.settings(),workspace:()=>this.shell.chooseWorkspace?.(),")
    text=text.replace("this.anchorPicker(layer)","el('span')")
    text=re.sub(r"        if\(layer.canvasGroup===true\|\|layer.groupType==='canvas'\)\{\n.*?\n        \}",'',text,flags=re.S)
    text=text.replace("this.button('Add Component'","this.button('Add layout / effect'")
    text=text.replace("id:'preview'","id:'preview'")
    text=text.replace("accept:'.psd,.svgpro,.png,.jpg,.jpeg'","accept:'.psd,.svgpro,.json,.png,.jpg,.jpeg,.ttf,.otf,.woff,.woff2'")
    text=text.replace("if(/\\.svgpro$/i.test(file.name))","if(/\\.(svgpro|json)$/i.test(file.name))")
    text=text.replace("      for(const file of files){","      for(const file of files){\n        if(/\\.(ttf|otf|woff2?)$/i.test(file.name)){await workspace.importFont(file);this.config=await this.api('ui-config');this.paintAll();continue;}")
    text=text.replace('    for(const file of files) {\n      try {',"    for(const file of files) {\n      try {\n        if(/\\.(ttf|otf|woff2?)$/i.test(file.name)){await workspace.importFont(file);this.config=await this.api('ui-config');this.paintAll();this.message('Imported font '+file.name);continue;}")
    text=text.replace("'Assets path'","'Workspace-relative path'")
    text=text.replace("`${this.doc.psdImportFolder||this.config.documentFolder}/${this.doc.name.replace", "`${this.config.documentFolder}/${this.doc.name.replace")
    text=text.replace("if(this.doc.psdImportFolder&&path.startsWith('Assets/VinaGen AI Toolkit/'))path='';",'')
    text=text.replace("else if(action==='import_unity')this.importUnity();",'')
    text=text.replace("else if(action==='import_unity')await this.importUnity();",'')
    text=text.replace("if(text.trim().startsWith('Assets/')){await this.addAssetPath(text.trim(),point);return;}",'')
    text=text.replace('Retry saving when the Editor is available.','Reconnect the workspace and retry saving.')
    text=text.replace('overwrites it.','updates its copy in the document package.').replace('overwrite the file. GUID and import settings are kept.','update the document package. Original loose files stay unchanged.')
    text=text.replace('Review labels before Editor import.','Review editable text and imported fonts.')
    text=re.sub(r"      if\(!cached.hit&&cached.sourceVersions\)\{.*?\n      \}", '',text,flags=re.S)
    text=text.replace("if(await this.load(data.path,{reload:true}))this.message('Imported '+data.path+' with its UI document and assets.');else this.refreshFiles();","if(await this.load(data.path,{reload:true})){this.path='';this.revision='';this.dirty=true;this.persist();this.paintAll();this.message('Imported document and resources. Save to keep a portable copy.');}else this.refreshFiles();")
    text=text.replace("if(action==='import_unity')this.importUnity();",'')
    text=text.replace("this.config.webContextBridge","false").replace("this.config.webDemoBridge","false")
    text=text.replace("text.split('/').pop()","text.split('/').pop()")
    # No native material controls: all styled text uses browser paint.
    a=text.index("    const material=section('TMP Material')")
    b=text.index('\n  }',a)
    text=text[:a]+text[b:]
    text=text.replace("section(layer.standaloneText?'VinaGenText settings':'TextMesh Pro settings')","section('Text layout')")
    replacements={
      'Drop it into any Unity project.':'Open it in Web Designer, with its bundled resources.',
      'Unity renders this preview with the imported text component. Style values are Canvas pixels. Import creates a reusable Text Style asset.':'Text effects render locally in the browser. Save reusable styles with your document.',
      'Browse artwork from your Unity project.':'Browse artwork in your selected workspace.',
      'into the Unity project…':'into the workspace…',
      'The Editor did not provide a private PSD import folder.':'A PSD import destination could not be prepared.',
      'Saving Fusion image in Unity…':'Preparing Fusion image…',
      'Save the document to Unity.':'Save the document to your workspace.',
      'same in Unity.':'same in the browser.',
      'Save optimizes each shared source once in Unity.':'Save includes each shared image once in the document package.',
      'Borders scale down in smaller rectangles like Unity.':'Borders scale down in smaller rectangles.',
      'Imports directly under Unity Canvas at the same center as other screens':'Independent screen root',
      ' · VinaGenText':' · Styled Text',' · TMP':' · Text',
      'Add font assets in UI Designer Settings.':'Import a TTF/OTF/WOFF font using Import.',
      'Game screen':'Design canvas','Component':'Layer type',
    }
    for old,new in replacements.items():text=text.replace(old,new)
    text=text.replace("case 'import_unity':this.importUnity();break;",'')
    text+="\nexport function getUIStudio(){return app;}\n"
    return text

def transform(name,text):
    if name=='ui-studio.mjs':return studio(text)
    if name=='ui-model.mjs':
        text=text.replace('Unity group type','layout type')
        text=text.replace("[['text','Text'],['textMeshPro','TextMesh Pro'],['vinaGenText','VinaGenText']]","[['text','Text'],['vinaGenText','Styled Text']]")
        text=text.replace("layer.textRenderer==='vinaGenStyledText'", "['vinaGenStyledText','textMeshPro'].includes(layer.textRenderer)")
        text=text.replace("layer.textMeshPro===true?'textMeshPro':'text'","layer.textMeshPro===true?'vinaGenText':'text'")
        text=text.replace("[['rect','Group'],['canvas','Canvas Group'],['horizontal','Horizontal Layout Group'],['vertical','Vertical Layout Group'],['grid','Grid Layout Group']]","[['rect','Group'],['horizontal','Horizontal layout'],['vertical','Vertical layout'],['grid','Grid layout']]")
    if name=='psd-writer.mjs':
        # Flat PSD records are top-first. Grouped output carries bounding dividers,
        # so the existing reader detects its bottom-first convention explicitly.
        text=text.replace('let compressedBytes=0;','let compressedBytes=0,hasSections=false;')
        text=text.replace('const section=layer.section||0,','const section=layer.section||0;if(section)hasSections=true;const ')
        text=text.replace('...[...records].reverse(),...[...payloads].reverse().flat()', '...(hasSections?[...records].reverse():records),...(hasSections?[...payloads].reverse():payloads).flat()')
    if name=='file-browser.mjs':text=text.replace("root.replaceChildren(switcher,controls,","root.replaceChildren(controls,")
    if name=='ui-components.mjs':
        text=re.sub(r'    \{\n      id: "tmp",.*?\n    \},\n','',text,flags=re.S)
        text=text.replace('VinaGenText','Styled Text').replace('Rect Mask 2D','Clip children').replace('Add Component','Add layout / effect')
    if name=='project-assets.mjs':
        text="import {resourceURL} from './workspace.mjs';\n"+text
        text=re.sub(r'const source = \(image\) =>\s*`[^`]+`;','const source = image => resourceURL(image.guid);',text)
        text=text.replace('(folder === "Assets" || folder.startsWith("Assets/"))','(!folder.startsWith("/") && !folder.includes(":"))')
        text=text.replace('Choose the project Assets folder or a folder inside it.','Choose a folder inside your workspace.')
    if name in ['ui-screen-capture.mjs','ui-psd-export.mjs','ui-image-resize.mjs']:
        text="import {resourceURL} from './workspace.mjs';\n"+text
        text=text.replace("'api/ui-font?guid='+encodeURIComponent(guid)","resourceURL(guid,'font')")
        text=text.replace("'api/ui-font?guid='+encodeURIComponent(match[1])","resourceURL(match[1],'font')")
        text=re.sub(r'source.src=`api/ui-source-image[^`]+`;','source.src=resourceURL(image.guid);',text)
        text=text.replace('Unity text preview','Text preview')
    if name=='web-errors.mjs':
        text=text.replace('Unity Editor','workspace').replace('Unity is','Workspace is').replace('bridge connection','local workspace').replace('Editor bridge','workspace').replace('Unity','Workspace')
        text=re.sub(r"const connectionMessage = '[^']*';","const connectionMessage = 'A local resource could not load. Reconnect the folder or reimport the source file; your draft is retained.';",text)
    if name=='ui-layer-menu.mjs':
        text=text.replace('Import as popup','Independent screen root').replace('Imports this parent and its children directly under Unity Canvas, centered with the other popups.','Treats this parent and its children as an independent design screen.')
    if name=='preferences.js':text=text.replace('vinagen-graph-preferences:v1','vinagen-web-preferences:v1')
    if name=='editor-context.mjs':
        text=text[text.index('export function captureIdentity'):]
        text="export const editorTabId=crypto.randomUUID();\n"+text
    if name=='ui-styled-text.mjs':
        text=text[:text.index('// Live updates have their own queue')]
    return text

custom={'workspace.mjs','zip.mjs','web-text.mjs','idb.mjs','ui-project-cache.mjs'}
queue=['ui-studio.mjs','preferences.js','editor.css','workspace-controls.css']
seen=set()
while queue:
    name=queue.pop()
    if name in seen or name in custom:continue
    seen.add(name)
    file=source/name
    if not file.is_file():raise RuntimeError('Missing source module '+name)
    text=transform(name,file.read_text(encoding='utf-8'))
    (target/name).write_text('\n'.join(line.rstrip() for line in text.splitlines())+'\n',encoding='utf-8')
    for dependency in re.findall(r"(?:from\s*|import\s*\(|new URL\(|@import\s*url\()['\"]\./([^'\"]+)['\"]",text):
        if dependency.endswith(('.mjs','.css','.js')):queue.append(dependency)
    if name=='ui-studio.mjs':queue+=['ui-studio.css','ui-psd-export.mjs','ui-screen-capture.mjs','psd-worker.mjs']

fonts=source.parents[1]/'VinaTextPro'/'Fonts'/'GoogleFonts'
(target/'fonts').mkdir(exist_ok=True)
for original,name in [('Inter[opsz,wght].ttf','Inter.ttf'),('inter-OFL.txt','Inter-OFL.txt')]:
    if name.endswith('.txt'):
        (target/'fonts'/name).write_text('\n'.join(line.rstrip() for line in (fonts/original).read_text(encoding='utf-8').splitlines())+'\n',encoding='utf-8')
    else:shutil.copyfile(fonts/original,target/'fonts'/name)
shutil.copyfile(source.parents[1]/'Images'/'robot.png',target/'robot.png')
print('Copied',len(seen),'browser modules/styles into',target)
