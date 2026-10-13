import {roles,groupTypes,canonicalRole,reflowGroups,anchorPresets,anchorRange,imageModes,imageMode,setImageMode,sliceImageRects,copy,uid,newDocument,newLayer,validateDocument,descendants,layerIndex,roots,duplicate,groupLayers,worldRect,layerDropPlan,moveLayers,autoLayout,shortcutMatches,alignLayers,imagePlacement,canvasBounds,resizeLayerRect,rotatePoint,moveSnapContext,snapMove} from './ui-model.mjs';
import {tmpSettingNumbers,tmpWebMaterialMetrics,layerHierarchy,layerHitStack,marqueeLayerIds,imageSourcePoint,snapResize,scaleLayerTree,sliceExportLayers} from './ui-model.mjs';
import {textRenderers,textRenderer,setTextRenderer,blendModes} from './ui-model.mjs';
import {nextLayerId,selectLayerIds,layerActionIds} from './operations.mjs';
import {paintDocumentSaveState,saveUIDocumentDraft} from './save-status.mjs';
import {loadProgress} from './load-progress.mjs';
const savedUI=async()=>null; const previewURL=(map,key,fallback)=>map?.[key]||fallback;
import {shapeTools,paintShape,shapeHit,isOpenShape,shapeStrokeWidth,shapePaintBindings,setShapeType} from './ui-shapes.mjs';
import {containerRoles,parentRoles,automaticAnchor,adjustAnchors,recalculateAnchors,worldPose,screenSized,isScreenRoot,screenAnchors} from './ui-model.mjs';
import {projectAssets} from './project-assets.mjs';
import {workspace,resourceURL} from './workspace.mjs';
import {webErrorReport} from './web-errors.mjs';
import {fileBrowser} from './file-browser.mjs';
import {paintURL,imagePaintFilter} from './ui-paints.mjs';
import {paintTextCurve} from './ui-text-curve.mjs';
import {detectSliceBorders,sliceMinimum} from './ui-slice.mjs';
import {imageResizeTarget,loadSourceImage,resampleImage,blobBase64,maxResizedImageBytes} from './ui-image-resize.mjs';
import {textStyleDefaults,resolvedTextStyle,textEffectEnabled,setTextEffect,styledTextPreview,validateTextStyle,textPaintSignature,importedTextPaint} from './ui-styled-text.mjs';
import {gradientAlphaStops,evaluateTextGradient,textGradientRamp,textGradientPresets} from './ui-paints.mjs';
import {canvasComments,commentIcon} from './canvas-comments.mjs';
import {toolGroup} from './canvas-tools.mjs';
import {layerMenu} from './ui-layer-menu.mjs';
import {imageFusionState,fusionHash,applyImageFusion,insertPSDDocument} from './ui-layer-actions.mjs';
import {componentPicker} from './ui-components.mjs';
import {scrubNumber} from './number-scrub.mjs';
import {psdFallbackFonts,applyPSDFallbackFont} from './psd-text.mjs';
import {cacheKey,projectCache,restoreProjectDraft} from './ui-project-cache.mjs';

import {html as el,reconcileInspector} from './dom-controls.mjs';
import {dialogShell} from './popup-shell.mjs';
// Update size rewrites a source file in place; its new revision busts browser image caches for every layer and undo state.
const resizedSources=new Map();
const media=image=>{
  if(!image)return '';
  const key=`${image.guid}:${image.localId||''}`,cache=app?.psdPaints,local=cache?.document===app?.doc&&cache?.images.get(key),revision=resizedSources.get(image.guid)||image.revision||'';
  return (local&&local.revision===revision&&local.url)||previewURL(app?.preview?.media,key,resourceURL(image.guid));
};
const sliceMedia=image=>resourceURL(image.guid);
let app;
export function prepareUIStudio() {
  let style=document.querySelector('link[data-ui-style]');
  if(!style){style=el('link',{rel:'stylesheet',href:'ui-studio.css','data-ui-style':''});style.ready=new Promise((resolve,reject)=>{style.onload=resolve;style.onerror=()=>reject(Error('UI Designer stylesheet could not load. Reload the editor.'));});document.head.append(style);}
  return style.ready;
}
export async function openUIStudio(shell={}) {
  const requestedPath=new URL(location.href).searchParams.get('uiPath');
  await prepareUIStudio();
  if(!app) {app=new Studio(shell);document.body.append(app.root);}
  document.body.dataset.workspace='ui';app.root.hidden=false;
  document.querySelector('body > main').inert=true;app.activateShell();
  document.title='VinaGen · UI Designer';
  if(!app.ready) await app.start(requestedPath);
  else if(!app.busy) {app.refreshConfig();}
  if(requestedPath&&requestedPath!==app.path&&!app.missingDocuments?.has(requestedPath))await app.load(requestedPath);
  if(shell.sidebar)app.setSidebar(shell.sidebar);
  app.paintShell();app.viewport.focus();app.paint();

}
class Studio {
  constructor(shell) {
    this.shell=shell;
    this.doc=newDocument();this.selected=new Set();this.elements=new Map();this.undo=[];this.redo=[];this.pan={x:100,y:90};this.zoom=.45;this.tool='select';this.snap=true;this.path='';this.revision='';this.guid='';this.token='';this.clipboard=null;this.busy=false;this.version=0;this.ready=false;
    this.root=el('section',{class:'ui-studio','aria-label':'UI Designer',hidden:''});
    const workspace=el('div',{class:'ui-workspace'});this.root.append(workspace);
    this.left=el('aside',{class:'ui-left'});workspace.append(this.left);
    const heading=el('div',{class:'project-heading'});heading.append(this.icon('folder'),el('strong',{},shell.project||'project'),el('span',{class:'local-badge'},'LOCAL'));this.left.append(heading);
    this.docName=el('input',{class:'ui-document-name','aria-label':'Document name',value:this.doc.name,onchange:e=>this.edit(()=>{this.doc.name=e.target.value || 'Untitled screen';})});
    this.documentList=el('select',{'aria-label':'Open UI document',hidden:true,onchange:e=>this.load(e.target.value)});
    const documentHeading=el('div',{class:'document-heading'});documentHeading.append(this.docName,this.iconButton('plus','New screen',()=>this.newScreen()));this.left.append(documentHeading,this.documentList);
    this.sidebarTabs=el('div',{class:'panel-tabs',role:'tablist','aria-label':'UI sidebar'});this.left.append(this.sidebarTabs);
    this.sidebarPanels=new Map();
    for(const name of ['Files','Layers','Assets']){const button=this.button(name,()=>this.setSidebar(name));button.setAttribute('role','tab');button.dataset.panel=name;this.sidebarTabs.append(button);const panel=el('div',{class:'ui-sidebar-content','data-panel':name});this.sidebarPanels.set(name,panel);this.left.append(panel);}
    this.filesPanel=this.sidebarPanels.get('Files');
    this.files=fileBrowser({root:this.filesPanel,mode:'ui',icon:name=>this.icon(name),ids:{search:'ui-file-search',list:'ui-files'},
      onSwitch:()=>this.suspend().catch(error=>this.message(error,true)),
      onOpen:async doc=>{if(await this.load(doc.path)){this.setSidebar('Layers');this.closeDrawers();}},
      actions:[{label:'New screen',icon:'plus',primary:true,run:()=>this.newScreen().catch(error=>this.message(error,true))}]});
    this.search=el('input',{placeholder:'Search layers','aria-label':'Search layers',oninput:()=>this.paintLayers()});
    const searchField=el('label',{class:'search-field'});searchField.append(this.icon('search'),this.search);
    this.layerList=el('div',{class:'ui-layer-list',role:'tree',tabindex:0,'aria-label':'Layers','aria-multiselectable':'true'});
    this.layerRootDrop=el('div',{class:'ui-layer-root-drop',role:'group','aria-label':'Screen root drop target'},'Drop here to move to Screen');
    this.layerRootDrop.ondragover=e=>this.layerDragOver(e,this.layerRootDrop,'','inside');this.layerRootDrop.ondrop=e=>this.layerDrop(e,'','inside');
    this.layerRootDrop.ondragleave=()=>this.layerRootDrop.removeAttribute('data-drop');
    const layerHeading=el('div',{class:'ui-layers-heading'});this.collapseLayersButton=this.iconButton('chevron','Collapse all layers',()=>this.collapseAllLayers());layerHeading.append(el('strong',{},'Layers'),this.collapseLayersButton);
    this.sidebarPanels.get('Layers').append(searchField,layerHeading,this.layerList,this.layerRootDrop);
    this.status=el('div',{class:'ui-status',role:'status'},'Ready');
    this.copyErrorButton=this.button('Copy error',()=>this.copyError());this.copyErrorButton.className='ui-copy-error';this.copyErrorButton.hidden=true;this.copyErrorButton.setAttribute('aria-label','Copy error');this.copyErrorButton.title='Copy the full error message';
    const footer=el('div',{class:'ui-left-footer'});footer.append(el('span',{class:'status-dot'}),this.status,this.copyErrorButton);this.left.append(footer);
    this.loadProgress=loadProgress(footer);
    this.viewport=el('div',{class:'ui-viewport',tabindex:0,'aria-label':'UI design canvas'});workspace.append(this.viewport);
    this.world=el('div',{class:'ui-world'});this.board=el('div',{class:'ui-board'});this.world.append(this.board);this.viewport.append(this.world);
    this.overlay=el('div',{class:'ui-selection-overlay'});this.viewport.append(this.overlay);
    this.selectionGuides=el('div',{class:'ui-selection-guides',hidden:true,'aria-hidden':'true'});
    for(const direction of ['top','left','right','bottom']){const line=el('div',{class:'ui-selection-guide','data-guide-direction':direction});line.append(el('span',{class:'ui-selection-guide-label'}));this.selectionGuides.append(line);}this.overlay.append(this.selectionGuides);
    this.hoverBox=el('div',{class:'ui-hover-box',hidden:true,'aria-hidden':'true'});this.overlay.append(this.hoverBox);
    this.marquee=el('div',{class:'ui-selection-marquee',hidden:true,'aria-hidden':'true'});this.overlay.append(this.marquee);
    this.viewbar=el('div',{class:'ui-viewbar canvas-controls'});this.zoomLabel=el('span',{class:'zoom-label'},'45%');
    this.undoButton=this.iconButton('undo','Undo',()=>this.history(-1));this.redoButton=this.iconButton('redo','Redo',()=>this.history(1));
    this.snapButton=this.iconButton('grid','Snap: on',()=>window.VinaGenUserPreferences.update({grid:!this.snap}));
    this.viewbar.append(this.undoButton,this.redoButton,el('i',{class:'tool-divider'}),this.iconButton('minus','Zoom out',()=>this.changeZoom(this.zoom/1.2)),this.zoomLabel,this.iconButton('plus','Zoom in',()=>this.changeZoom(this.zoom*1.2)),this.iconButton('fit','Fit screen',()=>this.fit()),this.snapButton);this.viewport.append(this.viewbar);
    this.toolbar=el('div',{class:'ui-toolbar floating-tools',role:'toolbar','aria-label':'Design tools'});
    this.moveTools=toolGroup({label:'Move tools',items:[['select','cursor','Move','V'],['pan','hand','Hand tool','H'],['scale','scale','Scale','K']],mode:'select',icon:name=>this.icon(name),choose:name=>this.setTool(name)});
    this.moveTool=this.moveTools.primary;this.moveMenu=this.moveTools.menu;
    this.moveTool.classList.add('icon-button');this.toolbar.append(this.moveTools.group,el('i',{class:'tool-divider'}));
    this.rootTools=toolGroup({label:'Root tools',items:[['empty','frame','Empty',''],['screen-root','frame','Screen root','']],mode:'empty',icon:name=>this.icon(name),choose:name=>this.setTool(name)});this.rootTools.primary.classList.add('icon-button');this.toolbar.append(this.rootTools.group);
    this.shapeTools=toolGroup({label:'Shape tools',items:shapeTools.map(([id,label,key])=>[id,id,label,key]),mode:'rectangle',icon:name=>this.icon(name),choose:name=>this.setTool(name),extra:{label:'Image…',shortcut:'Ctrl+Shift+K',action:()=>this.file.click()}});
    this.shapeTool=this.shapeTools.primary;this.shapeMenu=this.shapeTools.menu;
    this.shapeTool.classList.add('icon-button');this.toolbar.append(this.shapeTools.group);
    this.textTools=toolGroup({label:'Text tools',items:[['text','text','Text','T'],['text-path','text-path','Text on path','']],mode:'text',icon:name=>this.icon(name),choose:name=>this.setTool(name)});this.textTools.primary.classList.add('icon-button');
    this.toolbar.append(this.textTools.group);
    for(const [name,icon,label] of [['image','image','Image'],['button','button','Button'],['comment','comment','Comment']]){const b=this.iconButton(icon,label,()=>this.setTool(name));b.dataset.tool=name;this.toolbar.append(b);}
    this.viewport.append(this.toolbar);
    this.comments=canvasComments({viewport:this.viewport,document:()=>this.doc,view:()=>({pan:this.pan,zoom:this.zoom}),edit:fn=>this.edit(fn),active:()=>!this.root.hidden,anchor:point=>this.commentAnchor(point),position:thread=>this.commentPosition(thread),report:text=>this.message(text,true),author:()=>this.config?.commentDisplayName});
    this.right=el('aside',{class:'ui-right'});workspace.append(this.right);
    this.right.addEventListener('numberscrubstart',e=>{if(this.busy)e.preventDefault();});
    this.right.addEventListener('wheel',e=>this.wheelNumber(e),{passive:false});
    this.backdrop=el('button',{class:'ui-drawer-backdrop',hidden:'','aria-label':'Close sidebar',onclick:()=>this.closeDrawers()});this.root.append(this.backdrop);
    this.file=el('input',{type:'file',multiple:'',accept:'.psd,.svgpro,.json,.png,.jpg,.jpeg,.ttf,.otf,.woff,.woff2',hidden:'',onchange:async()=>{await this.importFiles([...this.file.files]);this.file.value='';}});this.root.append(this.file);
    this.dialog=el('dialog',{class:'ui-dialog'});this.root.append(this.dialog);
    this.layerActions=layerMenu(this);this.contextMenu=this.layerActions.element;this.components=componentPicker(this);
    this.layerList.addEventListener('pointerdown',()=>{this.lastPick=null;});
    this.layerList.addEventListener('contextmenu',e=>this.openGroupMenu(e,e.target.closest('[data-layer-row-id]')?.dataset.layerRowId));
    this.viewport.addEventListener('contextmenu',e=>this.openGroupMenu(e,e.target.closest('[data-layer-id]')?.dataset.layerId));
    document.addEventListener('pointerdown',e=>{if(!this.contextMenu.contains(e.target))this.closeGroupMenu();});
    this.viewport.addEventListener('pointerdown',e=>this.pointerDown(e));
    this.viewport.addEventListener('pointermove',e=>this.queuePointerMove(e));
    this.viewport.addEventListener('pointerleave',()=>this.clearHover());
    this.viewport.addEventListener('pointerup',e=>this.pointerUp(e));
    this.viewport.addEventListener('pointercancel',()=>this.cancelGesture());
    this.viewport.addEventListener('lostpointercapture',e=>{if(this.gesture?.pointer===e.pointerId)this.cancelGesture();});
    this.viewport.addEventListener('wheel',e=>{if(e.target.closest('button'))return;e.preventDefault();if(e.ctrlKey||e.metaKey)this.changeZoom(this.zoom*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY);else{this.autoFit=false;this.pan.x-=e.shiftKey?e.deltaY:e.deltaX;this.pan.y-=e.shiftKey?0:e.deltaY;this.paint();}},{passive:false});
    this.viewport.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';this.viewport.classList.add('ui-drop-active');});
    this.viewport.addEventListener('dragleave',()=>this.viewport.classList.remove('ui-drop-active'));
    this.viewport.addEventListener('drop',e=>this.drop(e));
    document.addEventListener('keydown',e=>{this.updateHoverModifiers(e);this.key(e);},true);
    document.addEventListener('keyup',e=>{if(e.code==='Space')this.space=false;if(e.key===this.nudgeHold?.key)this.nudgeHold=null;this.updateHoverModifiers(e);},true);
    document.addEventListener('pointerdown',()=>{this.nudgeHold=null;},true);
    window.addEventListener('blur',()=>{this.space=false;this.nudgeHold=null;this.clearHover();this.cancelGesture();});
    window.addEventListener('focus',()=>{if(this.ready&&!this.root.hidden&&!this.busy){this.refreshConfig();this.refreshAppearance();}});
    window.addEventListener('vinagen-preferences-change',()=>this.applyAppearance());
    window.addEventListener('beforeunload',e=>{this.persistInspectorFolds();if(this.dirty){this.persist();e.preventDefault();e.returnValue='';}});
    document.querySelector('body > .topbar').addEventListener('click',e=>this.shellClick(e),true);
    this.resizeObserver=new ResizeObserver(()=>{if(this.root.hidden||!this.ready)return;const rect=this.viewport.getBoundingClientRect();if(this.autoFit)this.fit();else if(this.viewSize){this.pan.x+=(rect.width-this.viewSize.width)/2;this.pan.y+=(rect.height-this.viewSize.height)/2;this.paint();}this.viewSize={width:rect.width,height:rect.height};});this.resizeObserver.observe(this.viewport);
    this.setSidebar('Layers');
    this.applyAppearance();
    const pollFiles=async()=>{
      try{if(this.ready&&!this.root.hidden&&!document.hidden&&this.sidebar==='Files'&&!this.busy&&!this.opening&&!this.dialog.open)await this.refreshConfig();}
      finally{this.filesTimer=setTimeout(pollFiles,2000);}
    };
    this.filesTimer=setTimeout(pollFiles,2000);
  }
  applyAppearance(){
    const light=document.documentElement.dataset.theme==='light';
    for(const [property,key]of [['--canvas','canvasBackgroundColor']]){
      const color=this.appearance?.[key];
      if(!light&&color)this.viewport.style.setProperty(property,`rgba(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)},${color.a??1})`);
      else this.viewport.style.removeProperty(property);
    }
    this.snap=window.VinaGenUserPreferences.get().grid;
    this.snapButton.classList.toggle('active',this.snap);
    this.snapButton.setAttribute('aria-label','Snap: '+(this.snap?'on':'off'));
    this.snapButton.setAttribute('aria-pressed',String(this.snap));
    this.paint();
  }
  async refreshAppearance(){
    if(!this.shell.appearance||this.appearanceBusy)return;
    this.appearanceBusy=true;
    try{const data=await this.shell.appearance();if(data.viewSettings){this.appearance=data.viewSettings;this.applyAppearance();}}
    catch{/* Keep the last palette while the Editor is unavailable. */}
    finally{this.appearanceBusy=false;}
  }
  icon(name){
    const textAlignmentPaths={textAlignTop:'M4 3h16M6 7h12M6 10h8M6 13h12',textAlignMiddle:'M4 3h16M6 9h12M6 12h8M6 15h12M4 21h16',textAlignBottom:'M6 11h12M6 14h8M6 17h12M4 21h16'};
    if(!textAlignmentPaths[name]&&!['text','text-path','comment','button','rectangle','line','arrow','ellipse','polygon','star','scale','chevron','alignLeft','alignCenter','alignRight','alignTop','alignMiddle','alignBottom'].includes(name)&&this.shell.icon)return this.shell.icon(name);
    const paths={comment:commentIcon,'text-path':'M4 4h16M12 4v12M8 16h8M3 22q9-8 18 0',rectangle:'M4 4h16v16H4z',line:'M4 20L20 4',arrow:'M4 20L20 4M10 4h10v10',ellipse:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18',polygon:'M12 3L22 21H2z',star:'M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',scale:'M3 14v7h7M21 10V3h-7M3 21l7-7M21 3l-7 7',chevron:'M6 9l6 6 6-6',text:'M4 5h16M12 5v15M8 20h8M4 5v3M20 5v3',button:'M3 6h18v12H3zM8 12h8',alignLeft:'M4 3v18M8 6h12v4H8zM8 14h8v4H8z',alignCenter:'M12 3v18M4 6h16v4H4zM7 14h10v4H7z',alignRight:'M20 3v18M4 6h12v4H4zM8 14h8v4H8z',alignTop:'M3 4h18M6 8h4v12H6zM14 8h4v8h-4z',alignMiddle:'M3 12h18M6 4h4v16H6zM14 7h4v10h-4z',alignBottom:'M3 20h18M6 4h4v12H6zM14 8h4v8h-4z'};
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','ui-icon');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',textAlignmentPaths[name]||paths[name]||paths.button);svg.append(path);return svg;
  }
  iconButton(name,label,fn){const b=this.button('',fn);b.className='icon-button';b.setAttribute('aria-label',label);b.title=label;b.append(this.icon(name));return b;}
  activateShell(){
    document.getElementById('reload').title='Reload saved document';
    document.getElementById('reload').setAttribute('aria-label','Reload saved document');
    document.getElementById('save').title='Save document · Ctrl/Cmd+S';
    this.paintShell();
  }
  paintShell(){
    if(this.root.hidden)return;
    paintDocumentSaveState({save:document.getElementById('save'),status:document.getElementById('sync-state'),unsaved:this.dirty,target:'UI document'});
    const tabs=document.getElementById('document-tabs');
    for(const tab of tabs.querySelectorAll('.document-tab:not(.ui-document-tab)')){tab.classList.remove('active');tab.querySelector('[role=tab]')?.setAttribute('aria-selected','false');}
    if(!this.tab){this.tab=el('div',{class:'document-tab ui-document-tab'});this.tabButton=this.button('',async()=>{if(this.root.hidden)await this.shell.activate?.();else this.setSidebar('Layers');});this.tabButton.setAttribute('role','tab');this.tabName=el('span');this.tabButton.append(this.icon('frame'),this.tabName);const close=this.iconButton('close','Close UI Designer',async()=>{if(this.root.hidden)await this.shell.activate?.();await this.close();});close.className='close-tab';this.tab.append(this.tabButton);}
    this.tab.classList.add('active');this.tabButton.setAttribute('aria-selected','true');this.tabButton.tabIndex=0;
    if(this.tab.parentElement!==tabs)tabs.append(this.tab);this.tabName.textContent=this.doc.name+(this.dirty?' •':'');this.tabButton.title=this.path||'Unsaved UI document';
    this.undoButton.disabled=!this.undo.length;this.redoButton.disabled=!this.redo.length;
    this.board.dataset.name=this.doc.name;document.getElementById('reload').disabled=!this.path;
    if(this.ready){const url=new URL(location.href);if(this.path)url.searchParams.set('uiPath',this.path);else url.searchParams.delete('uiPath');history.replaceState(null,'',url);}
  }
  shellClick(e){
    if(this.root.hidden)return;const button=e.target.closest('button');if(!button)return;
    if(button.closest('#document-tabs')&&!button.closest('.ui-document-tab')){
      const path=button.closest('[data-graph-path]')?.dataset.graphPath;if(!path)return;
      e.preventDefault();e.stopImmediatePropagation();
      Promise.resolve(button.classList.contains('close-tab')?this.shell.closeGraph?.(path).then(()=>this.paintShell()):this.suspend(path)).catch(error=>this.message(error,true));return;
    }
    const actions={save:()=>this.save(),reload:()=>this.load(this.path,{reload:true}),import:()=>this.file.click(),export:()=>this.openExport(),settings:()=>this.settings(),workspace:()=>this.shell.chooseWorkspace?.(),'workspace-menu':()=>this.showSidebar('Files'),'open-files':()=>this.showSidebar('Files'),'toggle-layers':()=>this.toggleDrawer('left'),'toggle-inspector':()=>this.toggleDrawer('right')};
    const action=actions[button.id];if(!action)return;e.preventDefault();e.stopImmediatePropagation();Promise.resolve(action()).catch(error=>this.message(error,true));
  }
  setSidebar(name){this.sidebar=name;for(const b of this.sidebarTabs.querySelectorAll('[role=tab]')){b.classList.toggle('active',b.dataset.panel===name);b.setAttribute('aria-selected',String(b.dataset.panel===name));}for(const [key,panel]of this.sidebarPanels)panel.hidden=key!==name;if(name==='Assets')this.loadSidebarAssets();if(name==='Files'&&this.ready&&!this.busy&&!this.opening)this.refreshConfig();}
  showSidebar(name){this.setSidebar(name);if(matchMedia('(max-width:640px)').matches)this.toggleDrawer('left',true);}
  closeDrawers(){this.left.classList.remove('mobile-open');this.right.classList.remove('mobile-open');this.backdrop.hidden=true;delete this.root.dataset.drawer;}
  toggleDrawer(side,force){const panel=side==='left'?this.left:this.right;if(side==='left'&&!matchMedia('(max-width:640px)').matches){this.root.classList.toggle('ui-sidebar-collapsed');return;}const open=force??!panel.classList.contains('mobile-open');this.closeDrawers();panel.classList.toggle('mobile-open',open);this.backdrop.hidden=!open;if(open)this.root.dataset.drawer=side;}
  async loadSidebarAssets(){
    const panel=this.sidebarPanels.get('Assets');if(!this.config)return;
    if(!this.sidebarAssets){this.sidebarAssets=this.assetBrowser({sidebar:true});panel.replaceChildren(el('div',{class:'ui-panel-title'},'PROJECT ASSETS'),this.sidebarAssets.root);}
    this.sidebarAssets.sync();await this.sidebarAssets.load();
  }
  assetBrowser({sidebar=false,targetId}={}){
    this.projectAssets??=projectAssets({projectKey:()=>this.shell.projectId||this.shell.project,api:(...args)=>this.api(...args),icon:name=>this.icon(name),button:(...args)=>this.button(...args),onError:error=>this.message(error,true)});
    return this.projectAssets.create({sidebar,targetId,active:()=>!this.root.hidden&&(sidebar?this.sidebar==='Assets':this.dialog.open),onAttach:asset=>{this.edit(()=>this.attach(asset,targetId));if(!sidebar)this.dialog.close();},onDrag:()=>{if(!sidebar)this.dialog.close();}});
  }
  refreshAssetBrowsers(){this.projectAssets?.refresh();}
  async chooseAssetFolder(){return this.projectAssets?.choose();}
  button(label,fn,primary=false){return el('button',{type:'button',class:primary?'ui-primary':'',onclick:e=>Promise.resolve(fn(e)).catch(error=>this.message(error,true))},label);}
  message(text,error=false,suffix=''){const report=error?webErrorReport(text):null;if(report)text=report.message;this.status.textContent=text+suffix;this.status.title=(report?.details||text)+suffix;this.status.classList.toggle('error',error);this.status.dataset.errorCode=report?.code||'';this.errorMessage=report?report.details+suffix:'';this.copyErrorButton.hidden=!this.errorMessage;this.copyErrorButton.textContent='Copy error';this.copyErrorButton.title='Copy the full error message';}
  async copyError(){
    const text=this.errorMessage;if(!text)return;
    let copied=false;
    try{await navigator.clipboard.writeText(text);copied=true;}catch{
      const active=document.activeElement,field=el('textarea',{readonly:true,style:{position:'fixed',left:'-9999px'}});field.value=text;document.body.append(field);
      try{field.select();copied=document.execCommand('copy');}catch{}finally{field.remove();active?.focus({preventScroll:true});}
    }
    // A newer status may arrive while clipboard permission is being resolved.
    if(this.errorMessage!==text)return;
    this.copyErrorButton.textContent=copied?'Copied':'Copy error';
    this.copyErrorButton.title=copied?'Error copied to clipboard':'Clipboard access failed. Try copying again.';
  }
  async api(action,payload){return workspace.api(action,payload);}
  retainMissingDocument(path){
    this.missingDocuments??=new Set();this.missingDocuments.add(path);this.catalogVersion=(this.catalogVersion||0)+1;
    this.config.documents=(this.config.documents||[]).filter(doc=>doc.path!==path);
    if(this.path===path){this.path='';this.revision='';this.guid='';this.dirty=true;this.version++;this.persist();this.message('UI document was deleted. Your open work is retained as a local draft.');}
    else this.message('UI document was deleted. Files list updated.');
    this.refreshFiles();
  }
  async refreshConfig({force=false}={}) {
    if(this.configRefresh||!force&&performance.now()-(this.lastConfigReadAt??-Infinity)<2000)return;
    this.configRefresh=true;
    const version=this.catalogVersion||0;
    try{
      const config=await this.api('ui-config');if(version!==(this.catalogVersion||0))return;
      const documents=config.documents||[],removed=this.path&&(this.config.documents||[]).some(doc=>doc.path===this.path)&&!documents.some(doc=>doc.path===this.path)?this.path:null;
      this.config=config;this.lastConfigReadAt=performance.now();
      for(const path of this.missingDocuments||[])if(!documents.some(doc=>doc.path===path))this.missingDocuments.delete(path);
      if(removed)this.retainMissingDocument(removed);
      this.failedFonts?.clear();this.refreshFiles();this.paintInspector();this.renderVersion=-1;this.paint();
    }
    catch(error){this.message(error,true);}
    finally{this.configRefresh=false;}
  }
  indexes(){
    if(this.indexDocument!==this.doc||this.indexVersion!==this.version||this.indexCount!==this.doc.layers.length){
      this.indexDocument=this.doc;this.indexVersion=this.version;this.indexCount=this.doc.layers.length;this.byId=layerIndex(this.doc);this.hierarchy=layerHierarchy(this.doc);
    }
    return this.byId;
  }
  textFontsFor(layer){
    if(this.fontConfig!==this.config){
      this.fontConfig=this.config;this.tmpFontChoices=this.config.tmpFonts||[];this.nativeFontChoices=[...(this.config.vinaGenFonts||[]),...this.tmpFontChoices];
      this.tmpFontsByKey=new Map(this.tmpFontChoices.map(font=>[font.key,font]));this.nativeFontsByKey=new Map(this.nativeFontChoices.map(font=>[font.key,font]));
      this.defaultTMPFont=this.tmpFontChoices.find(font=>font.isDefault)||this.tmpFontChoices[0];this.defaultNativeFont=this.nativeFontChoices.find(font=>font.isDefault)||this.nativeFontChoices[0];
    }
    return layer.standaloneText?this.nativeFontChoices:this.tmpFontChoices;
  }
  tmpFontFor(layer){
    this.textFontsFor(layer);
    return layer.standaloneText?this.nativeFontsByKey.get(layer.tmpFont)||this.defaultNativeFont:this.tmpFontsByKey.get(layer.tmpFont)||this.defaultTMPFont;
  }
  async start(requestedPath) {
    const loading=this.loadProgress.begin();
    this.busy=true;
    try {
      let draft;try {draft=JSON.parse(localStorage.getItem(this.draftKey()));}catch{}
      if(draft?.projectDraft)draft=await restoreProjectDraft(draft.projectDraft);
      // Validate recovery before choosing a request; an authored dirty draft still
      // takes precedence and uses the existing switch-document confirmation.
      if(draft){try{validateDocument(draft.document);}catch{draft=null;}}
      const sessionPromise=Promise.resolve(this.shell.token?{token:this.shell.token}:this.api('ui-session'));
      const snapshot=this.shell.snapshot;
      this.preview=snapshot?.preview;
      let initialRead=requestedPath&&(!draft||draft.dirty===false)?snapshot?.path===requestedPath?Promise.resolve(snapshot):sessionPromise.then(session=>{this.token=session.token;return this.api('ui-read',{path:requestedPath});}):null;
      if(initialRead)initialRead=Promise.resolve(initialRead).catch(error=>{if(error.status===404)return {missingPath:requestedPath};throw error;});
      this.refreshAppearance();
      const [session,config,saved]=await Promise.all([sessionPromise,this.shell.configPromise||this.api('ui-config'),initialRead]);
      this.token=session.token;this.config=config;this.lastConfigReadAt=snapshot?-Infinity:performance.now();this.doc=newDocument(this.config);
      if(saved?.document){this.doc=validateDocument(saved.document);this.path=saved.path;this.revision=saved.revision;this.guid=saved.guid||'';this.dirty=false;this.message('Opened '+this.doc.name);}
      else if(draft) {
        try {
          this.doc=validateDocument(draft.document);this.path=draft.path||'';this.revision=draft.revision||'';this.guid=draft.guid||'';this.dirty=draft.dirty!==false;
          this.message(this.dirty?'Recovered local UI draft. Save or export to keep it.':this.path?'Restoring saved UI document…':'Restored saved UI document.');
        }catch{this.message('Stored draft could not be recovered.',true);}
      }
      this.lastPersistedDraft=saved?.document?undefined:JSON.stringify({document:this.doc,path:this.path,revision:this.revision,guid:this.guid,dirty:!!this.dirty});
      this.ready=true;this.repairTMPMaterials();this.refreshFiles();this.pendingLoad=loading;this.paintAll();this.fit();
      if(saved?.document)this.persist();
      if(saved?.missingPath){this.retainMissingDocument(saved.missingPath);this.setSidebar('Files');this.refreshConfig({force:true});}
      if(!saved&&!this.dirty&&this.path&&(!requestedPath||requestedPath===this.path))this.refreshSavedDraft();
    } catch(error){this.loadProgress.cancel(loading);this.message(error,true);throw error;}
    finally{this.busy=false;}
  }
  async refreshSavedDraft() {
    const path=this.path,version=this.version,document=this.doc;
    try{const saved=await this.api('ui-read',{path});if(this.path!==path||this.doc!==document||this.version!==version||this.dirty)return;
      this.preview=null;this.doc=validateDocument(saved.document);this.revision=saved.revision;this.guid=saved.guid||'';this.version++;const repaired=this.repairTMPMaterials();this.pendingLoad=this.loadProgress.begin();this.paintAll();this.fit();this.persist();if(!repaired)this.message('Restored saved UI document.');}
    catch(error){if(this.path===path&&this.doc===document&&this.version===version&&!this.dirty){if(error.status===404){this.retainMissingDocument(path);this.refreshConfig({force:true});}else{this.dirty=true;this.message('Saved document is unavailable. Its local draft is retained.',true);this.persist();}}}
  }
  loadFonts() {
    if(!this.config)return;
    if(this.fontScanDocument===this.doc&&this.fontScanConfig===this.config&&this.fontScanVersion===this.version)return;
    this.fontScanDocument=this.doc;this.fontScanConfig=this.config;this.fontScanVersion=this.version;this.fontLoads??=new Map();this.fontSources??=new Map();
    const needed=new Set();
    for(const layer of this.doc.layers){if(layer.visible===false||layer.role!=='text'||layer.textStyle)continue;
      if(!layer.textMeshPro){if(layer.fontGuid)needed.add(layer.fontGuid);continue;}
      const font=this.tmpFontFor(layer);
      for(const guid of [font?.sourceFontGuid,...(font?.fallbackFontGuids||[])])if(guid)needed.add(guid);
    }
    for(const guid of needed){
      const url=previewURL(this.preview?.fonts,guid,resourceURL(guid,'font'));
      if(this.fontSources.get(guid)!==url){this.fontLoads.delete(guid);this.failedFonts?.delete(guid);this.fontSources.set(guid,url);}
      if(this.fontLoads.has(guid)||this.failedFonts?.has(guid))continue;
      const face=new FontFace('ui-'+guid,`url(${url})`);
      this.fontLoads.set(guid,face.load().then(loaded=>{if(this.fontSources.get(guid)!==url)return loaded;document.fonts.add(loaded);this.fontVersion=(this.fontVersion||0)+1;this.renderVersion=-1;this.paint();return loaded;}).catch(()=>{if(this.fontSources.get(guid)!==url)return;this.fontLoads.delete(guid);this.failedFonts??=new Set();this.failedFonts.add(guid);this.message('A text font could not load. The web preview uses its fallback.',true);}));
    }
    this.currentFontLoads=[...needed].map(guid=>this.fontLoads.get(guid)).filter(Boolean);
  }
  deactivateShell(){
    this.cancelGesture();this.closeDrawers();this.root.hidden=true;
    this.tab?.remove();this.tab=null;
    this.shell.onClose?.();
  }
  async suspend(path){
    if(this.busy||this.opening||this.closing||this.dialog.open)return false;
    this.closeTextBubble();document.activeElement?.blur();this.persist();
    this.closing=true;
    try{this.deactivateShell();this.closing=false;await this.shell.onClose?.({path});return true;}
    finally{this.closing=false;}
  }
  async close(){
    if(this.busy||this.opening||this.closing||this.dialog.open)return false;
    this.closeTextBubble();
    document.activeElement?.blur();this.closing=true;
    try{
      let discarded=false;
      if(this.dirty){const choice=await this.choose('Unsaved changes','Save your UI document, keep its local draft, or discard unsaved changes before closing.',[['Save and close','save'],['Close and keep draft','keep'],['Discard','discard'],['Cancel','cancel']]);if(!choice||choice==='cancel')return false;if(choice==='save'&&(!await this.save()||this.dirty))return false;if(choice==='discard'){this.discardDraft();discarded=true;}}
      if(!discarded)await this.persist();this.deactivateShell();this.tab?.remove();this.tab=null;this.closing=false;await this.shell.onClose?.();return true;
    }finally{this.closing=false;}
  }
  refreshFiles(){const documents=(this.config.documents||[]).filter(doc=>!this.missingDocuments?.has(doc.path));this.documentList.replaceChildren(el('option',{value:''},'Open saved screen…'));for(const doc of documents)this.documentList.append(el('option',{value:doc.path},doc.name));this.documentList.value=this.path;this.files.refresh(documents,this.path);this.paintShell();}
  async newScreen() {
    if(this.busy)return;
    if(this.dirty){const choice=await this.choose('Keep current screen?', 'Save or export the current draft before starting another screen.', [['Save and create','save'],['Create and discard','discard'],['Cancel','cancel']]);if(choice==='cancel'||!choice)return;if(choice==='save'&&!await this.save())return;}
    this.preview=null;this.doc=newDocument(this.config);this.path='';this.revision='';this.guid='';this.selected.clear();this.undo=[];this.redo=[];this.dirty=false;this.refreshFiles();this.pendingLoad=this.loadProgress.begin();this.paintAll();this.fit();this.persist();
  }
  async load(path,{reload=false}={}) {
    if(!path||this.closing||this.busy&&!this.opening){this.refreshFiles();return false;}
    const request=this.loadSerial=(this.loadSerial||0)+1;
    if(this.opening)await this.openPromise;
    if(request!==this.loadSerial)return false;
    if(path===this.path&&!reload){this.refreshFiles();return true;}
    this.opening=true;
    let complete;this.openPromise=new Promise(resolve=>complete=resolve);
    this.closeTextBubble();document.activeElement?.blur();
    let loading;
    try {
      if(this.dirty){const choice=await this.choose('Open another screen?', 'Keep your current work before switching documents.', [['Save and open','save'],['Open and discard','discard'],['Cancel','cancel']]);if(choice==='cancel'||!choice)return false;if(choice==='save'&&(!await this.save()||this.dirty))return false;}
      if(request!==this.loadSerial)return false;
      this.busy=true;this.message('Opening UI document…');
      loading=this.loadProgress.begin();
      const data=await savedUI(path)||await this.api('ui-read',{path});
      if(request!==this.loadSerial){this.loadProgress.cancel(loading);return false;}
      const next=validateDocument(data.document);this.preview=data.preview;if(data.config)this.config={...data.config,documents:this.config.documents};this.doc=next;this.path=data.path;this.revision=data.revision;this.guid=data.guid||'';this.selected.clear();this.undo=[];this.redo=[];this.dirty=false;this.version++;const repaired=this.repairTMPMaterials();this.pendingLoad=loading;this.paintAll();this.fit();this.persist();if(!repaired)this.message('Opened '+this.doc.name);return true;
    }catch(error){this.loadProgress.cancel(loading);if(request===this.loadSerial){if(error.status===404){this.retainMissingDocument(path);this.refreshConfig({force:true});}else this.message(error,true);}return false;}finally{this.busy=false;this.opening=false;this.refreshFiles();complete();}
  }
  snapshotOf(doc){return JSON.stringify(doc);}
  snapshot(){return this.snapshotOf(this.doc);}
  restoreSnapshot(snapshot){return JSON.parse(snapshot);}
  remember(before,coalesce=false,preserveGeometry=false){if(before===this.snapshot())return;try{validateDocument(this.doc);if(!preserveGeometry)reflowGroups(this.doc);if(this.config.autoAdjustAnchors)adjustAnchors(this.doc,this.restoreSnapshot(before));screenAnchors(this.doc);validateDocument(this.doc);}catch(error){this.doc=this.restoreSnapshot(before);this.message(error,true);this.paintAll();return;}if(!coalesce)this.undo.push(before);let size=this.undo.reduce((n,s)=>n+s.length,0);while(this.undo.length>60||size>4*1024*1024){size-=this.undo.shift().length;}this.redo=[];this.dirty=true;this.version++;this.paintAll();this.queueDraft();}
  edit(fn,coalesce=false){if(this.busy){this.message('Wait for the current import to finish.');return;}const before=this.snapshot();try{fn();this.remember(before,coalesce);}catch(error){this.doc=this.restoreSnapshot(before);this.message(error,true);this.paintAll();}}
  history(direction){if(this.busy)return;const from=direction<0?this.undo:this.redo,to=direction<0?this.redo:this.undo;if(!from.length)return;to.push(this.snapshot());this.doc=this.restoreSnapshot(from.pop());this.selected=new Set([...this.selected].filter(id=>this.doc.layers.some(l=>l.id===id)));this.dirty=true;this.version++;this.paintAll();this.queueDraft();}
  queueDraft(){clearTimeout(this.draftTimer);this.draftTimer=setTimeout(()=>this.persist(),600);}
  draftKey(){return 'vinagen-ui-draft:v1'+(this.shell.projectId?':'+this.shell.projectId:'');}
  psdFallbackKey(){
    const fonts=psdFallbackFonts(this.config);let key=this.doc.psdFallbackFont;
    if(key===undefined)try{key=localStorage.getItem('vinagen-ui-psd-fallback:v1:'+(this.shell.projectId||this.shell.project||''));}catch{}
    return fonts.some(f=>f.key===key)?key:'';
  }
  discardDraft(){
    this.persistSequence=(this.persistSequence||0)+1;
    clearTimeout(this.draftTimer);this.cancelGesture();
    this.preview=null;this.doc=newDocument(this.config);this.path='';this.revision='';this.guid='';this.selected.clear();this.undo=[];this.redo=[];this.dirty=false;this.version++;
    localStorage.removeItem(this.draftKey());this.lastPersistedDraft=null;
    this.refreshFiles();this.paintAll();this.message('Draft discarded.');
  }
  async persist(){
    if(!this.ready||this.psdCancel)return;
    try{
      const data=JSON.stringify({document:this.doc,path:this.path,revision:this.revision,guid:this.guid,dirty:!!this.dirty});
      if(data===this.lastPersistedDraft)return this.pendingPersist;
      const sequence=this.persistSequence=(this.persistSequence||0)+1;
      if(typeof this.doc.psdFallbackFont==='string')localStorage.setItem('vinagen-ui-psd-fallback:v1:'+(this.shell.projectId||this.shell.project||''),this.doc.psdFallbackFont);
      if(data.length<2*1024*1024){localStorage.setItem(this.draftKey(),data);this.lastPersistedDraft=data;return;}
      // The small browser marker points to an immutable compressed project draft.
      // Publish it only after the write succeeds, and never overtake a newer edit.
      this.lastPersistedDraft=data;
      this.pendingPersist=(async()=>{
        const key=await cacheKey(data),saved=await projectCache('ui-draft',key,JSON.parse(data));
        if(sequence!==this.persistSequence)return;
        if(!saved){this.lastPersistedDraft=null;this.message('Could not cache this large draft. Save the document to your workspace.',true);return;}
        localStorage.setItem(this.draftKey(),JSON.stringify({projectDraft:key}));
      })();
      await this.pendingPersist;
    }catch{this.lastPersistedDraft=null;this.message('Draft storage is unavailable. Save the document to your workspace.',true);}
  }
  closeToolMenu(){this.moveTools.close();this.shapeTools.close();this.textTools.close();this.rootTools.close();}
  setTool(name){this.cancelGesture();this.tool=name;this.creationTargetId=!['select','scale','pan','comment'].includes(name)?this.creationParent()?.id:null;if(['text','text-path'].includes(name))this.textMode=name;if(['select','pan','scale'].includes(name))this.moveMode=name;if(shapeTools.some(([id])=>id===name))this.shapeMode=name;this.closeToolMenu();this.paintTools();this.paint();this.viewport.focus();}
  paintTools(){for(const button of this.toolbar.querySelectorAll('[data-tool]')){button.classList.toggle('active',button.dataset.tool===this.tool);button.setAttribute('aria-pressed',String(button.dataset.tool===this.tool));const shortcut=this.config?.shortcuts?.find(s=>s.action===button.dataset.tool)?.keys;button.title=button.getAttribute('aria-label')+(shortcut?' · '+shortcut.toUpperCase():'');}this.moveTools.paint(this.moveMode||'select',['select','pan','scale'].includes(this.tool));this.paintShapeTools();this.textTools.paint(this.textMode||'text',['text','text-path'].includes(this.tool));this.viewport.classList.toggle('comment-tool-active',this.tool==='comment');this.viewport.style.cursor=this.tool==='pan'?'grab':['select','scale'].includes(this.tool)?'default':'crosshair';}
  paintShapeTools(){this.shapeTools.paint(this.shapeMode||'rectangle',shapeTools.some(([id])=>id===this.tool));this.rootTools.paint(['empty','screen-root'].includes(this.tool)?this.tool:this.rootMode||'empty',['empty','screen-root'].includes(this.tool));if(['empty','screen-root'].includes(this.tool))this.rootMode=this.tool;}
  paintAll(){this.docName.value=this.doc.name;this.paintTools();this.paintLayers();this.paintInspector();this.paintShell();this.paint();}
  paint(){if(this.raf)return;this.raf=requestAnimationFrame(()=>{this.raf=0;this.paintCanvas();});}
  paintCanvas() {
    // Imported artwork already has a PNG in the browser. Keep it for this document
    // instead of sending it back through Unity's GPU readback/PNG encoder.
    if(this.psdPaints&&this.psdPaints.document!==this.doc){for(const entry of this.psdPaints.images.values())if(entry.url.startsWith('blob:'))URL.revokeObjectURL(entry.url);this.psdPaints=null;}
    this.loadFonts();
    this.world.style.transform=`translate(${this.pan.x}px,${this.pan.y}px) scale(${this.zoom})`;
    Object.assign(this.board.style,{width:this.doc.width+'px',height:this.doc.height+'px'});this.zoomLabel.textContent=Math.round(this.zoom*100)+'%';
    const full=this.renderVersion!==this.version||this.renderDocument!==this.doc;
    const byId=this.indexes(),indexes=full?new Map(this.hierarchy.map(({layer},index)=>[layer.id,index+1])):this.layerIndexes;
    this.layerIndexes=indexes;
    if(full){const ids=new Set(indexes.keys());for(const [id,node] of this.elements)if(!ids.has(id)){this.styledPreview?.cancel(node.firstElementChild);node.remove();this.elements.delete(id);}}
    const gestureLayers=this.gesture?.type==='move'?this.gesture.layers.map(item=>item.layer):this.gesture?.layer?[this.gesture.layer]:[];
    const updated=full?this.doc.layers:gestureLayers;
    for(const layer of updated)if(!this.elements.has(layer.id)){const node=el('div',{class:'ui-layer','data-layer-id':layer.id});node.append(el('div',{class:'ui-layer-content'}));this.elements.set(layer.id,node);}
    for(const layer of updated) {
      const node=this.elements.get(layer.id),parent=layer.parentId?this.elements.get(layer.parentId):this.board;
      // Keep layer DOM and image elements alive during pointer movement.
      if(node.parentElement!==parent)parent.append(node);
      const geometry=[layer.x,layer.y,layer.width,layer.height,layer.rotation||0,layer.opacity??1,layer.blendMode,!!layer.clip,!!layer.locked,layer.visible!==false,indexes.get(layer.id)].join('|');
      if(node._geometry!==geometry){node._geometry=geometry;node.hidden=layer.visible===false;
        // A pass-through folder must not create its own stacking context: its
        // children blend with artwork painted before the folder, including siblings.
        const pass=layer.blendMode==='pass-through'&&['empty','group'].includes(layer.role);
        Object.assign(node.style,{zIndex:pass?'auto':String(indexes.get(layer.id)??this.doc.layers.length),left:layer.x+'px',top:layer.y+'px',width:layer.width+'px',height:layer.height+'px',opacity:String(layer.opacity??1),transform:layer.rotation?`rotate(${layer.rotation}deg)`:'none',mixBlendMode:layer.blendMode==='pass-through'?'normal':layer.blendMode||'normal',isolation:pass?'auto':'isolate',overflow:layer.clip?'hidden':'visible',pointerEvents:layer.locked?'none':'auto'});
      }
      const content=node.firstElementChild;
      // Moving changes only geometry. Keep image/TMP content and signatures untouched.
      if(!full&&this.gesture?.type==='move')continue;
      const renderText=layer.role==='text';
      const sourcePaint=renderText&&importedTextPaint(layer);
      const renderImage=!['text','group','empty'].includes(layer.role);
      const tmpFont=renderText&&layer.textMeshPro?this.tmpFontFor(layer):null,tmpPreset=tmpFont?.materials?.find(m=>m.key===layer.tmpMaterial?.preset)||tmpFont?.materials?.[0];
      const styleRevision=(this.config.textStyles||[]).find(s=>s.key===layer.textStyle?.preset)?.revision||'';
      const signature=JSON.stringify([layer.role,renderText,layer.sourceTextPaint,layer.fill,layer.fillGradient,layer.image,layer.image?resourceURL(layer.image.guid):null,imageMode(layer),layer.shape,layer.stroke,layer.strokeWidth,layer.shapeSides,layer.starInnerRadius,layer.shapeFlipX,layer.shapeFlipY,...(layer.shape?[layer.width,layer.height]:[]),layer.textCurve,...(layer.textCurve?[layer.width,layer.height]:[]),layer.text,layer.textColor,layer.fontSize,layer.fontGuid,layer.textAlign,layer.bold,layer.textMeshPro,layer.standaloneText,layer.tmpFont,layer.tmpSettings,layer.tmpMaterial,layer.textStyle,styleRevision,...(renderText?[this.fontVersion]:[]),...(layer.textMeshPro?[layer.width,layer.height,tmpFont?.revision,tmpPreset?.revision]:[])]);
      if(node._signature!==signature) {
        // Unity uses fill as the sprite tint; a white tint must not add an opaque rectangle behind PNG alpha.
        node._signature=signature;if(!(renderText&&layer.textStyle&&content.querySelector('.ui-styled-text-preview'))&&!(renderText&&!layer.textStyle&&layer.textMeshPro&&content.querySelector('.ui-tmp-web-preview')))content.replaceChildren();if(!layer.textStyle)this.styledPreview?.cancel(content);content.style.background=renderImage&&!layer.image&&!layer.shape?layer.fill||'transparent':'transparent';
        if(renderImage&&!layer.image&&!layer.shape&&layer.fillGradient){content.style.backgroundColor='transparent';content.style.backgroundImage=`url("${paintURL(layer.fill,layer.fillGradient)}")`;content.style.backgroundSize='100% 100%';}
        if(layer.shape)content.append(paintShape(layer));
        if(renderImage&&layer.image){
          if(imageMode(layer)==='nine_slice'){
            const sliced=el('div',{class:'ui-sliced-image'}),source=el('img',{src:sliceMedia(layer.image),alt:'',draggable:'false',loading:'eager',decoding:'async'});
            source.onload=async()=>{
              const current=this.doc.layers.find(item=>item.id===layer.id);if(!current||this.elements.get(layer.id)?.querySelector('.ui-sliced-image')!==sliced)return;
              sliced._sourceSize={width:source.naturalWidth,height:source.naturalHeight};sliced._borders=current.image.slice||this.sliceBorders(source);
              if(!current.image.slice){
                const doc=this.doc,reference=current.image;
                try{const info=await this.api('ui-slice-info',{image:reference});if(this.doc!==doc||current.image!==reference)return;if(info.width&&info.height)sliced._borders=info;}catch(error){this.message(error,true);}
                if(this.doc!==doc||current.image!==reference)return;
                reference.slice={width:source.naturalWidth,height:source.naturalHeight,...sliced._borders};
                this.renderVersion=-1;this.paintAll();
              }
              this.paintSlice(sliced,current);
            };
            sliced.append(source);content.append(sliced);
          }else content.append(el('img',{src:media(layer.image),alt:'',draggable:'false',loading:'eager',decoding:'async',style:{objectFit:imageMode(layer)==='none'?'fill':'contain'}}));
          imagePaintFilter(content,content.querySelector('.ui-sliced-image')||content.querySelector('img'),layer);
        }
        if(sourcePaint){
          this.styledPreview?.cancel(content);content.replaceChildren(el('img',{class:'ui-psd-text-paint',src:media(sourcePaint.image),alt:layer.text||'',draggable:'false',loading:'eager',decoding:'async',style:{objectFit:'fill',...(sourcePaint.bounds?{position:'absolute',left:sourcePaint.bounds.x+'px',top:sourcePaint.bounds.y+'px',width:sourcePaint.bounds.width+'px',height:sourcePaint.bounds.height+'px',maxWidth:'none',maxHeight:'none'}:{})}}));
        }
        else if(renderText&&layer.textStyle){
          this.styledPreview??=styledTextPreview({request:(...args)=>this.api(...args),saved:layer=>{const entry=this.preview?.styledText?.[layer.id],url=previewURL({text:entry?.result?.dataUrl},'text','');return url&&entry.input&&entry.result?{...entry,result:{...entry.result,dataUrl:url}}:null;},onError:text=>this.message(text,true)});
          this.styledPreview.paint(content,layer,JSON.stringify([styleRevision,tmpFont?.revision,'smooth-curve-v2']));
        }
        else if(renderText&&layer.textMeshPro){this.styledPreview?.cancel(content);this.paintWebTMP(layer,content,tmpFont,tmpPreset);}
        else if(renderText)content.append(el('span',{},layer.text||''));
        Object.assign(content.style,{color:layer.textColor||'#fff',fontSize:(layer.fontSize||24)+'px',fontFamily:layer.fontGuid?`"ui-${layer.fontGuid}"`:'Arial, sans-serif',textAlign:layer.textAlign||'center',fontWeight:layer.bold?'700':'400'});
        if(renderText&&!layer.textStyle)paintTextCurve(content,layer);
      }
      const sliced=content.querySelector('.ui-sliced-image');if(sliced)this.paintSlice(sliced,layer);
    }
    this.comments.paint();
    if(this.pendingLoad){this.loadProgress.watch(this.board,this.pendingLoad,{tasks:[...(this.currentFontLoads||[]),...(this.styledPreview?.pending(this.board)||[])],onError:count=>this.message(`${count} image${count===1?'':'s'} could not load.`,true)});this.pendingLoad=null;}
    this.renderVersion=this.version;this.renderDocument=this.doc;
    this.guideOverlay??=el('div',{class:'ui-guide-overlay'});if(!this.guideOverlay.parentElement)this.overlay.append(this.guideOverlay);
    const guideSignature=JSON.stringify([this.guides||[],this.pan,this.zoom]);
    if(this.guideSignature!==guideSignature){this.guideSignature=guideSignature;const fragment=document.createDocumentFragment();
    for(const guide of this.guides||[]){
      const vertical=guide.axis==='x',line=el('div',{class:'ui-snap-guide '+guide.axis+(guide.kind==='spacing'?' ui-spacing-guide':''),style:vertical?{left:(this.pan.x+guide.position*this.zoom)+'px',top:(this.pan.y+guide.start*this.zoom)+'px',height:((guide.end-guide.start)*this.zoom)+'px'}:{top:(this.pan.y+guide.position*this.zoom)+'px',left:(this.pan.x+guide.start*this.zoom)+'px',width:((guide.end-guide.start)*this.zoom)+'px'}});
      if(guide.kind==='spacing')line.append(el('span',{class:'ui-spacing-label'},String(Math.round(guide.distance*100)/100)));
      for(const mark of guide.marks||[])line.append(el('i',{class:'ui-guide-mark',style:vertical?{top:((mark-guide.start)*this.zoom)+'px'}:{left:((mark-guide.start)*this.zoom)+'px'}}));
      fragment.append(line);
    }
    this.guideOverlay.replaceChildren(fragment);}
    this.selectionElements??=new Map();const active=new Set(),poses=new Map();
    const marquee=this.gesture?.type==='marquee'?this.gesture:null;
    this.marquee.hidden=!marquee?.moved;
    if(marquee?.moved){const {start,end}=marquee;Object.assign(this.marquee.style,{left:(this.pan.x+Math.min(start.x,end.x)*this.zoom)+'px',top:(this.pan.y+Math.min(start.y,end.y)*this.zoom)+'px',width:(Math.abs(end.x-start.x)*this.zoom)+'px',height:(Math.abs(end.y-start.y)*this.zoom)+'px'});}
    const moving=this.gesture?.sizeLabelMoving;
    for(const layer of roots(this.doc,this.selected,byId)) {
      active.add(layer.id);const pose=worldPose(this.doc,layer,byId,poses),width=layer.width*this.zoom,height=layer.height*this.zoom;
      let outline=this.selectionElements.get(layer.id);
      if(!outline){outline=el('div',{class:'ui-selection-box'});outline.append(el('span',{class:'ui-selection-label'}));this.selectionElements.set(layer.id,outline);this.overlay.append(outline);}
      Object.assign(outline.style,{left:(this.pan.x+pose.x*this.zoom-width/2)+'px',top:(this.pan.y+pose.y*this.zoom-height/2)+'px',width:width+'px',height:height+'px',transform:`rotate(${pose.rotation}deg)`});
      outline.setAttribute('aria-label',`${layer.name} · ${layer.role}`);const label=outline.firstElementChild;label.textContent=`${Math.round(layer.width*100)/100} × ${Math.round(layer.height*100)/100}`;label.hidden=!!moving;
      const handles=!marquee&&['select','scale'].includes(this.tool)&&this.selected.size===1&&!layer.locked;
      if(handles&&!outline.querySelector('button'))for(const [corner,label]of [['n','top'],['s','bottom'],['w','left'],['e','right'],['nw','top left'],['ne','top right'],['sw','bottom left'],['se','bottom right']])outline.append(el('button',{class:'ui-resize'+(corner.length===1?' ui-resize-edge':''),'data-resize-id':layer.id,'data-resize-corner':corner,'aria-label':'Resize '+label,title:'Drag to resize · Shift: keep proportions · Alt: disable snapping'}));
      if(handles)for(const handle of outline.querySelectorAll('button')){const corner=handle.dataset.resizeCorner,angle=pose.rotation+(corner.length===1?(corner==='n'||corner==='s'?90:0):(corner==='nw'||corner==='se'?45:-45));handle.style.cursor=['ew-resize','nwse-resize','ns-resize','nesw-resize'][((Math.round(angle/45)%4)+4)%4];}
      if(!handles)for(const handle of outline.querySelectorAll('button'))handle.remove();
    }
    for(const [id,outline]of this.selectionElements)if(!active.has(id)){outline.remove();this.selectionElements.delete(id);}
    this.paintSelectionGuides(byId,poses);
    this.paintHover();
  }
  paintSelectionGuides(byId,poses){
    const layer=this.selected.size===1?byId.get([...this.selected][0]):null;
    this.selectionGuides.hidden=true;
    if(!layer||this.gesture?.type==='marquee'||this.gesture?.type==='move'&&this.gesture.moved||!['select','scale'].includes(this.tool)||isScreenRoot(layer,this.doc,this.doc))return;
    let screen;
    for(let item=layer;item;item=byId.get(item.parentId)){
      if(item.visible===false||(item.opacity??1)<=0)return;
      if(!screen&&item!==layer&&isScreenRoot(item,this.doc,this.doc))screen=item;
    }
    const pose=worldPose(this.doc,layer,byId,poses),frame=screen?worldPose(this.doc,screen,byId,poses):{x:this.doc.width/2,y:this.doc.height/2,rotation:0};
    const center=rotatePoint({x:pose.x-frame.x,y:pose.y-frame.y},-frame.rotation),width=screen?.width??this.doc.width,height=screen?.height??this.doc.height;
    if(Math.abs(center.x)>width/2||Math.abs(center.y)>height/2)return;
    // Stop at the object's bounds in its Screen's axes, including nested rotation.
    const angle=(pose.rotation-frame.rotation)*Math.PI/180,halfWidth=(Math.abs(layer.width*Math.cos(angle))+Math.abs(layer.height*Math.sin(angle)))/2,halfHeight=(Math.abs(layer.width*Math.sin(angle))+Math.abs(layer.height*Math.cos(angle)))/2;
    const segments=[[{x:center.x,y:-height/2},{x:center.x,y:Math.max(-height/2,center.y-halfHeight)}],[{x:-width/2,y:center.y},{x:Math.max(-width/2,center.x-halfWidth),y:center.y}],[{x:width/2,y:center.y},{x:Math.min(width/2,center.x+halfWidth),y:center.y}],[{x:center.x,y:height/2},{x:center.x,y:Math.min(height/2,center.y+halfHeight)}]];
    this.selectionGuides.hidden=false;this.selectionGuides.dataset.screenId=screen?.id||'document';
    for(const [index,line]of [...this.selectionGuides.children].entries()){
      const [start,end]=segments[index].map(point=>rotatePoint(point,frame.rotation)),dx=end.x-start.x,dy=end.y-start.y,distance=Math.hypot(dx,dy),length=distance*this.zoom,angle=Math.atan2(dy,dx)*180/Math.PI;
      line.hidden=length<.5;
      Object.assign(line.style,{left:(this.pan.x+(frame.x+start.x)*this.zoom)+'px',top:(this.pan.y+(frame.y+start.y)*this.zoom)+'px',width:length+'px',transform:`rotate(${angle}deg)`});
      // Measurements use document pixels; the badges stay upright and readable at any zoom.
      line.firstElementChild.textContent=(Math.round(distance*100)/100)+' px';line.firstElementChild.style.transform=`translate(-50%,-50%) rotate(${-angle}deg)`;
    }
  }
  clearHover(){this.hoverPointer=null;if(this.hoverFrame)cancelAnimationFrame(this.hoverFrame);this.hoverFrame=0;this.hoverBox.hidden=true;delete this.hoverBox.dataset.hoverLayerId;}
  updateHoverModifiers(e){if(this.hoverPointer&&['Shift','Control','Meta'].includes(e.key)){Object.assign(this.hoverPointer,{shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,metaKey:e.metaKey});this.paintHover();}}
  paintHover(){
    const pointer=this.hoverPointer;let layer;
    if(pointer?.doc===this.doc&&!this.root.hidden&&!this.busy&&!this.gesture&&!this.space&&['select','scale'].includes(this.tool)&&!document.querySelector('dialog[open]')&&this.contextMenu.hidden){
      const target=document.elementFromPoint(pointer.x,pointer.y);
      if(target&&this.viewport.contains(target)&&!target.closest('.ui-viewbar,.ui-toolbar,.canvas-comments,[data-resize-id]')){
        // Preview the next click, including overlap cycling and selection modifiers.
        layer=this.pickLayer(this.point(pointer.x,pointer.y),pointer).layer;
      }
    }
    this.hoverBox.hidden=!layer;
    if(!layer){delete this.hoverBox.dataset.hoverLayerId;return;}
    const pose=worldPose(this.doc,layer,this.indexes()),width=layer.width*this.zoom,height=layer.height*this.zoom;
    this.hoverBox.dataset.hoverLayerId=layer.id;
    Object.assign(this.hoverBox.style,{left:(this.pan.x+pose.x*this.zoom-width/2)+'px',top:(this.pan.y+pose.y*this.zoom-height/2)+'px',width:width+'px',height:height+'px',transform:`rotate(${pose.rotation}deg)`});
  }
  paintSlice(node,layer){
    if(!node._sourceSize)return;
    const {width,height}=node._sourceSize,rects=sliceImageRects(width,height,layer.width,layer.height,node._borders),signature=JSON.stringify(rects);
    this.paintSliceGuide(layer,node._sourceSize,node._borders);
    if(node._sliceSignature===signature)return;node._sliceSignature=signature;
    const grid=node.querySelector('.ui-slice-grid')||el('canvas',{class:'ui-slice-grid','aria-hidden':'true'});
    grid.dataset.targetSize=`${layer.width} ${layer.height}`;
    // Rasterize all quads together, using the export sampling path. Separate
    // SVG/CSS viewports can leave antialiased seams at fractional boundaries.
    // Limit preview memory for huge layers; export retains the authored size.
    const scale=Math.min(1,2048/Math.max(layer.width,layer.height));
    grid.width=Math.max(1,Math.round(layer.width*scale));grid.height=Math.max(1,Math.round(layer.height*scale));
    const context=grid.getContext('2d');if(!context)throw Error('Image rendering is unavailable.');
    context.scale(grid.width/layer.width,grid.height/layer.height);
    for(const rect of rects)context.drawImage(node.querySelector('img'),...rect);
    if(!grid.parentElement)node.append(grid);
  }
  paintSliceGuide(layer,size,borders){
    if(this.selected.size!==1||!this.selected.has(layer.id)||!borders)return;
    const guide=this.right.querySelector('.ui-slice-guide');if(!guide)return;
    for(const [key,edge]of Object.entries(borders))guide.style.setProperty('--slice-'+key,100*edge/(key==='left'||key==='right'?size.width:size.height)+'%');
    const compact=sliceMinimum(size.width,size.height,borders);guide.title=`Repeated pixel bands; color tolerance 3/255, margin 2 px, center 2 px. Optimized source ${compact.width} × ${compact.height}. Borders scale down in smaller rectangles. Save includes each shared image once in the document package.`;
  }
  sliceBorders(source){
    this.sliceBorderCache??=new Map();const key=(source.currentSrc||source.src)+'|'+source.naturalWidth+'|'+source.naturalHeight;
    if(this.sliceBorderCache.has(key))return this.sliceBorderCache.get(key);
    const canvas=el('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
    const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw Error('Image analysis is unavailable.');
    context.drawImage(source,0,0);const borders=detectSliceBorders(context.getImageData(0,0,canvas.width,canvas.height));canvas.width=canvas.height=1;
    this.sliceBorderCache.set(key,borders);return borders;
  }
  paintLayers() {
    this.restoreLayerFolds();
    const query=this.search.value.toLowerCase();
    if(this.layerListDocument!==this.doc||this.layerListVersion!==this.version||this.layerListQuery!==query){
      this.layerListVersion=this.version;this.layerListQuery=query;
      this.layerListNextSignature=JSON.stringify([query,this.doc.layers.map(l=>[l.id,l.parentId,l.name,l.role,l.visible,l.locked,l.canvasRoot])]);
    }
    const signature=this.layerListNextSignature+'|'+[...this.collapsedLayers].sort().join('|');
    if(this.layerListDocument===this.doc&&this.layerListSignature===signature){
      for(const row of this.layerList.children){const selected=this.selected.has(row.dataset.layerRowId);row.classList.toggle('active',selected);row.setAttribute('aria-selected',String(selected));}return;
    }
    this.layerListDocument=this.doc;this.layerListSignature=signature;
    const focused=this.layerList.contains(document.activeElement)?document.activeElement.closest('[data-layer-row-id]')?.dataset.layerRowId:null;
    this.layerList.replaceChildren();const byParent=new Map();
    for(const layer of this.doc.layers){const parent=layer.parentId||'';if(!byParent.has(parent))byParent.set(parent,[]);byParent.get(parent).push(layer);}
    const matches=new Set(),byId=this.indexes();if(query)for(const layer of this.doc.layers)if(`${layer.name} ${layer.role} ${layer.id}`.toLowerCase().includes(query)){for(let item=layer;item&&!matches.has(item.id);item=byId.get(item.parentId))matches.add(item.id);}
    const visit=(parent,depth)=>{for(const layer of byParent.get(parent)||[]){
      if(!query||matches.has(layer.id)){
        const row=el('div',{class:'ui-layer-row'+(this.selected.has(layer.id)?' active':''),role:'treeitem',tabindex:0,'data-layer-row-id':layer.id,'aria-level':depth+1,'aria-selected':String(this.selected.has(layer.id)),style:{paddingLeft:(8+depth*14)+'px','--drop-indent':(8+depth*14)+'px'}});
        const children=byParent.has(layer.id),expanded=!!query||!this.collapsedLayers.has(layer.id);
        if(children){row.setAttribute('aria-expanded',String(expanded));const toggle=this.iconButton('chevron',(expanded?'Collapse':'Expand')+' layer '+layer.name,e=>{e.stopPropagation();this.toggleLayerFold(layer.id);});toggle.classList.add('ui-layer-toggle');toggle.setAttribute('aria-expanded',String(expanded));row.append(toggle);}else row.append(el('span',{class:'ui-layer-toggle-spacer','aria-hidden':'true'}));
        const glyph=this.iconButton(({image:'image',button:'image',text:'text',group:'frame',empty:'frame'})[layer.role],'Focus '+layer.name,e=>{e.stopPropagation();if(e.shiftKey||e.ctrlKey||e.metaKey)this.selectLayerRow(layer.id,e);else{this.select(layer.id);this.layerActions.focus();}});glyph.classList.add('ui-layer-glyph');
        const caption=el('span',{class:'ui-layer-row-name'},layer.name);caption.ondblclick=e=>{e.stopPropagation();this.layerActions.rename(layer.id);};
        const screenRoot=isScreenRoot(layer,this.doc,this.doc);row.append(glyph,caption,el('small',{title:screenRoot?'Independent screen root':layer.role},screenRoot?'Screen':layer.role));
        row.append(this.iconButton(layer.visible===false?'eyeOff':'eye',layer.visible===false?'Show layer':'Hide layer',e=>{e.stopPropagation();this.toggleLayerProperty(layer.id,'visible');}),this.iconButton(layer.locked?'lock':'unlock',layer.locked?'Unlock layer':'Lock layer',e=>{e.stopPropagation();this.toggleLayerProperty(layer.id,'locked');}));
        row.draggable=!layer.locked;row.title='Drag to change parent or layer order';
        row.onpointerdown=e=>{this.layerDragFromControl=!!e.target.closest('button,input');};
        row.ondragstart=e=>this.layerDragStart(e,layer);row.ondragend=()=>this.finishLayerDrag();
        row.ondragover=e=>this.layerDragOver(e,row,layer.id,this.layerDropPlacement(e,row,layer));
        row.ondragleave=e=>{if(!row.contains(e.relatedTarget))this.clearLayerDrop();};
        row.ondrop=e=>this.layerDrop(e,layer.id,this.layerDropPlacement(e,row,layer));
        row.onclick=e=>this.selectLayerRow(layer.id,e);row.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();this.selectLayerRow(layer.id,e);}};this.layerList.append(row);
      }if(query||!this.collapsedLayers.has(layer.id))visit(layer.id,depth+1);
    }};visit('',0);
    const parents=[...byParent.keys()].filter(Boolean),all=parents.length>0&&parents.every(id=>this.collapsedLayers.has(id));this.collapseLayersButton.setAttribute('aria-label',all?'Expand all layers':'Collapse all layers');this.collapseLayersButton.title=all?'Expand all layers':'Collapse all layers';this.collapseLayersButton.disabled=!parents.length;
    if(focused)this.focusLayerRow(focused,false);
  }
  restoreLayerFolds(){const key='vinagen-ui-layer-folds:v1:'+ (this.shell.projectId||this.shell.project||'')+':'+(this.path||'draft');if(this.layerFoldsKey===key)return;this.layerFoldsKey=key;try{const values=JSON.parse(localStorage.getItem(key)||'[]');this.collapsedLayers=new Set(Array.isArray(values)?values.filter(id=>typeof id==='string'):[]);}catch{this.collapsedLayers=new Set();}}
  persistLayerFolds(){try{localStorage.setItem(this.layerFoldsKey,JSON.stringify([...this.collapsedLayers]));}catch{}}
  toggleLayerFold(id){this.restoreLayerFolds();if(this.collapsedLayers.has(id))this.collapsedLayers.delete(id);else this.collapsedLayers.add(id);this.persistLayerFolds();this.paintLayers();}
  collapseAllLayers(){this.restoreLayerFolds();const parents=new Set(this.doc.layers.map(layer=>layer.parentId).filter(Boolean)),all=[...parents].every(id=>this.collapsedLayers.has(id));this.collapsedLayers=all?new Set():parents;this.persistLayerFolds();this.paintLayers();}
  scrollLayerRow(id){
    const panel=this.sidebarPanels.get('Layers'),row=[...this.layerList.children].find(row=>row.dataset.layerRowId===id);
    if(!row||panel.hidden||!panel.clientHeight)return;
    // A newer selection must stop an older animation, even if its row is visible.
    panel.scrollTo({top:panel.scrollTop,behavior:'instant'});
    const bounds=panel.getBoundingClientRect(),top=bounds.top+panel.clientTop,bottom=top+panel.clientHeight,rect=row.getBoundingClientRect();
    const delta=rect.top<top-.5?rect.top-top:rect.bottom>bottom+.5?rect.bottom-bottom:0;
    if(delta)panel.scrollTo({top:panel.scrollTop+delta,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  revealLayerRow(id){
    this.restoreLayerFolds();let changed=false;const byId=this.indexes();
    for(let parent=byId.get(id)?.parentId;parent;parent=byId.get(parent)?.parentId)changed=this.collapsedLayers.delete(parent)||changed;
    if(changed)this.persistLayerFolds();this.paintLayers();this.scrollLayerRow(id);
  }
  focusLayerRow(id,scroll=true){const row=[...this.layerList.children].find(row=>row.dataset.layerRowId===id);row?.focus({preventScroll:true});if(scroll)this.scrollLayerRow(id);}
  selectLayerRow(id,event){
    this.lastPick=null;
    if(this.layerSelectionDocument!==this.doc){this.layerSelectionDocument=this.doc;this.layerSelectionAnchor=null;}
    const ids=[...this.layerList.children].map(row=>row.dataset.layerRowId),result=selectLayerIds(ids,this.selected,this.layerSelectionAnchor,id,event);
    this.layerSelectionAnchor=result.anchor;this.selected=result.selected;this.paintLayers();this.paintInspector();this.paint();this.focusLayerRow(id,false);
  }
  toggleLayerProperty(id,key){
    const byId=this.indexes(),source=byId.get(id);if(!source)return;
    const ids=layerActionIds(this.selected,id),value=key==='visible'?source.visible===false:!source.locked;
    this.edit(()=>{for(const layerId of ids){const layer=byId.get(layerId);if(layer)layer[key]=value;}});
  }
  toggleSelectionVisibility(){
    const layers=this.doc.layers.filter(layer=>this.selected.has(layer.id)),source=layers.find(layer=>layer.visible!==false)||layers[0];
    if(source)this.toggleLayerProperty(source.id,'visible');
  }
  navigateLayers(direction){const ids=[...this.layerList.children].map(row=>row.dataset.layerRowId),focused=document.activeElement.closest('[data-layer-row-id]')?.dataset.layerRowId,id=nextLayerId(ids,focused,this.selected,direction);if(id){this.select(id);this.focusLayerRow(id);}}
  closeGroupMenu(){this.layerActions.close();}
  groupSelection(type='rect'){this.closeGroupMenu();this.edit(()=>this.selected=new Set(groupLayers(this.doc,this.selected,type)));}
  openGroupMenu(e,id){this.layerActions.open(e,id);}
  layerDropPlacement(e,row,layer){const rect=row.getBoundingClientRect(),fraction=(e.clientY-rect.top)/rect.height;return parentRoles.includes(layer.role)&&fraction>=.25&&fraction<=.75?'inside':fraction<.5?'before':'after';}
  layerDragStart(e,layer){
    if(this.busy||this.layerDragFromControl){e.preventDefault();return;}
    const ids=this.selected.has(layer.id)?[...this.selected]:[layer.id];
    try{const plan=layerDropPlan(this.doc,ids);this.selected=new Set(ids);this.layerDrag={ids:plan.selected.map(item=>item.id),document:this.doc,version:this.version};}
    catch(error){e.preventDefault();this.message(error,true);return;}
    e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-vinagen-ui-layers',JSON.stringify(this.layerDrag.ids));
    // Keep the native drag source in the DOM until dragend.
    this.root.dataset.layerDrag='true';for(const row of this.layerList.children){const selected=this.selected.has(row.dataset.layerRowId);row.classList.toggle('active',selected);row.classList.toggle('ui-layer-dragging',this.layerDrag.ids.includes(row.dataset.layerRowId));row.setAttribute('aria-selected',String(selected));}
    this.paintInspector();this.paint();
  }
  clearLayerDrop(){for(const node of this.root.querySelectorAll('[data-drop],[data-drop-parent]')){node.removeAttribute('data-drop');node.removeAttribute('data-drop-parent');}}
  finishLayerDrag(){this.layerDrag=null;delete this.root.dataset.layerDrag;this.clearLayerDrop();for(const row of this.layerList.children)row.classList.remove('ui-layer-dragging');}
  layerDragOver(e,row,targetId,placement){
    if(!this.layerDrag)return;e.stopPropagation();this.clearLayerDrop();
    try{if(this.busy||this.layerDrag.document!==this.doc||this.layerDrag.version!==this.version)throw Error('The document changed during dragging.');layerDropPlan(this.doc,this.layerDrag.ids,targetId,placement);e.preventDefault();e.dataTransfer.dropEffect='move';row.dataset.drop=placement;const parentId=placement==='inside'?targetId:this.doc.layers.find(l=>l.id===targetId)?.parentId;const parentRow=[...this.layerList.children].find(r=>r.dataset.layerRowId===parentId);if(parentRow)parentRow.dataset.dropParent='true';}
    catch{e.dataTransfer.dropEffect='none';row.dataset.drop='invalid';}
    const panel=this.sidebarPanels.get('Layers'),bounds=panel.getBoundingClientRect();if(e.clientY<bounds.top+32)panel.scrollTop-=14;else if(e.clientY>bounds.bottom-32)panel.scrollTop+=14;
  }
  layerDrop(e,targetId,placement){
    if(!this.layerDrag)return;e.preventDefault();e.stopPropagation();const drag=this.layerDrag;
    try{if(drag.document!==this.doc||drag.version!==this.version)throw Error('The document changed during dragging. Try again.');layerDropPlan(this.doc,drag.ids,targetId,placement);this.finishLayerDrag();this.edit(()=>this.selected=new Set(moveLayers(this.doc,drag.ids,targetId,placement)));}
    catch(error){this.finishLayerDrag();this.message(error,true);}
  }
  select(id,add=false){this.lastPick=null;this.layerSelectionDocument=this.doc;this.layerSelectionAnchor=id;if(!add)this.selected.clear();if(add&&this.selected.has(id))this.selected.delete(id);else this.selected.add(id);this.revealLayerRow(id);this.paintInspector();this.paint();}
  wheelNumber(e){
    const input=e.target.closest('input[type="number"]');
    if(!input||input!==document.activeElement||input.disabled||input.readOnly||e.ctrlKey||e.metaKey)return;
    // Suppress native stepping and panel scrolling while editing a focused number.
    e.preventDefault();e.stopPropagation();
    if(this.busy||input.dataset.numberScrubbing||!e.deltaY||!Number.isFinite(input.valueAsNumber))return;
    const integer=input.dataset.integer==='true',step=input.step==='any'?1:Number(input.step||1);
    const next=scrubNumber(input.valueAsNumber,-Math.sign(e.deltaY),{
      step:integer?Math.max(1,step):step,min:input.min===''?-Infinity:Number(input.min),max:input.max===''?Infinity:Number(input.max),
      integer,fast:e.shiftKey
    });
    if(next===input.valueAsNumber)return;
    input.value=String(next);
    // Join the live typing session: preview immediately, commit on Enter/blur, cancel on Escape.
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  bindLiveProperty(input,read,change){
    const finish=control=>{if(this.reconcilingInspector)return;const session=this.liveProperty;if(!session||session.control!==control)return;this.liveProperty=null;this.remember(session.before);};
    const update=(control,committing=false)=>{
      if(this.busy||this.reconcilingInspector)return;const value=read(control,committing);if(value===undefined)return;
      if(this.liveProperty&&this.liveProperty.control!==control){const previous=this.liveProperty;this.liveProperty=null;this.remember(previous.before);}
      const before=this.snapshot();this.liveProperty??={control,before,dirty:this.dirty};
      try{
        change(value);validateDocument(this.doc);reflowGroups(this.doc);if(this.config.autoAdjustAnchors)adjustAnchors(this.doc,this.restoreSnapshot(before));screenAnchors(this.doc);validateDocument(this.doc);
        if(before===this.snapshot())return;
        this.version++;this.dirty=true;control._uiEditing=!committing;this.paintAll();control._uiEditing=false;this.queueDraft();
        if(!control.dataset.numberScrubbing&&this.snapshot()===this.liveProperty.before){this.dirty=this.liveProperty.dirty;this.liveProperty=null;this.paintShell();}
      }catch(error){control._uiEditing=!committing;this.doc=this.restoreSnapshot(before);this.paintAll();control._uiEditing=false;if(committing)this.message(error,true);}
    };
    input.oninput=e=>update(e.currentTarget);
    input.onchange=e=>{if(this.reconcilingInspector)return;update(e.currentTarget,true);finish(e.currentTarget);this.paintInspector();};
    input.onblur=e=>finish(e.currentTarget);
    input.onkeydown=e=>{
      if(e.key==='Enter'&&e.currentTarget.tagName!=='TEXTAREA'){e.preventDefault();update(e.currentTarget,true);finish(e.currentTarget);this.paintInspector();}
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();const session=this.liveProperty;if(session?.control===e.currentTarget){this.liveProperty=null;this.doc=JSON.parse(session.before);this.dirty=session.dirty;this.version++;this.paintAll();this.queueDraft();}else this.paintInspector();}
    };
  }
  field(label,value,change,type='text',options) {
    const wrap=el('label',{class:'ui-field'+(type==='checkbox'?' ui-check':''),'data-inspector-key':'field:'+label});wrap.append(el('span',{},label));
    const input=options?el('select'):type==='textarea'?el('textarea',{rows:3}):el('input',{type});
    input.setAttribute('aria-label',label);
    if(type==='number'){
      input.step='any';
      const bounds={Width:[1,8192],Height:[1,8192],W:[1,8192],H:[1,8192],X:[-100000,100000],Y:[-100000,100000],Rotation:[-3600,3600],Opacity:[0,1,.01],'Font size':[1,512],Columns:[1,1000],Spacing:[0,8192],Padding:[0,8192],'Cell width':[1,8192],'Cell height':[1,8192],'Stroke width':[0,256],Thickness:[0,256],Points:[3,64,1],'Inner radius':[.01,.99,.01]}[label];
      if(bounds)Object.assign(input,{min:bounds[0],max:bounds[1],step:bounds[2]??'any'});
      if(['Columns','Padding','Points'].includes(label)){input.dataset.integer='true';input.step=1;}
    }
    if(options)for(const [v,title] of options)input.append(el('option',{value:v},title));
    if(type==='checkbox')input.checked=!!value;else input.value=value??'';
    if(!options&&['number','color','textarea','text'].includes(type))this.bindLiveProperty(input,(control,committing)=>{
      if(type!=='number')return control.value;
      if(control.value===''||!committing&&!control.validity.valid)return;
      const number=control.valueAsNumber;if(Number.isFinite(number))return number;
    },change);
    else input.onchange=e=>{
      const value=type==='checkbox'?e.currentTarget.checked:e.currentTarget.value;
      // Commit the focused color/text edit before a mode removes that control.
      // Its blur handler must not repaint the inspector during reconciliation.
      const session=this.liveProperty;if(session){this.liveProperty=null;this.remember(session.before);}
      this.edit(()=>change(value));
    };
    if(type==='color'){const swatch=el('div',{class:'ui-color-value'});swatch.append(input,el('span',{},String(value||'#ffffff').replace('#','').toUpperCase()));wrap.append(swatch);}else wrap.append(input);return wrap;
  }
  colorEditor(label,value,change){
    const rgba=/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value||'')?value:'#ffffff',rgb=rgba.slice(0,7),alpha=rgba.slice(7)||'ff';
    const row=el('div',{class:'ui-color-editor','data-inspector-key':'color:'+label}),swatch=el('input',{type:'color','aria-label':label}),hex=el('input',{type:'text','aria-label':label+' hex',spellcheck:'false',maxlength:9}),opacity=el('input',{type:'number','aria-label':label+' alpha',min:0,max:100,step:.1});
    swatch.value=rgb;hex.value=rgb.slice(1).toUpperCase();opacity.value=Number((parseInt(alpha,16)/255*100).toFixed(1));
    this.bindLiveProperty(swatch,control=>control.value+alpha,change);
    this.bindLiveProperty(hex,control=>{const text=control.value.replace(/^#/,'');if(/^[\da-f]{6}(?:[\da-f]{2})?$/i.test(text))return '#'+text+(text.length===6?alpha:'');},change);
    this.bindLiveProperty(opacity,control=>{if(control.value===''||!control.validity.valid)return;return rgb+Math.round(control.valueAsNumber*255/100).toString(16).padStart(2,'0');},change);
    row.append(swatch,hex,opacity,el('span',{class:'ui-color-percent','aria-hidden':'true'},'%'));return row;
  }
  fillInspector(layer,section){
    section.append(this.field('Fill type',layer.fillGradient?.type||'solid',type=>{
      if(type==='solid'){layer.fill=layer.fillGradient?.stops[0].color||layer.fill;delete layer.fillGradient;}
      else{layer.fillGradient=layer.fillGradient?{...layer.fillGradient,type}:{type,angle:0,centerX:.5,centerY:.5,radius:.5,stops:[{offset:0,color:layer.fill||'#ffffff'},{offset:1,color:'#009af4ff'}]};layer.fill='#ffffff';}
    },'text',[['solid','Solid'],['linear','Linear'],['radial','Radial']]));
    const gradient=layer.fillGradient;if(!gradient){section.append(this.colorEditor('Color',layer.fill||'#ffffff',v=>layer.fill=v));return;}
    section.append(el('div',{class:'ui-gradient-preview',role:'img','aria-label':gradient.type+' gradient preview',style:{backgroundImage:`url("${paintURL(layer.fill,gradient)}")`}}));
    const bounded=(label,value,change,min,max)=>{const field=this.field(label,value,change,'number');Object.assign(field.lastElementChild,{min,max,step:.1});return field;};
    if(gradient.type==='linear')section.append(bounded('Angle',gradient.angle??0,v=>gradient.angle=v,-3600,3600));
    else for(const [key,label,fallback,min,max]of [['centerX','Center X',.5,0,100],['centerY','Center Y',.5,0,100],['radius','Radius',.5,1,200]])section.append(bounded(label,(gradient[key]??fallback)*100,v=>gradient[key]=v/100,min,max));
    const heading=el('div',{class:'ui-gradient-stops-heading'}),add=this.iconButton('plus','Add color stop',()=>this.edit(()=>{const stops=gradient.stops;let index=0;for(let i=1;i<stops.length-1;i++)if(stops[i+1].offset-stops[i].offset>stops[index+1].offset-stops[index].offset)index=i;stops.splice(index+1,0,{offset:(stops[index].offset+stops[index+1].offset)/2,color:stops[index].color});}));add.disabled=gradient.stops.length>=8;heading.append(el('strong',{},'Stops'),add);section.append(heading);
    for(const [index,stop]of gradient.stops.entries()){
      const row=el('div',{class:'ui-gradient-stop','data-inspector-key':'stop:'+index}),position=bounded('Stop '+(index+1)+' position',Number((stop.offset*100).toFixed(1)),v=>{stop.offset=v/100;gradient.stops.sort((a,b)=>a.offset-b.offset);},0,100),remove=this.iconButton('minus','Remove color stop '+(index+1),()=>this.edit(()=>gradient.stops.splice(index,1)));remove.disabled=gradient.stops.length<=2;
      row.append(position,this.colorEditor('Stop '+(index+1)+' color',stop.color,v=>stop.color=v),remove);section.append(row);
    }
    section.append(this.button('Reverse colors',()=>this.edit(()=>{gradient.stops=gradient.stops.map(stop=>({...stop,offset:1-stop.offset})).reverse();})));
  }
  paintWebTMP(layer,content,font,preset) {
    let box=content.querySelector('.ui-tmp-web-preview');
    if(!box){box=el('div',{class:'ui-tmp-web-preview'});box.append(el('span'));content.append(box);}
    const text=box.firstElementChild,s=layer.tmpSettings||{},m=layer.tmpMaterial||{},properties=new Map((preset?.properties||[]).map(p=>[p.name,p.value]));
    const value=(key,fallback)=>m.floats?.[key]??m.colors?.[key]??properties.get(key)??fallback,enabled=key=>m.keywords?.[key]??preset?.keywords?.includes(key);
    const plain=s.richText?(layer.text||'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/?(?:b|i|u|s|color|size|align|font|material|sprite|mark|voffset|cspace|mspace|space|indent|line-indent|margin|nobr|noparse|page|sub|sup|link)(?:[=\s][^>]*)?>/gi,''):layer.text||'';
    const family=[font?.sourceFontGuid,...(font?.fallbackFontGuids||[])].filter(Boolean).map(g=>`"ui-${g}"`).concat(['Arial','sans-serif']).join(','),width=Math.max(1,layer.width-(s.marginLeft||0)-(s.marginRight||0)),height=Math.max(1,layer.height-(s.marginTop||0)-(s.marginBottom||0));
    let size=layer.fontSize||24;
    if(s.autoSize){this.tmpMeasure??=document.createElement('canvas').getContext('2d');const ctx=this.tmpMeasure,spacing=s.characterSpacing||0,word=s.wordSpacing||0;
      const fits=px=>{ctx.font=`${s.italic?'italic ':''}${layer.bold?'bold ':''}${px}px ${family}`;let lines=0,maxWidth=0;for(const line of plain.split('\n')){let used=0;for(const token of line.split(/(\s+)/)){const measured=ctx.measureText(token).width+Math.max(0,token.length-1)*spacing+(token.trim()?0:word);if(s.wordWrapping!==false&&used>0&&used+measured>width){lines++;maxWidth=Math.max(maxWidth,used);used=measured;}else used+=measured;}lines++;maxWidth=Math.max(maxWidth,used);}return maxWidth<=width&&lines*(px*1.2+(s.lineSpacing||0))+(plain.split('\n').length-1)*(s.paragraphSpacing||0)<=height;};
      let low=s.fontSizeMin??18,high=s.fontSizeMax??72;for(let i=0;i<9;i++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid;}size=low;
    }
    Object.assign(box.style,{left:(s.marginLeft||0)+'px',top:(s.marginTop||0)+'px',width:width+'px',height:height+'px',alignItems:s.verticalAlign==='top'?'flex-start':s.verticalAlign==='bottom'?'flex-end':'center',overflow:s.overflow==='overflow'?'visible':'hidden'});
    const color=(hex,fallback='#ffffffff')=>/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(hex||'')?hex:fallback;
    const face=color(value('_FaceColor','#ffffffff')),tint=color(layer.textColor),mix='#'+[0,1,2,3].map(i=>Math.round(parseInt((face.slice(1)+'ff').slice(i*2,i*2+2),16)*parseInt((tint.slice(1)+'ff').slice(i*2,i*2+2),16)/255).toString(16).padStart(2,'0')).join('');
    const metrics=tmpWebMaterialMetrics(font,preset,m,size),underlay=enabled('UNDERLAY_ON')||enabled('UNDERLAY_INNER'),glow=enabled('GLOW_ON'),shadows=[];
    const multiply=(a,b)=>'#'+[0,1,2,3].map(i=>Math.round(parseInt((a.slice(1)+'ff').slice(i*2,i*2+2),16)*parseInt((b.slice(1)+'ff').slice(i*2,i*2+2),16)/255).toString(16).padStart(2,'0')).join('');
    const outlineColor=multiply(color(value('_OutlineColor','#000000ff')),tint);
    if(underlay)shadows.push(`${metrics.underlayX}px ${metrics.underlayY}px ${metrics.underlaySoftness}px ${multiply(color(value('_UnderlayColor','#00000080')),tint)}`);
    if(glow&&metrics.glowPixels)shadows.push(`0 0 ${metrics.glowPixels}px ${multiply(color(value('_GlowColor','#ffffffff')),tint)}`);
    if(metrics.softnessPixels&&metrics.outlinePixels)shadows.push(`0 0 ${metrics.softnessPixels}px ${outlineColor}`);
    if(metrics.dilatePixels>0)for(const [x,y]of [[1,0],[-1,0],[0,1],[0,-1]])shadows.push(`${x*metrics.dilatePixels}px ${y*metrics.dilatePixels}px 0 ${mix}`);
    Object.assign(text.style,{fontFamily:family,fontSize:size+'px',fontWeight:layer.bold?'700':'400',fontStyle:s.italic?'italic':'normal',color:mix,whiteSpace:s.wordWrapping===false?'pre':'pre-wrap',overflowWrap:'normal',letterSpacing:(s.characterSpacing||0)+'px',wordSpacing:(s.wordSpacing||0)+'px',lineHeight:(size*1.2+(s.lineSpacing||0))+'px',textAlign:layer.textAlign||'center',webkitTextStroke:`${metrics.outlineEm}em ${outlineColor}`,paintOrder:'fill stroke',textShadow:shadows.join(','),overflow:s.overflow==='ellipsis'?'hidden':'visible',textOverflow:s.overflow==='ellipsis'?'ellipsis':'clip'});
    text.replaceChildren();
    // Parse a small safe TMP rich-text subset into spans; never inject authored HTML.
    if(s.richText){const stack=[text],pattern=/<(\/?)(b|i|u|s|color|size|br)(?:=([^>]*))?\s*\/?>/gi;let offset=0,match;while((match=pattern.exec(layer.text||''))){stack.at(-1).append(document.createTextNode(layer.text.slice(offset,match.index)));offset=pattern.lastIndex;const tag=match[2].toLowerCase();if(tag==='br'){stack.at(-1).append(document.createTextNode('\n'));continue;}if(match[1]){if(stack.length>1)stack.pop();continue;}const span=el('span');if(tag==='b')span.style.fontWeight='700';if(tag==='i')span.style.fontStyle='italic';if(tag==='u'||tag==='s')span.style.textDecoration=tag==='u'?'underline':'line-through';if(tag==='color')span.style.color=color((match[3]||'').replace(/["']/g,''),mix);if(tag==='size'&&/^\d+(?:\.\d+)?%?$/.test(match[3]||''))span.style.fontSize=match[3].endsWith('%')?match[3]:Math.min(512,Number(match[3]))+'px';stack.at(-1).append(span);stack.push(span);}stack.at(-1).append(document.createTextNode((layer.text||'').slice(offset)));}
    else text.textContent=plain;
    for(const run of text.querySelectorAll('span'))run.style.webkitTextStrokeWidth=metrics.outlineEm+'em';
    box.hidden=false;box.title='Web preview · '+Math.round(size*100)/100+' px · outline '+Math.round(metrics.outlinePixels*100)/100+' px';
  }
  clampTMPMaterials() {
    let changed=false;
    for(const layer of this.doc.layers){if(!layer.textMeshPro||layer.standaloneText)continue;
      const font=(this.config.tmpFonts||[]).find(f=>f.key===layer.tmpFont)||(this.config.tmpFonts||[]).find(f=>f.isDefault)||(this.config.tmpFonts||[])[0],preset=font?.materials?.find(p=>p.key===layer.tmpMaterial?.preset)||font?.materials?.[0];
      for(const p of preset?.properties||[]){const value=layer.tmpMaterial?.floats?.[p.name];if(typeof value!=='number')continue;const bounded=Math.max(p.min??-1000,Math.min(p.max??1000,value));if(value!==bounded){layer.tmpMaterial.floats[p.name]=bounded;changed=true;}}
    }
    return changed;
  }
  repairTMPMaterials() {
    const before=this.snapshot();if(!this.clampTMPMaterials())return false;
    this.remember(before);this.message('TMP material values were adjusted to shader limits. Save to keep the repair.');return true;
  }
  tmpInspector(layer,section) {
    const font=this.tmpFontFor(layer);
    const settings=section('Text layout'),s=layer.tmpSettings||{};
    if(!font)settings.append(el('p',{class:'ui-help'},'Import a TTF/OTF/WOFF font using Import.'));
    const set=(key,value)=>{layer.tmpSettings={...(layer.tmpSettings||{}),[key]:value};};
    settings.classList.add('ui-text-settings');settings.append(this.fontStyleControl(layer,true));
    const size=el('div',{class:'ui-font-size-row','data-inspector-key':'font-size-row'});
    size.append(this.field('Font size',layer.fontSize,v=>layer.fontSize=v,'number'),this.field('Auto Size',s.autoSize??false,v=>set('autoSize',v),'checkbox'));settings.append(size);
    const numbers=new Map(tmpSettingNumbers.map(([key,value,min,max])=>[key,{value,min,max}]));
    const numeric=(key,label,caption)=>{const {value,min,max}=numbers.get(key),field=this.field(label,s[key]??value,v=>set(key,v),'number');Object.assign(field.lastElementChild,{min,max,step:'any',title:label});field.firstElementChild.textContent=caption;field.title=label;return field;};
    if(s.autoSize){const range=el('div',{class:'ui-property-grid ui-inline-properties','data-inspector-key':'auto-size-range'});range.append(numeric('fontSizeMin','Font size min','Min'),numeric('fontSizeMax','Font size max','Max'));settings.append(range);}
    const options=el('div',{class:'ui-check-row','data-inspector-key':'text-options'});
    for(const [key,label,value]of [['wordWrapping','Word wrapping',true],['richText','Rich text',false]])options.append(this.field(label,s[key]??value,v=>set(key,v),'checkbox'));settings.append(options);
    const alignment=el('div',{class:'ui-field','data-inspector-key':'field:Vertical align'}),alignmentButtons=el('div',{class:'ui-text-alignment',role:'group','aria-label':'Vertical align'});
    for(const [value,title]of [['top','Top'],['middle','Middle'],['bottom','Bottom']]){
      const button=this.iconButton('textAlign'+title,'Align text '+value,()=>this.edit(()=>set('verticalAlign',value)));
      button.setAttribute('aria-pressed',String((s.verticalAlign||'middle')===value));alignmentButtons.append(button);
    }
    alignment.append(el('span',{},'Vertical align'),alignmentButtons);
    settings.append(alignment,this.field('Overflow',s.overflow||'truncate',v=>set('overflow',v),'text',[['overflow','Overflow'],['truncate','Truncate'],['ellipsis','Ellipsis'],['masking','Masking']]));
    const spacing=el('div',{class:'ui-property-grid ui-inline-properties','data-inspector-key':'text-spacing'}),margins=el('div',{class:'ui-property-grid ui-inline-properties','data-inspector-key':'text-margins'});
    for(const [key,label,caption]of [['characterSpacing','Character spacing','Char'],['wordSpacing','Word spacing','Word'],['lineSpacing','Line spacing','Line'],['paragraphSpacing','Paragraph spacing','Para']])spacing.append(numeric(key,label,caption));
    for(const [key,caption]of [['marginLeft','L'],['marginTop','T'],['marginRight','R'],['marginBottom','B']])margins.append(numeric(key,key.replace('margin','Margin ').toLowerCase().replace(/^./,c=>c.toUpperCase()),caption));
    settings.append(el('p',{class:'ui-property-caption'},'Spacing'),spacing,el('p',{class:'ui-property-caption'},'Margins'),margins);
    if(layer.textStyle)return;

  }
  fontStyleControl(layer,includeItalic=false){
    const row=el('div',{class:'ui-field','data-inspector-key':'font-style'}),buttons=el('div',{class:'ui-font-style',role:'group','aria-label':'Font style'});
    row.append(el('span',{},'Font style'),buttons);
    for(const [key,label,glyph]of [['bold','Bold','B'],...(includeItalic?[['italic','Italic','I']]:[])]){
      const enabled=key==='bold'?!!layer.bold:!!layer.tmpSettings?.italic,button=this.button(glyph,()=>this.edit(()=>{
        if(key==='bold')layer.bold=!layer.bold;else layer.tmpSettings={...layer.tmpSettings,italic:!layer.tmpSettings?.italic};
      }));
      button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(enabled));button.title=label;button.classList.add('ui-font-style-'+key);buttons.append(button);
    }
    return row;
  }
  styledTextInspector(layer,section){
    const paint=section('Text Style'),values=resolvedTextStyle(layer,this.config.textStyles||[]);
    const set=(key,value)=>{layer.textStyle={...layer.textStyle,[key]:['strokeWidth','outlineWidth','innerOutlineWidth','extrusionX','extrusionY'].includes(key)?value/(layer.textStyle.scale??1):value};};
    const number=(label,key,min,max)=>{const field=this.field(label,values[key],v=>set(key,Math.max(min,Math.min(max,v))),'number');Object.assign(field.lastElementChild,{min,max,step:.1});return field;};
    const toggleGroup=(label,key,enabled,change)=>{
      const group=el('section',{class:'ui-style-effect','data-inspector-key':'text-effect:'+key}),toggle=this.field(label,enabled,change,'checkbox');
      toggle.classList.add('ui-effect-toggle');group.append(toggle);paint.append(group);return group;
    };
    paint.append(this.field('Style preset',layer.textStyle.preset||'',v=>layer.textStyle=v?{preset:v}:textStyleDefaults(),'text',[['','Custom style'],...(this.config.textStyles||[]).map(s=>[s.key,s.displayName||s.name])]),this.colorEditor('Face color',values.faceColor,v=>set('faceColor',v)));
    const gradient=toggleGroup('Face gradient','gradient',values.gradient,v=>set('gradient',v));
    if(values.gradient){
      const mode=values.gradientMode==='angle'?(Math.abs(Math.sin(values.gradientAngle*Math.PI/180))>=Math.abs(Math.cos(values.gradientAngle*Math.PI/180))?'vertical':'horizontal'):values.gradientMode;
      gradient.append(this.field('Gradient mode',mode,v=>{
        const hex=t=>'#'+evaluateTextGradient(values,t).map((n,i)=>Math.round(i===3?n*255:n).toString(16).padStart(2,'0')).join('');
        const first=hex(0),last=hex(1);
        const corners=mode==='single'?{topLeft:values.topLeft,topRight:values.topLeft,bottomLeft:values.topLeft,bottomRight:values.topLeft}:mode==='four-corners'?values:
          mode==='horizontal'?{topLeft:first,topRight:last,bottomLeft:first,bottomRight:last}:{topLeft:first,topRight:first,bottomLeft:last,bottomRight:last};
        set('gradientMode',v);set('gradientAngle',v==='horizontal'?0:90);
        if(v==='single'||v==='four-corners'){
          for(const key of ['topLeft','topRight','bottomLeft','bottomRight'])set(key,v==='single'?corners.topLeft:corners[key]);
        }else if(mode==='single'||mode==='four-corners'){
          const colors=[corners.topLeft,v==='horizontal'?corners.topRight:corners.bottomLeft];
          set('stops',colors.map((color,i)=>({offset:i,color})));
          set('alphaStops',colors.map((color,i)=>({offset:i,alpha:parseInt(color.slice(7)||'ff',16)/255})));
          set('gradientBlend','blend');
        }
      },'text',[['single','Single'],['horizontal','Horizontal Gradient'],['vertical','Vertical Gradient'],['four-corners','Four Corners Gradient']]));
      if(mode==='single'||mode==='four-corners'){
        for(const [key,label]of mode==='single'?[['topLeft','Color']]:[['topLeft','Top left'],['topRight','Top right'],['bottomLeft','Bottom left'],['bottomRight','Bottom right']]){
          const row=el('div',{class:'ui-field','data-inspector-key':'corner:'+key});
          row.append(el('span',{},label),this.colorEditor(label,values[key],v=>set(key,v)));gradient.append(row);
        }
      }else gradient.append(this.textGradientEditor(layer,values));
    }
    const effect=(label,key)=>{
      const enabled=textEffectEnabled(values,key),group=toggleGroup(label,key,enabled,v=>setTextEffect(layer,key,v,this.config.textStyles||[]));
      return enabled?group:null;
    };
    const edge=(group,key,label)=>{if(!group)return;const row=el('div',{class:'ui-effect-paint','data-inspector-key':key+'-paint'}),width=number(label+' width',key+'Width',0,64),input=el('div',{class:'ui-inline-properties'});width.firstElementChild.textContent='W';width.title=label+' width';input.append(width);row.append(input,this.colorEditor(label+' color',values[key+'Color'],v=>set(key+'Color',v)));group.append(row);};
    // Inner Outline is rendered by VinaGenText only (face-pass band inside the glyph edge).
    if(layer.standaloneText)edge(effect('Inner Outline','inner'),'innerOutline','Inner outline');
    edge(effect('Text Stroke','stroke'),'stroke','Stroke');
    edge(effect('Outer Outline','outline'),'outline','Outline');
    const depth=effect('3D Extrusion','extrusion');if(depth){
      const offsets=el('div',{class:'ui-property-grid ui-inline-properties','data-inspector-key':'extrusion-offsets'});
      for(const axis of ['X','Y']){const field=number('Extrusion '+axis,'extrusion'+axis,-128,128);field.firstElementChild.textContent=axis;offsets.append(field);}
      depth.append(offsets,this.colorEditor('Extrusion color',values.extrusionColor,v=>set('extrusionColor',v)));
    }
    const actions=el('div',{class:'ui-style-actions','data-inspector-key':'text-style-actions'}),sample=this.button('Get Tickets',()=>this.edit(()=>{layer.textStyle=textStyleDefaults();layer.textColor='#ffffffff';})),save=this.button('Save preset',async()=>{
      const before=JSON.stringify(layer.textStyle),preset=await this.api('ui-text-style-save',{style:copy(layer.textStyle),name:layer.name,text:layer.text,...(layer.psdImportFolder?{psdImportFolder:layer.psdImportFolder}:{})});
      this.config.textStyles=[...(this.config.textStyles||[]).filter(s=>s.key!==preset.key),preset];
      if(this.doc.layers.includes(layer)&&JSON.stringify(layer.textStyle)===before)this.edit(()=>layer.textStyle={preset:preset.key});
      this.message('Saved text style: '+preset.path);
    });
    sample.setAttribute('aria-label','Get Tickets style');save.setAttribute('aria-label','Save style preset');actions.append(sample,save);paint.append(actions,el('p',{class:'ui-help'},'Text effects render locally in the browser. Save reusable styles with your document.'));
  }
  textContentControl(layer){
    const row=el('div',{class:'ui-field','data-inspector-key':'text-content-control'}),button=this.button((layer.text||'').replace(/\s+/g,' ').trim()||'Enter text…',event=>this.openTextBubble(layer.id,event.currentTarget));
    button.className='ui-text-content-button';button.setAttribute('aria-label','Edit text');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded',String(this.textBubble?.layerId===layer.id));button.title=layer.text||'Enter text';row.append(el('span',{},'Text'),button);return row;
  }
  closeTextBubble(){
    const bubble=this.textBubble;if(!bubble)return;
    this.textBubble=null;
    if(bubble.document===this.doc)this.remember(bubble.before);
    bubble.input.blur();bubble.controller.abort();bubble.node.remove();
    this.right.querySelector('.ui-text-content-button')?.setAttribute('aria-expanded','false');
  }
  openTextBubble(layerId,anchor){
    if(this.textBubble?.layerId===layerId){this.closeTextBubble();return;}
    this.closeTextBubble();
    const layer=this.doc.layers.find(item=>item.id===layerId);if(!layer)return;
    const node=el('div',{class:'ui-text-bubble',role:'dialog','aria-label':'Edit text content'}),header=el('div',{class:'ui-text-bubble-header'}),input=el('textarea',{'aria-label':'Text',rows:5,spellcheck:'false'}),controller=new AbortController();
    input.value=layer.text||'';header.append(el('strong',{},'Text'),this.iconButton('close','Close text editor',()=>this.closeTextBubble()));node.append(header,input,el('small',{},'Updates while typing · Esc to close'));
    input.oninput=()=>{
      if(this.busy)return;const current=this.doc.layers.find(item=>item.id===layerId);if(!current)return;
      const previous=current.text;current.text=input.value;
      try{validateDocument(this.doc);}catch(error){current.text=previous;this.message(error,true);return;}
      if(previous===current.text)return;this.version++;this.dirty=true;this.paintAll();this.queueDraft();
    };
    input.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this.closeTextBubble();anchor.focus({preventScroll:true});}};
    document.body.append(node);this.textBubble={node,input,layerId,document:this.doc,before:this.snapshot(),controller};
    const place=()=>{
      const current=this.right.querySelector('.ui-text-content-button');if(!current?.isConnected){this.closeTextBubble();return;}
      const rect=current.getBoundingClientRect(),width=Math.min(300,window.innerWidth-24),height=node.getBoundingClientRect().height;
      node.style.width=width+'px';node.style.left=Math.max(12,this.right.getBoundingClientRect().left-width-12)+'px';node.style.top=Math.max(12,Math.min(window.innerHeight-height-12,rect.top-12))+'px';
    };place();
    document.addEventListener('pointerdown',event=>{if(!node.contains(event.target)&&!event.target.closest('.ui-text-content-button'))this.closeTextBubble();},{capture:true,signal:controller.signal});
    window.addEventListener('resize',place,{signal:controller.signal});this.right.addEventListener('scroll',place,{capture:true,signal:controller.signal});
    input.focus({preventScroll:true});input.setSelectionRange(input.value.length,input.value.length);
  }
  textGradientEditor(layer,values){
    if(this.gradientSelectionDocument!==this.doc){this.gradientSelectionDocument=this.doc;this.gradientSelections=new Map();}
    const selection=this.gradientSelections.get(layer.id)||{kind:'color',index:0};this.gradientSelections.set(layer.id,selection);
    const colors=values.stops,alphas=gradientAlphaStops(values),keys=selection.kind==='color'?colors:alphas;
    selection.index=Math.max(0,Math.min(keys.length-1,selection.index));
    const mutate=fn=>{
      layer.textStyle.alphaStops??=copy(gradientAlphaStops(values));layer.textStyle.stops??=copy(values.stops);
      // Once alpha has its own track, color keys carry only RGB.
      for(const stop of layer.textStyle.stops)stop.color=stop.color.slice(0,7)+'ff';
      fn(layer.textStyle.stops,layer.textStyle.alphaStops);
    };
    const move=(kind,index,t)=>mutate((colors,alphas)=>{const list=kind==='color'?colors:alphas,key=list[index];key.offset=Math.max(0,Math.min(1,t));list.sort((a,b)=>a.offset-b.offset);selection.kind=kind;selection.index=list.indexOf(key);});
    const add=(kind,t)=>this.edit(()=>mutate((colors,alphas)=>{
      const list=kind==='color'?colors:alphas;if(list.length>=8)return;
      const rgba=evaluateTextGradient(values,t),key=kind==='color'?{offset:t,color:'#'+rgba.slice(0,3).map(value=>Math.round(value).toString(16).padStart(2,'0')).join('')+'ff'}:{offset:t,alpha:rgba[3]};
      list.push(key);list.sort((a,b)=>a.offset-b.offset);selection.kind=kind;selection.index=list.indexOf(key);
    }));
    const remove=()=>this.edit(()=>mutate((colors,alphas)=>{const list=selection.kind==='color'?colors:alphas;if(list.length>2){list.splice(selection.index,1);selection.index=Math.min(selection.index,list.length-1);}}));
    const editor=el('div',{class:'ui-text-gradient-editor','data-inspector-key':'text-gradient'});
    editor.append(this.field('Blend',values.gradientBlend||'blend',value=>layer.textStyle.gradientBlend=value,'text',[['blend','Blend (Classic)'],['fixed','Fixed']]));
    const track=el('div',{class:'ui-gradient-track','data-inspector-key':'gradient-track'}),ramp=el('div',{class:'ui-gradient-ramp',style:{backgroundImage:textGradientRamp(values)}});
    ramp.title='Click below the ramp to add a color key; above to add an alpha key.';track.append(ramp);
    for(const [kind,list]of [['alpha',alphas],['color',colors]]){
      const lane=el('div',{class:'ui-gradient-keys ui-gradient-'+kind+'-keys','data-kind':kind,'data-inspector-key':'gradient-keys:'+kind,onpointerdown:e=>{
        if(e.button!==0||e.target.closest('.ui-gradient-key'))return;e.preventDefault();e.stopPropagation();const rect=e.currentTarget.getBoundingClientRect();add(kind,Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)));
      }});lane.title='Click to add '+kind+' key';
      for(const [index,key]of list.entries()){
        const selected=selection.kind===kind&&selection.index===index,label=(kind==='color'?'Color':'Alpha')+' key '+(index+1),handle=el('button',{type:'button',class:'ui-gradient-key'+(selected?' selected':''),role:'slider','aria-label':label,'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':Number((key.offset*100).toFixed(1)),'aria-valuetext':(key.offset*100).toFixed(1)+'%','data-inspector-key':'gradient-key:'+kind+':'+index,style:{left:(key.offset*100)+'%','--key-color':kind==='color'?key.color.slice(0,7):`rgb(${Math.round(key.alpha*255)} ${Math.round(key.alpha*255)} ${Math.round(key.alpha*255)})`},onpointerdown:e=>{
          if(e.button!==0)return;e.preventDefault();e.stopPropagation();selection.kind=kind;selection.index=index;e.currentTarget.focus({preventScroll:true});
          const rect=e.currentTarget.closest('.ui-gradient-track').getBoundingClientRect(),before=this.snapshot(),document=this.doc,startX=e.clientX,controller=new AbortController();let moved=false,target,dragFrame,pendingX;
          this.paintInspector();
          const draw=()=>{
            dragFrame=null;if(pendingX===undefined||this.doc!==document)return;const x=pendingX;pendingX=undefined;
            mutate((colors,alphas)=>{const list=kind==='color'?colors:alphas;target??=list[index];target.offset=Math.max(0,Math.min(1,(x-rect.left)/rect.width));list.sort((a,b)=>a.offset-b.offset);selection.index=list.indexOf(target);});
            moved=true;this.version++;this.dirty=true;this.paintAll();this.queueDraft();
          };
          window.addEventListener('pointermove',event=>{
            if(event.pointerId!==e.pointerId||this.doc!==document)return;if(!moved&&Math.abs(event.clientX-startX)<2)return;
            pendingX=event.clientX;if(!dragFrame)dragFrame=requestAnimationFrame(draw);
          },{signal:controller.signal});
          const finish=event=>{if(event.pointerId!==e.pointerId)return;controller.abort();if(dragFrame)cancelAnimationFrame(dragFrame);draw();if(moved&&this.doc===document)this.remember(before);this.paintInspector();};
          window.addEventListener('pointerup',finish,{signal:controller.signal});window.addEventListener('pointercancel',finish,{signal:controller.signal});
        },onkeydown:e=>{
          if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();selection.kind=kind;selection.index=index;if(list.length>2)remove();}
          if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.edit(()=>move(kind,index,key.offset+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?.1:.01)));}
        }});handle.title=label+' · '+(key.offset*100).toFixed(1)+'%';lane.append(handle);
      }
      track.append(lane);
    }
    editor.append(track);
    const selected=keys[selection.index],controls=el('div',{class:'ui-gradient-key-controls','data-inspector-key':'gradient-key-controls'});
    if(selection.kind==='color'){
      const color=this.colorEditor('Gradient key color',selected.color,value=>mutate(colors=>colors[selection.index].color=value.slice(0,7)+'ff'));color.classList.add('ui-gradient-key-color');const field=el('div',{class:'ui-gradient-key-color-control'});field.append(el('span',{},'Color'),color);controls.append(field);
    }else{const alpha=this.field('Alpha',Number((selected.alpha*100).toFixed(1)),value=>mutate((_colors,alphas)=>alphas[selection.index].alpha=Math.max(0,Math.min(100,value))/100),'number');Object.assign(alpha.lastElementChild,{min:0,max:100,step:.1});controls.append(alpha);}
    const location=this.field('Location',Number((selected.offset*100).toFixed(1)),value=>move(selection.kind,selection.index,value/100),'number');Object.assign(location.lastElementChild,{min:0,max:100,step:.1});controls.append(location);
    const trash=this.iconButton('minus','Remove selected gradient key',remove);trash.disabled=keys.length<=2;controls.append(trash);editor.append(controls);
    const actions=el('div',{class:'ui-gradient-add-keys'});for(const kind of ['color','alpha']){const button=this.button('Add '+kind+' key',()=>add(kind,.5));button.disabled=(kind==='color'?colors:alphas).length>=8;actions.append(button);}editor.append(actions);
    this.savedTextGradients??=(()=>{try{const presets=JSON.parse(localStorage.getItem('vinagen-text-gradients')||'[]');return Array.isArray(presets)?presets.slice(0,20).filter(preset=>{try{if(typeof preset?.name!=='string'||preset.name.length>80)return false;validateTextStyle({role:'text',textMeshPro:true,textStyle:preset});return Array.isArray(preset.stops);}catch{return false;}}):[];}catch{return [];}})();
    const presets=el('div',{class:'ui-gradient-presets','data-inspector-key':'gradient-presets'});presets.append(el('span',{},'Presets'));
    for(const preset of [...textGradientPresets,...this.savedTextGradients]){
      const button=this.button('',()=>this.edit(()=>{layer.textStyle={...layer.textStyle,stops:copy(preset.stops),alphaStops:copy(preset.alphaStops||[{offset:0,alpha:1},{offset:1,alpha:1}]),gradientBlend:preset.gradientBlend||'blend'};selection.kind='color';selection.index=0;}));
      button.className='ui-gradient-preset';button.title=preset.name;button.setAttribute('aria-label','Gradient preset '+preset.name);button.style.backgroundImage=textGradientRamp(preset);presets.append(button);
    }
    const save=this.button('New',()=>{this.savedTextGradients=[...this.savedTextGradients,{name:'Gradient '+(this.savedTextGradients.length+1),stops:copy(values.stops),alphaStops:copy(gradientAlphaStops(values)),gradientBlend:values.gradientBlend||'blend'}].slice(-20);try{localStorage.setItem('vinagen-text-gradients',JSON.stringify(this.savedTextGradients));}catch{}this.paintInspector();});save.setAttribute('aria-label','Save gradient preset');presets.append(save);editor.append(presets);
    return editor;
  }
  anchorPicker(layer){
    const picker=this.inspectorFoldout('anchors','','ui-anchor-picker',false),summary=picker.firstElementChild,current=screenSized(layer,this.doc)?'stretch':layer.anchor||'top-left';
    summary.append(this.anchorIcon(current),el('span',{},'Anchors'),el('small',{},current.replaceAll('-',' ')));
    const grid=el('div',{class:'ui-anchor-grid',role:'group','aria-label':'Anchor Presets'});
    grid.append(el('span'));for(const title of ['left','center','right','stretch'])grid.append(el('span',{class:'ui-anchor-heading'},title));
    for(const [row,items]of anchorPresets.entries()){
      grid.append(el('span',{class:'ui-anchor-heading'},['top','middle','bottom','stretch'][row]));
      for(const preset of items){const b=this.button('',()=>this.edit(()=>layer.anchor=preset));b.className='ui-anchor-preset';b.setAttribute('aria-label','Anchor '+preset.replaceAll('-',' '));b.setAttribute('aria-pressed',String(preset===current));b.title=preset.replaceAll('-',' ');b.append(this.anchorIcon(preset));grid.append(b);}
    }
    picker.append(el('h4',{},'Anchor Presets'),grid,el('p',{class:'ui-help'},this.config.autoAdjustAnchors?'Auto anchors: 6 × 6 parent grid. Center: 2 × 4 cells for portrait screens, 4 × 2 for landscape, 4 × 4 for square. Moving or resizing recalculates the preset.':'Keeps the current position and size. Stretch adapts to the parent in Editor.'));return picker;
  }
  anchorIcon(preset){
    const {min,max}=anchorRange(preset),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 40 40');svg.setAttribute('aria-hidden','true');svg.classList.add('ui-anchor-icon');
    const shape=(tag,attrs)=>{const node=document.createElementNS(svg.namespaceURI,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);svg.append(node);};
    shape('rect',{x:4,y:4,width:32,height:32,class:'anchor-parent'});shape('rect',{x:12,y:12,width:16,height:16,class:'anchor-child'});
    shape('path',{d:`M${4+min.x*32} ${4+min.y*32}H${4+max.x*32}V${4+max.y*32}H${4+min.x*32}Z`,class:'anchor-range'});
    for(const x of new Set([min.x,max.x]))for(const y of new Set([min.y,max.y]))shape('rect',{x:2+32*x,y:2+32*y,width:4,height:4,class:'anchor-point'});
    return svg;
  }
  persistInspectorFolds() {
    if(!this.inspectorFolds)return;
    for(const details of this.right.querySelectorAll('details[data-inspector-key]'))this.inspectorFolds.set(details.dataset.inspectorKey,details.open);
    try{localStorage.setItem('vinagen-ui-inspector-folds:v1',JSON.stringify(Object.fromEntries(this.inspectorFolds)));}catch{}
  }
  inspectorFoldout(key,title,className='ui-inspector-section',defaultOpen=true) {
    if(!this.inspectorFolds){try{const saved=JSON.parse(localStorage.getItem('vinagen-ui-inspector-folds:v1')||'{}');this.inspectorFolds=new Map(Object.entries(saved).filter(([,v])=>typeof v==='boolean'));}catch{this.inspectorFolds=new Map();}}
    const details=el('details',{class:className,'data-inspector-key':key}),summary=el('summary',{'data-inspector-key':'heading'},title);
    details.open=this.inspectorFolds.get(key)??defaultOpen;details.append(summary);
    const toggle=e=>{if(e.currentTarget.isConnected)this.persistInspectorFolds();};
    details.addEventListener('toggle',toggle);details._uiEvents=new Map([['toggle',toggle]]);
    return details;
  }
  paintInspector() {
    if(this.reconcilingInspector)return;
    const panel=el('div'),oldScroller=this.right.querySelector('.ui-inspector-content'),scrollTop=oldScroller?.scrollTop||0;
    // Capture native details state synchronously; the browser's toggle event is deferred.
    if(this.inspectorFolds)for(const details of this.right.querySelectorAll('details[data-inspector-key]'))this.inspectorFolds.set(details.dataset.inspectorKey,details.open);
    const selected=this.doc.layers.filter(l=>this.selected.has(l.id)),layer=selected.length===1?selected[0]:null;
    if(this.textBubble&&(this.textBubble.document!==this.doc||this.textBubble.layerId!==layer?.id||layer?.role!=='text'))this.closeTextBubble();
    const scope=this.path+'|'+[...this.selected].sort().join('|'),sameSelection=this.inspectorScope===scope;
    if(!sameSelection)this.showAllSelectionColors=false;
    const inspector=el('div',{class:'ui-inspector-content','data-inspector-key':'scroller'});panel.append(inspector);
    const section=(title)=>{const s=title==='Layer type'?this.inspectorFoldout('section:Layer type',title):el('section',{class:'ui-inspector-section','data-inspector-key':'selection-summary'});if(title!=='Layer type')s.append(el('h3',{},title));inspector.append(s);return s;};
    const summary=section(layer?.name|| (selected.length?`${selected.length} layers`:'Design canvas'));
    summary.classList.add('ui-selection-summary');summary.prepend(this.icon(layer?.shape||({text:'text',group:'frame',empty:'frame'})[layer?.role]||'image'));
    summary.append(el('p',{class:'ui-hint'},layer?(layer.shape||layer.role)+' · '+Math.round(layer.width)+' × '+Math.round(layer.height):selected.length?'Align, group and label your selection':this.doc.width+' × '+this.doc.height+' · Reference resolution'));
    const unity=section('Layer type');
    if(selected.length){
      unity.append(this.field('Role',layer?.role||selected[0].role,v=>this.setRoles(selected,v),'text',roles.map(r=>[r,r[0].toUpperCase()+r.slice(1)])));
    }else unity.append(el('p',{class:'ui-help'},'Select a layer to assign its component.'));
    const design=el('div',{'data-inspector-key':'design-sections'});inspector.append(design);
    const designSection=title=>{const s=this.inspectorFoldout('section:'+title,title);design.append(s);return s;};
    if(!selected.length) {
      const screen=designSection('Screen');screen.append(this.field('Width',this.doc.width,v=>{this.doc.width=v;this.fit();},'number'),this.field('Height',this.doc.height,v=>{this.doc.height=v;this.fit();},'number'));
      const imports=designSection('PSD import');imports.append(this.field('Default font',this.psdFallbackKey(),v=>{
        this.doc.psdFallbackFont=v;

        for(const item of this.doc.layers)if(item.role==='text'&&item.psdMissingFontName){if(v)applyPSDFallbackFont(item,this.config,v);else{delete item.tmpFont;delete item.tmpMaterial;}}
      },'text',[['','Automatic / project default'],...psdFallbackFonts(this.config).map(f=>[f.key,f.name+(f.standalone?' · Styled Text':' · Text')])]),el('p',{class:'ui-help'},'Used when the PSD font is unavailable. Fonts come from UI Designer Settings. Matching PSD fonts keep priority.'));
      screen.querySelector(':scope > summary').title='Drop PNG, JPEG or PSD onto the canvas. Use Project Assets to reuse project artwork. Space + drag to pan · Ctrl/Cmd + wheel to zoom · Shift + 1 to fit · Shift + resize to keep image proportions.';
    } else {
      const position=designSection('Position');position.append(el('p',{class:'ui-property-caption'},'Alignment'));
      const align=el('div',{class:'ui-alignment'});for(const [mode,name,title]of [['left','alignLeft','Align left'],['center','alignCenter','Align horizontal center'],['right','alignRight','Align right'],['top','alignTop','Align top'],['middle','alignMiddle','Align vertical center'],['bottom','alignBottom','Align bottom']])align.append(this.iconButton(name,title,()=>this.align(mode)));position.append(align);
      if(layer) {
        unity.append(this.field('Name',layer.name,v=>layer.name=v));
        const excluded=descendants(this.doc,[layer.id]),parentOptions=[['','Design board'],...this.doc.layers.filter(l=>!excluded.has(l.id)&&parentRoles.includes(l.role)).map(l=>[l.id,l.name])];
        unity.append(this.field('Parent',layer.parentId,v=>moveLayers(this.doc,[layer.id],v),'text',parentOptions));
        const coordinates=el('div',{class:'ui-property-grid ui-inline-properties'});for(const [key,name]of [['x','X'],['y','Y']])coordinates.append(this.field(name,layer[key],v=>layer[key]=v,'number'));
        position.append(el('p',{class:'ui-property-caption'},'Position'),coordinates,this.field('Rotation',layer.rotation||0,v=>layer.rotation=v,'number'),el('span'));
        const layout=designSection('Layout'),dimensions=el('div',{class:'ui-property-grid ui-inline-properties'});for(const [key,name]of [['width','W'],['height','H']]){const field=this.field(name,layer[key],v=>layer[key]=Math.max(1,v),'number');field.lastElementChild.min=1;dimensions.append(field);}layout.append(el('p',{class:'ui-property-caption'},'Dimensions'),dimensions);
        const appearance=designSection('Appearance');appearance.append(this.field('Opacity',layer.opacity??1,v=>layer.opacity=v,'number'),this.field('Blend mode',layer.blendMode||'normal',v=>layer.blendMode=v,'text',blendModes.filter(mode=>mode!=='pass-through'||['empty','group'].includes(layer.role)).map(mode=>[mode,mode.replaceAll('-', ' ').replace(/\b\w/g,c=>c.toUpperCase())])));
        if(!['text','group','empty'].includes(layer.role)&&!isOpenShape(layer))this.fillInspector(layer,designSection('Fill'));
        if(layer.shape){const stroke=designSection('Stroke');stroke.append(this.colorEditor('Stroke color',layer.stroke||'#000000',v=>layer.stroke=v),this.field(isOpenShape(layer)?'Thickness':'Stroke width',shapeStrokeWidth(layer),v=>layer.strokeWidth=v,'number'));const shape=designSection('Shape');shape.append(this.field('Shape type',layer.shape,v=>setShapeType(layer,v),'text',shapeTools.map(([id,label])=>[id,label])));if(['polygon','star'].includes(layer.shape))shape.append(this.field('Points',layer.shapeSides||3,v=>layer.shapeSides=v,'number'));if(layer.shape==='star')shape.append(this.field('Inner radius',layer.starInnerRadius??.45,v=>layer.starInnerRadius=v,'number'));}
        if(layer.role==='text') {
          const typography=designSection('Typography');
          typography.append(this.field('Text type',textRenderer(layer),v=>{
            const source=this.tmpFontFor(layer)?.sourceFontGuid;
            if(v==='text'&&source&&this.config.fonts?.some(f=>f.guid===source))layer.fontGuid=source;
            else if(v!=='text'){
              const fonts=this.textFontsFor({standaloneText:v==='vinaGenText'});
              if(!layer.textMeshPro&&layer.fontGuid){const match=fonts.find(f=>f.sourceFontGuid===layer.fontGuid);if(match)layer.tmpFont=match.key;}
              else if(layer.tmpFont&&!fonts.some(f=>f.key===layer.tmpFont)){const match=fonts.find(f=>f.sourceFontGuid===source);if(match)layer.tmpFont=match.key;else delete layer.tmpFont;delete layer.tmpMaterial;}
            }
            setTextRenderer(layer,v);this.liveTextBindings?.delete(layer.id);
          },'text',textRenderers),this.textContentControl(layer));
          const font=layer.textMeshPro?this.field('Font',layer.tmpFont||'',v=>{layer.tmpFont=v;delete layer.tmpMaterial;delete layer.psdMissingFontName;},'text',[['','Default font'],...this.textFontsFor(layer).map(f=>[f.key,f.displayName||f.name])]):this.field('Font',layer.fontGuid||'',v=>{layer.fontGuid=v;delete layer.psdMissingFontName;},'text',[['','Default / Arial'],...(this.config.fonts||[]).map(f=>[f.guid,f.displayName||f.name])]);
          typography.append(font);
          if(!layer.textMeshPro)typography.append(this.fontStyleControl(layer),this.field('Font size',layer.fontSize,v=>layer.fontSize=v,'number'));
          typography.append(this.colorEditor('Text color',layer.textColor||'#ffffff',v=>layer.textColor=v),this.field('Text align',layer.textAlign||'center',v=>layer.textAlign=v,'text',[['left','Left'],['center','Center'],['right','Right']]));
          typography.append(this.field('Text path',layer.textCurve?'arc':'straight',v=>{if(v==='arc')layer.textCurve={angle:90};else delete layer.textCurve;},'text',[['straight','Straight'],['arc','Arc']]));
          if(layer.textCurve)typography.append(this.field('Curve angle',layer.textCurve.angle,v=>layer.textCurve.angle=v,'number'),el('p',{class:'ui-help'},'−360° to 360°. Positive arches up; negative arches down.'));
          if(layer.textMeshPro)this.tmpInspector(layer,designSection);
          if(layer.textStyle)this.styledTextInspector(layer,designSection);
        }
        if(layer.role!=='text'){const image=designSection('Image');if(!['group','empty'].includes(layer.role))image.append(this.button(layer.image?'Replace image':'Choose project image',()=>this.assets(layer.id)));if(layer.image){
          image.append(this.field('Image mode',imageMode(layer),v=>setImageMode(layer,v),'text',imageModes));
          if(imageMode(layer)==='nine_slice'){
            image.append(el('div',{class:'ui-slice-guide','aria-label':'Automatic 9-slice bands',title:'Repeated pixel bands; color tolerance 3/255, margin 2 px, center 2 px. Save includes each shared image once in the document package.'}));
            const slice=this.elements.get(layer.id)?.querySelector('.ui-sliced-image');if(slice?._sourceSize)queueMicrotask(()=>this.paintSliceGuide(layer,slice._sourceSize,slice._borders));
          }
        }
        if(layer.image){image.append(el('img',{class:'ui-inspector-image',src:media(layer.image),alt:layer.image.name||'Layer image'}),el('p',{class:'ui-hint'},layer.image.path||''),this.button('Reset to image size',async()=>{const reference=layer.image;const asset=await this.api('ui-resolve-image',{path:reference.path});if(layer.image!==reference||!this.doc.layers.includes(layer))return;if(asset.image.guid!==reference.guid||String(asset.image.localId||'')!==String(reference.localId||''))throw Error('Choose this sprite from Project Assets to restore its original size.');this.edit(()=>{layer.width=asset.width;layer.height=asset.height;});}),this.button('Remove image',()=>this.edit(()=>delete layer.image)));this.imageResizeControl(layer,image);}
        const fusion=this.button('Fusion images',()=>this.fusionImages(layer.id));fusion.disabled=this.busy||this.pngExporting||this.psdExporting||this.imageFusing;
        fusion.title='Merge visible child images into this object. Text stays editable. Undo restores the original layers.';image.append(fusion);}

        if(['horizontal','vertical','grid'].includes(layer.groupType)){
          const group=designSection(groupTypes.find(([id])=>id===layer.groupType)?.[1]||'Layer type');
          const applyLayout=()=>{if(['horizontal','vertical','grid'].includes(layer.groupType)){const options=layer.layout||{};autoLayout(this.doc,layer.id,layer.groupType,options.gap??16,options.padding??16,options);}};
          if(['horizontal','vertical','grid'].includes(layer.groupType)){
            for(const [key,label,fallback]of [['gap','Spacing',16],['padding','Padding',16],...(layer.groupType==='grid'?[['columns','Columns',1],['cellWidth','Cell width',160],['cellHeight','Cell height',160]]:[])])group.append(this.field(label,layer.layout?.[key]??fallback,v=>{layer.layout={...(layer.layout||{}),direction:layer.groupType,[key]:v};applyLayout();},'number'));
          }
          group.append(this.button('Remove component',()=>this.edit(()=>{layer.groupType='rect';delete layer.layout;})));
        }
      }
    }
    if(selected.length){const solidImage=selected.length===1&&['image','button'].includes(selected[0].role)&&!selected[0].image&&!selected[0].shape&&!selected[0].fillGradient, included=solidImage||layer?.shape?new Set(this.selected):descendants(this.doc,this.selected),colors=new Map();
      const add=(item,key,fallback)=>{const color=item[key]||fallback,normalized=color.toLowerCase()+(color.length===7?'ff':'');if(!colors.has(normalized))colors.set(normalized,[]);colors.get(normalized).push({item,key});};
      for(const item of this.doc.layers)if(included.has(item.id)){
        if(item.shape){for(const binding of shapePaintBindings(item))add(binding.item,binding.key,binding.fallback);continue;}
        for(const key of item.role==='text'?['textColor']:['image','button'].includes(item.role)&&!item.fillGradient?['fill']:[])add(item,key,'#ffffff');for(const stop of item.fillGradient?.stops||[])add(stop,'color','#ffffff');
      }
      if(colors.size){const section=designSection('Selection colors');
        if(solidImage){const item=selected[0],transparent=/00$/i.test((item.fill||'#ffffff').length===9?item.fill:'ff');const actions=el('div',{class:'ui-button-row'}),add=this.iconButton('plus','Add selection color',()=>this.edit(()=>item.fill='#ffffffff')),remove=this.iconButton('minus','Remove selection color',()=>this.edit(()=>item.fill=(item.fill||'#ffffff').slice(0,7)+'00'));add.disabled=!transparent;remove.disabled=transparent;actions.append(add,remove);section.append(actions);}
        let i=0;for(const [color,bindings]of colors){if(!this.showAllSelectionColors&&i>=20)break;section.append(this.colorEditor('Selection color '+(++i),color,v=>{for(const {item,key}of bindings)item[key]=v;}));}if(colors.size>20&&!this.showAllSelectionColors)section.append(this.button('See all '+colors.size+' colors',()=>{this.showAllSelectionColors=true;this.paintInspector();}));}
    }
    inspector.append(unity);
    if(selected.length){const handoff=el('div',{class:'ui-handoff','data-inspector-key':'handoff'}),add=this.button('Add layout / effect',e=>this.components.open(e.currentTarget));add.classList.add('ui-add-component');add.disabled=this.busy;handoff.append(add);panel.append(handoff);}
    // Descriptions belong on hover, while dimensions, asset paths and values stay visible.
    for(const hint of panel.querySelectorAll('.ui-help')){const parent=hint.parentElement,previous=hint.previousElementSibling,target=previous?.matches('.ui-field')?previous:parent.querySelector(':scope > summary')||parent;target.title=[target.title,hint.textContent].filter(Boolean).join('\n');hint.remove();}
    this.reconcilingInspector=true;
    try{reconcileInspector(this.right,panel);}finally{this.reconcilingInspector=false;}
    this.inspectorScope=scope;
    const scroller=this.right.querySelector('.ui-inspector-content');scroller.scrollTop=sameSelection?scrollTop:0;
  }
  setRoles(selected,role){role=canonicalRole(role);for(const layer of selected){const previousRole=layer.role;layer.role=role;if(!['image','button'].includes(role)){delete layer.shape;delete layer.fillGradient;}if(role!=='text'){layer.textMeshPro=false;delete layer.textRenderer;delete layer.sourceTextPaint;delete layer.textCurve;delete layer.textStyle;delete layer.standaloneText;this.liveTextBindings?.delete(layer.id);}if(role==='text'){if(previousRole!=='text')setTextRenderer(layer,'vinaGenText');delete layer.canvasRoot;if(layer.groupType==='canvas')layer.canvasGroup=true;delete layer.groupType;delete layer.layout;}}}
  label(role){this.edit(()=>this.setRoles(this.doc.layers.filter(l=>this.selected.has(l.id)),role));}
  remove(){this.edit(()=>{const ids=descendants(this.doc,this.selected);this.doc.layers=this.doc.layers.filter(l=>!ids.has(l.id));this.selected.clear();});}
  align(mode){this.edit(()=>alignLayers(this.doc,this.selected,mode));}
  centerInParent(){this.edit(()=>alignLayers(this.doc,this.selected,'center',true));}
  distribute(axis){this.edit(()=>{const selected=roots(this.doc,this.selected).sort((a,b)=>a[axis]-b[axis]);if(selected.length<3)return;if(selected.some(l=>l.parentId!==selected[0].parentId))throw Error('Distribute layers with the same parent.');const dimension=axis==='x'?'width':'height',first=selected[0][axis],last=selected.at(-1)[axis]+selected.at(-1)[dimension],gap=(last-first-selected.reduce((n,l)=>n+l[dimension],0))/(selected.length-1);let cursor=first;for(const l of selected){l[axis]=cursor;cursor+=l[dimension]+gap;}});}
  point(clientX,clientY,rect=this.viewport.getBoundingClientRect()){return {x:(clientX-rect.left-this.pan.x)/this.zoom,y:(clientY-rect.top-this.pan.y)/this.zoom};}
  changeZoom(value,clientX,clientY){this.autoFit=false;const rect=this.viewport.getBoundingClientRect(),x=(clientX??rect.left+rect.width/2)-rect.left,y=(clientY??rect.top+rect.height/2)-rect.top;const world={x:(x-this.pan.x)/this.zoom,y:(y-this.pan.y)/this.zoom};this.zoom=Math.min(4,Math.max(.01,value));this.pan={x:x-world.x*this.zoom,y:y-world.y*this.zoom};this.paint();}
  fit(){const rect=this.viewport.getBoundingClientRect();if(!rect.width||!rect.height)return;const bounds=canvasBounds(this.doc),padding=Math.min(64,rect.width*.1,rect.height*.1);this.autoFit=true;this.zoom=Math.min(1,Math.max(.001,(rect.width-padding*2)/bounds.width),Math.max(.001,(rect.height-112)/bounds.height));this.pan={x:(rect.width-bounds.width*this.zoom)/2-bounds.x*this.zoom,y:(rect.height-48-bounds.height*this.zoom)/2-bounds.y*this.zoom};this.viewSize={width:rect.width,height:rect.height};this.paint();}
  imageHitTest(layer,point) {
    if(layer.shape)return shapeHit(layer,point);
    if(!layer.image||['text','group','empty'].includes(layer.role))return true;
    const source=this.elements.get(layer.id)?.firstElementChild.querySelector('img');
    if(!source?.complete||!source.naturalWidth)return true;
    const pixel=imageSourcePoint(layer,point,source.naturalWidth,source.naturalHeight,imageMode(layer)==='nine_slice'?(layer.image.slice||this.sliceBorders(source)):null);if(!pixel)return false;
    this.hitMasks??=new WeakMap();let mask=this.hitMasks.get(source);
    if(!mask){
      try{
        const canvas=el('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
        const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);
        const rgba=context.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(canvas.width*canvas.height);
        for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
        mask={width:canvas.width,alpha};canvas.width=canvas.height=1;
      }catch{mask={unavailable:true};}
      this.hitMasks.set(source,mask);
    }
    return mask.unavailable||mask.alpha[Math.floor(pixel.y)*mask.width+Math.floor(pixel.x)]>0;
  }
  pickLayer(point,e) {
    const hits=layerHitStack(this.doc,point,(layer,local)=>this.imageHitTest(layer,local)),ids=JSON.stringify(hits.map(l=>l.id)),previous=this.lastPick;
    const additive=e.shiftKey||e.ctrlKey||e.metaKey;
    const cycle=!additive&&hits.length>0&&previous?.doc===this.doc&&previous.version===this.version&&previous.ids===ids&&this.selected.size===1&&this.selected.has(previous.id);
    const index=cycle?(hits.findIndex(l=>l.id===previous.id)+1)%hits.length:0,layer=hits[index];
    // Commit the cycle only on a completed click, never on pointerdown or drag.
    return {hits,layer,pick:layer&&!additive?{doc:this.doc,version:this.version,ids,id:layer.id}:null};
  }
  commentAnchor(point){const hits=layerHitStack(this.doc,point);const layer=hits[0];if(!layer)return point;const pose=worldPose(this.doc,layer,this.indexes()),local=rotatePoint({x:point.x-pose.x,y:point.y-pose.y},-pose.rotation);return {x:local.x+layer.width/2,y:local.y+layer.height/2,layerId:layer.id,worldX:point.x,worldY:point.y};}
  commentPosition(thread){const layer=this.indexes().get(thread.layerId);if(!layer)return {x:thread.worldX??thread.x,y:thread.worldY??thread.y};const pose=worldPose(this.doc,layer,this.indexes()),local=rotatePoint({x:thread.x-layer.width/2,y:thread.y-layer.height/2},pose.rotation);return {x:pose.x+local.x,y:pose.y+local.y};}
  creationParent(){
    if(this.selected.size!==1)return null;
    const byId=this.indexes();let parent=byId.get([...this.selected][0]);
    while(parent&&!parentRoles.includes(canonicalRole(parent.role)))parent=byId.get(parent.parentId);
    return parent;
  }
  selectedCreationParent(){return this.indexes().get(this.creationTargetId)||this.creationParent();}
  revealCreationParent(parent){
    let changed=false;const byId=this.indexes();
    for(let item=parent;item;item=byId.get(item.parentId))changed=this.collapsedLayers.delete(item.id)||changed;
    if(changed)this.persistLayerFolds();
  }
  creationPoint(point,parent){
    if(!parent)return point;
    const pose=worldPose(this.doc,parent,this.indexes()),local=rotatePoint({x:point.x-pose.x,y:point.y-pose.y},-pose.rotation);
    return {x:local.x+parent.width/2,y:local.y+parent.height/2};
  }
  selectedScreenAt(point){
    if(this.selected.size!==1)return null;
    const byId=this.indexes(),screen=byId.get([...this.selected][0]);
    if(!screen||screen.locked||screen.visible===false||!isScreenRoot(screen,this.doc,this.doc))return null;
    const pose=worldPose(this.doc,screen,byId),local=rotatePoint({x:point.x-pose.x,y:point.y-pose.y},-pose.rotation);
    return Math.abs(local.x)<=screen.width/2&&Math.abs(local.y)<=screen.height/2?screen:null;
  }
  pointerDown(e) {
    if(e.button!==0&&e.button!==1||e.target.closest('.ui-viewbar,.ui-toolbar,.canvas-comments')||(this.busy&&!this.psdCancel))return;
    this.clearHover();
    e.preventDefault();this.viewport.focus();this.viewport.setPointerCapture(e.pointerId);
    const view=this.viewport.getBoundingClientRect(),point=this.point(e.clientX,e.clientY,view),base={pointer:e.pointerId,start:point,view,client:{x:e.clientX,y:e.clientY},before:this.snapshot()};
    this.autoFit=false;
    if(e.button===1||this.space||this.tool==='pan'||this.psdCancel){this.gesture={...base,type:'pan',pan:{...this.pan}};return;}
    if(this.tool==='comment'){this.viewport.releasePointerCapture(e.pointerId);this.comments.create(point);return;}
    const resize=['select','scale'].includes(this.tool)?e.target.closest('[data-resize-id]'):null;if(resize){const layer=this.doc.layers.find(l=>l.id===resize.dataset.resizeId),ids=descendants(this.doc,[layer.id]);this.gesture={...base,type:'resize',layer,rect:{x:layer.x,y:layer.y,width:layer.width,height:layer.height,rotation:layer.rotation||0},corner:resize.dataset.resizeCorner,parentRotation:this.parentRotation(layer),snapContext:moveSnapContext(this.doc,[layer.id]),scale:this.tool==='scale',scaled:copy(this.doc.layers.filter(l=>ids.has(l.id)))};return;}
    if(this.tool==='screen-root'||this.tool==='empty'&&!this.selectedCreationParent()){
      const parent=this.selectedCreationParent(),local=this.creationPoint(point,parent);this.revealCreationParent(parent);
      const names=new Set(this.doc.layers.map(layer=>layer.name));let name='Screen',index=1;while(names.has(name))name=index++===1?'Screen copy':'Screen copy '+(index-1);
      this.edit(()=>{const layer={...newLayer('empty',local.x,local.y),parentId:parent?.id||'',name,width:this.doc.width,height:this.doc.height,anchor:'stretch'};this.doc.layers.push(layer);this.selected=new Set([layer.id]);});this.setTool('select');return;
    }
    if(!['select','scale'].includes(this.tool)) {if(this.doc.layers.length>=1000){this.message('Layer limit reached.',true);return;}const parent=this.selectedCreationParent(),local=this.creationPoint(point,parent),layer=newLayer(this.tool,local.x,local.y);layer.parentId=parent?.id||'';this.revealCreationParent(parent);this.doc.layers.push(layer);this.selected=new Set([layer.id]);this.gesture={...base,type:'create',layer,creationParent:parent};this.paint();return;}
    const additive=e.shiftKey||e.ctrlKey||e.metaKey,screen=additive?null:this.selectedScreenAt(point),{hits,layer,pick}=this.pickLayer(point,e);
    // Pressing over a selected layer keeps it available for dragging, even when
    // another layer covers it. A stationary release advances the hit stack.
    const selected=additive?null:screen||hits.find(hit=>this.selected.has(hit.id));
    if(layer||selected){const id=(selected||layer).id,toggleOff=additive&&this.selected.has(id)?id:null;if(!this.selected.has(id))this.select(id,additive);else this.revealLayerRow(id);const byId=layerIndex(this.doc),layers=roots(this.doc,this.selected,byId).filter(l=>!l.locked).map(layer=>({layer,x:layer.x,y:layer.y,parentRotation:this.parentRotation(layer,byId)}));this.gesture={...base,type:'move',layers,toggleOff,clickSelect:!additive?layer?.id:null,pick,snapContext:moveSnapContext(this.doc,layers.map(i=>i.layer.id))};}
    else {this.lastPick=null;const original=new Set(this.selected);if(!additive)this.selected.clear();this.gesture={...base,type:'marquee',end:point,original,previous:new Set(this.selected)};this.paintLayers();this.paintInspector();this.paint();}
  }
  pointerMove(e) {
    const g=this.gesture;if(!g||e.pointerId!==g.pointer)return;const point=this.point(e.clientX,e.clientY,g.view),dx=point.x-g.start.x,dy=point.y-g.start.y;
    if(['move','resize','marquee'].includes(g.type)&&!g.moved){if(Math.hypot(e.clientX-g.client.x,e.clientY-g.client.y)<3)return;g.moved=true;}
    if(['move','resize','create'].includes(g.type)&&(g.lastClientX!==e.clientX||g.lastClientY!==e.clientY)){
      g.lastClientX=e.clientX;g.lastClientY=e.clientY;g.sizeLabelMoving=true;clearTimeout(g.labelTimer);
      g.labelTimer=setTimeout(()=>{if(this.gesture!==g)return;g.sizeLabelMoving=false;for(const outline of this.selectionElements?.values()||[])outline.firstElementChild.hidden=false;},160);
    }
    if(g.type==='pan')this.pan={x:g.pan.x+e.clientX-g.client.x,y:g.pan.y+e.clientY-g.client.y};
    this.guides=[];
    if(g.type==='move'){
      const result=snapMove(g.snapContext,{x:dx,y:dy},{zoom:this.zoom,enabled:this.snap&&!e.altKey,axis:e.shiftKey?(Math.abs(dx)>=Math.abs(dy)?'x':'y'):null});
      for(const item of g.layers){const local=rotatePoint(result.delta,-item.parentRotation);item.layer.x=item.x+local.x;item.layer.y=item.y+local.y;}
      this.guides=result.guides;
    }
    if(g.type==='resize'){const delta=rotatePoint({x:dx,y:dy},-g.parentRotation),result=snapResize(g.snapContext,g.rect,delta,g.corner,{zoom:this.zoom,enabled:this.snap&&!e.altKey,preserveAspect:e.shiftKey||g.scale,parentRotation:g.parentRotation});Object.assign(g.layer,result.rect);this.guides=result.guides;if(g.scale){const factor=scaleLayerTree(this.doc,g.scaled,g.layer.id,g.rect,result.rect,g.corner);if(Math.abs(factor-result.rect.width/g.rect.width)>1e-7)this.guides=[];this.renderVersion=-1;}}
    if(g.type==='create'&&(Math.abs(dx)+Math.abs(dy))*this.zoom>3){const start=this.creationPoint(g.start,g.creationParent),local=this.creationPoint(point,g.creationParent),dx=local.x-start.x,dy=local.y-start.y;let end={...local};const linear=['line','arrow'].includes(g.layer.shape);if(e.shiftKey){if(linear){const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4,length=Math.hypot(dx,dy);end={x:start.x+Math.cos(angle)*length,y:start.y+Math.sin(angle)*length};}else{const size=Math.max(Math.abs(dx),Math.abs(dy));end={x:start.x+(dx<0?-size:size),y:start.y+(dy<0?-size:size)};}}g.layer.x=Math.min(end.x,start.x);g.layer.y=Math.min(end.y,start.y);g.layer.width=Math.min(8192,Math.max(1,Math.abs(end.x-start.x)));g.layer.height=Math.min(8192,Math.max(1,Math.abs(end.y-start.y)));if(linear){g.layer.shapeFlipX=end.x<start.x;g.layer.shapeFlipY=end.y<start.y;}}
    if(g.type==='marquee'){g.end=point;this.selected=new Set([...g.previous,...marqueeLayerIds(this.doc,g.start,point)]);}
    if(this.config.autoAdjustAnchors&&['move','resize','create'].includes(g.type)){
      const byId=this.indexes();for(const layer of g.layers?.map(item=>item.layer)||[g.layer])layer.anchor=screenSized(layer,this.doc)?'stretch':automaticAnchor(layer,byId.get(layer.parentId)||this.doc,this.doc);
      if(this.selected.size===1){const layer=byId.get([...this.selected][0]),picker=this.right.querySelector('.ui-anchor-picker'),summary=picker?.firstElementChild;
        if(summary&&layer&&summary.lastElementChild.textContent!==layer.anchor.replaceAll('-',' ')){summary.firstElementChild.replaceWith(this.anchorIcon(layer.anchor));summary.lastElementChild.textContent=layer.anchor.replaceAll('-',' ');for(const button of picker.querySelectorAll('.ui-anchor-preset'))button.setAttribute('aria-pressed',String(button.getAttribute('aria-label')==='Anchor '+layer.anchor.replaceAll('-',' ')));}
      }
    }
    this.paint();
  }
  queuePointerMove(e){if(!this.gesture){if(e.pointerType==='touch'||e.buttons){this.clearHover();return;}this.hoverPointer={x:e.clientX,y:e.clientY,doc:this.doc,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,metaKey:e.metaKey};if(!this.hoverFrame)this.hoverFrame=requestAnimationFrame(()=>{this.hoverFrame=0;this.paintHover();});return;}if(e.pointerId!==this.gesture.pointer)return;this.pendingPointer={event:e,gesture:this.gesture,doc:this.doc};if(this.pointerFrame)return;this.pointerFrame=requestAnimationFrame(()=>{this.pointerFrame=0;const pending=this.pendingPointer;this.pendingPointer=null;if(pending?.gesture===this.gesture&&pending.doc===this.doc){this.pointerMove(pending.event);if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.paintCanvas();}});}
  clearPointerMove(){if(this.pointerFrame)cancelAnimationFrame(this.pointerFrame);this.pointerFrame=0;this.pendingPointer=null;}
  pointerUp(e){const g=this.gesture;if(!g||e.pointerId!==g.pointer)return;this.clearPointerMove();this.pointerMove(e);clearTimeout(g.labelTimer);this.gesture=null;this.guides=[];this.viewport.releasePointerCapture(e.pointerId);if(g.clickSelect&&!g.moved)this.select(g.clickSelect);if(g.toggleOff&&!g.moved)this.select(g.toggleOff,true);this.lastPick=g.type==='move'&&!g.moved?g.pick:null;if(!['pan','marquee'].includes(g.type)){if(g.type==='create'){this.tool='select';this.creationTargetId=null;this.moveMode='select';}this.remember(g.before);}else{this.paintLayers();this.paintInspector();}this.paint();}
  cancelGesture(){this.clearPointerMove();const g=this.gesture;if(!g)return;clearTimeout(g.labelTimer);if(g.type==='marquee')this.selected=new Set(g.original);else if(g.type!=='pan')this.doc=JSON.parse(g.before);this.gesture=null;this.guides=[];if(this.viewport.hasPointerCapture(g.pointer))this.viewport.releasePointerCapture(g.pointer);this.paintAll();}
  parentRotation(layer,byId=layerIndex(this.doc)){let degrees=0,parent=layer.parentId;while(parent){const item=byId.get(parent);if(!item)break;degrees+=item.rotation||0;parent=item.parentId;}return degrees;}
  nudgeLayers(e){
    const ids=[...this.selected].sort().join('\n'),now=performance.now(),hold=this.nudgeHold;
    const continuing=e.repeat&&hold?.key===e.key&&hold.ids===ids&&hold.document===this.doc&&hold.version===this.version&&this.undo.at(-1)===hold.before;
    const session=continuing?hold:{key:e.key,ids,document:this.doc,started:now,before:this.snapshot()};
    // Keep the first 350 ms precise, then ramp to a bounded 20 px per repeat.
    const speed=Math.min(20,1+Math.max(0,Math.floor((now-session.started-350)/180)));
    const delta=(e.shiftKey?10:1)*speed;
    this.edit(()=>{for(const layer of roots(this.doc,this.selected).filter(l=>!l.locked)){
      if(e.key==='ArrowLeft')layer.x-=delta;if(e.key==='ArrowRight')layer.x+=delta;
      if(e.key==='ArrowUp')layer.y-=delta;if(e.key==='ArrowDown')layer.y+=delta;
    }},continuing);
    session.version=this.version;this.nudgeHold=session;
  }
  async key(e) {
    if(document.body.dataset.workspace!=='ui')return;
    if(e.target.closest('#document-tabs')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    if(e.target.closest('#ui-psd-progress-dialog')){if(e.key==='Escape'){e.preventDefault();this.psdCancel?.();}return;}
    if(e.target.closest('dialog'))return;
    if(e.target.closest('.ui-component-picker'))return;
    if(this.layerActions.key(e))return;
    const menu=e.target.closest('.ui-tool-menu');if(menu&&['ArrowUp','ArrowDown','Home','End','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Escape'){this.closeToolMenu();this.viewport.focus();return;}const items=[...menu.querySelectorAll('button')],index=items.indexOf(document.activeElement);items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();return;}
    // Let the browser dispatch dialog cancel so pending prompts and PSD workers settle.
    if(e.key==='Escape'&&this.psdCancel&&!this.dialog.open){e.preventDefault();this.psdCancel();return;}
    if(e.key==='Escape'){this.closeToolMenu();if(!this.contextMenu.hidden){this.closeGroupMenu();this.viewport.focus();return;}if(!this.dialog.open){this.cancelGesture();this.closeDrawers();}return;}
    if(document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable]'))return;
    if(this.layerList.contains(e.target)&&!(this.selected.size>1&&e.key.startsWith('Arrow'))){
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const row=e.target.closest('[data-layer-row-id]'),id=row?.dataset.layerRowId,expanded=row?.getAttribute('aria-expanded');if(id){e.preventDefault();e.stopImmediatePropagation();if(e.key==='ArrowLeft'){if(expanded==='true')this.toggleLayerFold(id);else{const parent=this.indexes().get(id)?.parentId;if(parent){this.select(parent);this.focusLayerRow(parent);}}}else if(expanded==='false')this.toggleLayerFold(id);else if(expanded==='true')this.navigateLayers(1);}return;}
      const bindings=this.config.shortcuts||[],previous=bindings.find(s=>s.action==='previous_layer'),next=bindings.find(s=>s.action==='next_layer');
      const direction=shortcutMatches(e,previous?previous.keys:'ArrowUp')?-1:shortcutMatches(e,next?next.keys:'ArrowDown')?1:0;
      if(direction){e.preventDefault();e.stopImmediatePropagation();this.navigateLayers(direction);return;}
    }
    if(this.busy){if(e.code==='Space'){this.space=true;e.preventDefault();}if(e.shiftKey&&e.code==='Digit1'){this.fit();e.preventDefault();}return;}
    const shortcuts=this.config.shortcuts||[],shortcut=shortcuts.find(s=>shortcutMatches(e,s.keys));
    if(shortcut?.action==='toggle_visibility'||!shortcut&&!shortcuts.some(s=>s.action==='toggle_visibility')&&shortcutMatches(e,'`')){
      e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)this.toggleSelectionVisibility();return;
    }
    if(e.target.closest('summary')&&!e.ctrlKey&&!e.metaKey)return;
    if(e.target.closest('button')&&[' ','Enter'].includes(e.key)&&!e.ctrlKey&&!e.metaKey)return;
    if(e.code==='Space'){this.space=true;this.clearHover();e.preventDefault();return;}
    const mod=e.ctrlKey||e.metaKey;
    if(['Delete','Backspace'].includes(e.key)){e.preventDefault();this.remove();return;}
    if(e.key.startsWith('Arrow')){e.preventDefault();this.nudgeLayers(e);return;}
    if(!shortcut){const fallback=shapeTools.find(([, ,key])=>key&&shortcutMatches(e,key))?.[0]||(!mod&&!e.altKey&&e.key.toLowerCase()==='k'?'scale':!mod&&!e.altKey&&e.key.toLowerCase()==='c'?'comment':null);if(fallback){e.preventDefault();this.setTool(fallback);}else if(mod&&e.shiftKey&&e.key.toLowerCase()==='k'){e.preventDefault();this.file.click();}return;}e.preventDefault();e.stopImmediatePropagation();
    const action=shortcut.action;
    if(action.startsWith('label_'))this.label(action.slice(6));else if(['select','pan','scale','frame','group_tool','rectangle','line','arrow','ellipse','polygon','star','image','text','button'].includes(action)){this.setTool(['frame','group_tool'].includes(action)?'group':action);}
    else if(action==='save')await this.save();else if(action==='undo')this.history(-1);else if(action==='redo')this.history(1);else if(action==='fit')this.fit();else if(action==='duplicate')this.edit(()=>this.selected=new Set(duplicate(this.doc,this.selected)));else if(action==='group')this.groupSelection();
  }
  async choose(title,description,choices) {
    const {actions}=dialogShell(this.dialog,{title,description,kind:'confirmation'});
    return new Promise(resolve=>{const finish=value=>{this.dialog.close();resolve(value);};for(const [index,[label,value]]of choices.filter(([,value])=>value!=='cancel').entries()){const button=this.button(label,()=>finish(value),index===0);if(value==='discard')button.classList.add('danger');actions.append(button);}this.dialog.oncancel=()=>resolve(null);this.dialog.showModal();actions.firstElementChild?.focus({preventScroll:true});});
  }
  // Pending Update size requests belong to the open document's undo history; opening or replacing a document starts a new history array.
  imageResizeQueue(){if(this.imageResizeHistory!==this.undo){this.imageResizeHistory=this.undo;this.imageResizeIds=new Set();}return this.imageResizeIds;}
  imageResizeControl(layer,section){
    const queue=this.imageResizeQueue(),pending=queue.has(layer.id),sliced=imageMode(layer)==='nine_slice';
    const button=this.button(pending?'Cancel size update':'Update size',()=>{if(queue.has(layer.id))queue.delete(layer.id);else queue.add(layer.id);this.paintInspector();this.message(queue.has(layer.id)?'Save resamples '+(layer.image.path||'the source image')+' to this layer size and updates its copy in the document package.':'Size update cancelled.');});
    button.disabled=sliced||this.busy;button.title=sliced?'9-slice images keep their source size. Switch Image mode to resize the source.':'On save, resample the source image to the size and shape shown on the canvas and update the document package. Original loose files stay unchanged.';
    section.append(button);
    if(!pending)return;
    const shared=this.doc.layers.filter(other=>other!==layer&&other.image?.guid===layer.image.guid).length;
    section.append(el('p',{class:'ui-hint'},`Pending · Save overwrites the source at ${Math.round(layer.width)}×${Math.round(layer.height)} px${imageMode(layer)==='preserve_aspect'?' (fit, aspect kept)':''}.${shared?` ${shared} other layer${shared>1?'s use':' uses'} this image.`:''} File changes are not undoable.`));
  }
  // Returns the number of overwritten source files, or false when a pending request failed (requests are kept).
  async commitImageResizes(){
    const queue=this.imageResizeQueue(),doc=this.doc;
    for(const id of [...queue])if(!doc.layers.some(layer=>layer.id===id&&layer.image&&layer.role!=='text'&&imageMode(layer)!=='nine_slice'))queue.delete(id);
    if(!queue.size)return 0;
    this.busy=true;this.paintShell();let updated=0;
    try{
      const targets=new Map();
      for(const id of queue){
        const layer=doc.layers.find(item=>item.id===id),key=layer.image.guid+':'+(layer.image.localId||''),previous=targets.get(key);
        this.message('Loading '+(layer.image.name||layer.name)+'…');
        const source=previous?.source||await loadSourceImage(layer.image),size=imageResizeTarget(layer,source.naturalWidth,source.naturalHeight);
        if(previous&&(previous.width!==size.width||previous.height!==size.height))throw Error(`${previous.layer.name} and ${layer.name} share ${layer.image.name||'one image'} but need different sizes. Cancel Update size on one of them.`);
        targets.set(key,{layer,source,...size});
      }
      for(const {layer,source,width,height} of targets.values()){
        const image=layer.image,name=image.name||layer.name;
        if(width!==source.naturalWidth||height!==source.naturalHeight){
          this.message(`Resampling ${name} ${source.naturalWidth}×${source.naturalHeight} → ${width}×${height} px…`);
          const blob=await resampleImage(source,width,height);
          if(blob.size>maxResizedImageBytes)throw Error(`${name} at ${width}×${height} px exceeds the 5 MB image limit. Use a smaller layer size.`);
          const result=await this.api('ui-image-resize',{image:{guid:image.guid,localId:image.localId||''},width,height,dataBase64:await blobBase64(blob)});
          resizedSources.set(image.guid,result.revision);updated++;
        }
        for(const id of [...queue])if(doc.layers.find(item=>item.id===id)?.image?.guid===image.guid)queue.delete(id);
      }
      return updated;
    }
    catch(error){this.message(error,true,(updated?` ${updated} source image${updated>1?'s were':' was'} already updated.`:'')+' Pending size updates are kept.');return false;}
    finally{this.busy=false;if(updated){this.preview=null;this.renderVersion=-1;this.paintAll();}else this.paintShell();}
  }
  async save() {
    if(this.busy)return false;
    const resized=await this.commitImageResizes();if(resized===false)return false;
    const resizedNote=resized?`Updated ${resized} source image${resized>1?'s':''}. `:'';
    let path=this.path;
    // Inserting private PSD artwork into a bundled sample must save a private copy.

    if(!path){path=await this.input('Save UI document','Workspace-relative path',`${this.config.documentFolder}/${this.doc.name.replace(/[^\p{L}\p{N}_ -]/gu,'_')}.svgpro`);if(!path)return false;}
    const version=this.version,document=copy(this.doc),revision=path===this.path?this.revision:'';this.busy=true;this.message('Saving UI document…');
    try{const result=await saveUIDocumentDraft((...args)=>this.api(...args),(...args)=>this.input(...args),{path,revision,document,...(this.guid&&path===this.path?{guid:this.guid}:{})},doc=>this.recoverSaveStyles(doc));if(!result){this.persist();this.message('Save cancelled. Your draft is retained.');return false;}this.catalogVersion=(this.catalogVersion||0)+1;this.missingDocuments?.delete(result.path);this.path=result.path;this.revision=result.revision;this.guid=result.guid||'';this.preview=null;this.dirty=version!==this.version;if(result.document&&!this.dirty){const sourcesChanged=document.layers.some(l=>l.image&&result.document.layers.some(n=>n.image?.guid===l.image.guid&&n.image.slice?.version!==l.image.slice?.version));this.doc=validateDocument(result.document);if(sourcesChanged){this.undo=[];this.redo=[];}this.version++;this.renderVersion=-1;this.paintAll();}const entry={path:result.path,name:result.path.split('/').pop().replace(/\.(asset|svgpro)$/i,'')};this.config.documents=[...(this.config.documents||[]).filter(d=>d.path!==result.path),entry];this.refreshFiles();this.persist();this.message(resizedNote+(result.packageWarning||'Saved '+this.path+' and its UI document.'),!!result.packageWarning);return true;}
    catch(error){this.message(error,true,' Your draft is retained. Reconnect the workspace and retry saving.');this.persist();return false;}finally{this.busy=false;this.paintShell();}
  }
  async recoverSaveStyles(document){
    const presets=this.config.textStyles||[],config=await this.api('ui-config');
    this.config.textStyles=config.textStyles||[];
    const layers=document.layers.filter(layer=>layer.textStyle?.preset&&!this.config.textStyles.some(preset=>preset.key===layer.textStyle.preset));
    if(!layers.length)throw Error('Text style preset is missing or is not a VinaGenTextStyle.');
    const choice=await this.choose('Text style preset unavailable',`A referenced style asset is missing. Save custom styles for ${layers.map(layer=>layer.name).join(', ')} using the available preview values? Unavailable preset values use the default text style. Cancel keeps your draft.`,[['Use custom styles and save','recover'],['Cancel','cancel']]);
    if(choice!=='recover')return null;
    const recovered=copy(document);
    const ids=new Set(layers.map(layer=>layer.id));
    for(const layer of recovered.layers.filter(layer=>ids.has(layer.id))){
      layer.textStyle=resolvedTextStyle(layer,presets);
      delete layer.textStyle.preset;delete layer.textStyle.scale;
    }
    return recovered;
  }
  async input(title,label,value){const {body,actions}=dialogShell(this.dialog,{title,kind:'input'}),input=el('input',{value,'aria-label':label}),field=el('label',{},label);field.append(input);body.append(field);return new Promise(resolve=>{const finish=value=>{this.dialog.close();resolve(value);};actions.append(this.button('Continue',()=>finish(input.value),true));input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();finish(input.value);}};this.dialog.oncancel=()=>resolve(null);this.dialog.showModal();input.focus();input.select();});}
  openExport(){
    if(this.busy||this.pngExporting||this.psdExporting||this.imageFusing||this.dialog.open)return;
    document.activeElement?.blur();
    const doc=this.doc,selectedIds=[...this.selected].filter(id=>doc.layers.some(layer=>layer.id===id));
    const {body,actions}=dialogShell(this.dialog,{title:'Export',kind:'export',description:'Choose the content and file format to download.'});
    const scope=el('select',{'aria-label':'Export scope'}),field=el('label',{class:'ui-export-scope'},'Content');
    const copyError=this.button('Copy error',()=>this.copyError());copyError.hidden=true;
    scope.append(el('option',{value:'selected',disabled:!selectedIds.length},selectedIds.length>1?'Selected objects':'Selected object'),el('option',{value:'all'},'All objects'));scope.value=selectedIds.length?'selected':'all';field.append(scope);body.append(field);
    const selection=el('p',{class:'ui-hint'}),update=()=>{selection.textContent=scope.value==='selected'?(selectedIds.length===1?doc.layers.find(layer=>layer.id===selectedIds[0]).name:selectedIds.length+' objects')+' · Includes all child layers':'All objects in this document';};scope.onchange=update;update();body.append(selection);
    const options=el('div',{class:'transfer-options ui-export-options'}),progress=el('p',{class:'ui-export-progress','aria-live':'polite'});body.append(options,progress);
    for(const [format,description]of [['psd','One Photoshop file with editable layers.'],['svgpro','Whole UI document with its images and text styles. Open it in Web Designer, with its bundled resources.'],['svg','Composed browser layout with embedded images and fonts.'],['png','All visible layers combined into one transparent image.']]){
      const button=this.button('Export '+format.toUpperCase(),async()=>{
        if(this.doc!==doc)throw Error('The document changed. Open Export again.');
        const ids=scope.value==='selected'?selectedIds:null;copyError.hidden=true;scope.disabled=true;for(const node of options.children)node.disabled=true;progress.textContent='Preparing '+format.toUpperCase()+'…';
        try{const success=format==='psd'?await this.exportPSD({selectedIds:ids}):format==='svgpro'?await this.exportSvgPro():await this.exportPNG(ids?.length===1?ids[0]:null,{format,selectedIds:ids});if(success)this.dialog.close();else progress.textContent=this.status.textContent;}
        finally{copyError.hidden=!this.errorMessage;scope.disabled=false;for(const node of options.children)node.disabled=false;}
      });
      const copy=el('span',{class:'transfer-copy'});copy.append(el('strong',{},format.toUpperCase()),el('span',{},description));
      button.className='transfer-option';button.replaceChildren(this.icon('download'),copy,el('span',{class:'transfer-extension'},'.'+format));button.setAttribute('aria-label','Export '+format.toUpperCase());options.append(button);
    }
    actions.append(copyError,this.button('Cancel',()=>this.dialog.close()));this.dialog.showModal();scope.focus();
  }
  async exportPNG(layerId,{format='png',selectedIds=null}={}){
    if(this.busy||this.pngExporting||this.psdExporting||this.imageFusing)return false;this.pngExporting=true;
    this.paintInspector();this.message('Preparing '+format.toUpperCase()+'…');
    try{
      const {captureLayerPNG}=await import('./ui-screen-capture.mjs'),result=await captureLayerPNG(this,layerId,{includeChildren:true,format,selectedIds});
      const name=(result.name||'Object').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_');
      this.download(result.blob,name+'.'+format,format==='svg'?'image/svg+xml':'image/png');
      this.message(`Exported ${format.toUpperCase()} (${result.width} × ${result.height}).`);return true;
    }catch(error){this.message(error,true);return false;}finally{this.pngExporting=false;this.paintInspector();}
  }
  async fusionImages(layerId){
    if(this.busy||this.imageFusing||this.pngExporting||this.psdExporting)return;
    document.activeElement?.blur();
    const doc=this.doc,version=this.version,before=this.snapshot();
    const current=()=>{if(this.doc!==doc||this.version!==version||this.snapshot()!==before||this.busy)throw Error('UI changed during Fusion images. Your layers are retained; try again.');};
    this.imageFusing=true;this.paintInspector();this.message('Checking Fusion cache…');
    const progressDialog=el('dialog',{id:'ui-fusion-progress-dialog',class:'ui-dialog ui-psd-progress'});this.root.append(progressDialog);
    const {body}=dialogShell(progressDialog,{title:'Fusion images',kind:'progress'}),status=el('div',{class:'vg-import-status',role:'status'}),progress=el('progress',{class:'ui-psd-progress-bar','aria-label':'Fusion images progress'});
    status.append(el('span',{class:'vg-import-indicator','aria-hidden':'true'}),el('span',{},'Checking Fusion cache…'));body.append(status,progress);
    // The asset write cannot be cancelled halfway through. Keep progress visible
    // until the write and cache commit have both succeeded or failed.
    progressDialog.querySelector('.vg-dialog-close').hidden=true;progressDialog.oncancel=event=>event.preventDefault();progressDialog.show();
    const report=(stage,done,total)=>{status.lastElementChild.textContent=stage;if(total){progress.max=total;progress.value=done;}else progress.removeAttribute('value');};
    try{
      await new Promise(resolve=>requestAnimationFrame(resolve));
      const state=await imageFusionState(doc,layerId),documentKey=doc.fusionCacheId||await fusionHash({name:doc.name,roots:doc.layers.filter(layer=>!layer.parentId).map(layer=>layer.id).sort()});
      const fusionKey=await fusionHash([documentKey,layerId]),request={fusionKey,fusionSignature:state.signature,fusionName:state.root.name,sources:state.sources,fusionImage:state.root.image,path:this.path||undefined,
        allowExisting:!state.hasChildren&&imageMode(state.root)==='none'&&/^#ffffff(ff)?$/i.test(state.root.fill||'')&&!state.root.fillGradient&&!state.root.strokeWidth,
        fusionSize:{width:state.root.width,height:state.root.height}};
      const cached=await this.api('ui-fusion-cache',request);current();
      if(cached.hit&&cached.resultSignature===state.signature){
        const draft=copy(doc);draft.fusionCacheId=documentKey;draft.layers.find(layer=>layer.id===layerId).image=copy(cached.image);
        if(JSON.stringify(draft)!==JSON.stringify(doc)){this.doc=draft;this.remember(before,false,true);}
        this.message('Loaded cached Fusion image. No image changes.');return;
      }
      if(!state.hasChildren&&!cached.image?.guid)throw Error('Add visible child images before Fusion images.');
      this.message(cached.hit?'Loading cached Fusion image…':'Combining images. Text stays editable…');

      const {captureLayerPNG}=await import('./ui-screen-capture.mjs');
      report(cached.hit?'Loading cached Fusion image…':'Combining child images…');
      const result=cached.hit?cached.bounds:await captureLayerPNG(this,layerId,{imagesOnly:true,bakeRootAppearance:false,onProgress:report});current();
      if(result.blob?.size>5*1024*1024)throw Error('Fusion PNG exceeds the 5 MB image import limit. Reduce the image sizes.');
      const draft=copy(doc);applyImageFusion(draft,layerId,{image:{guid:'fusion-pending'}},result,{allowSingle:!state.hasChildren});draft.fusionCacheId=documentKey;
      const name=(state.root.name||'Object').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_');
      report(cached.hit?'Applying cached image…':'Preparing Fusion image…');
      const asset=cached.hit?cached:await this.upload(new File([result.blob],name+'.png',{type:'image/png'}),{...request,fusionBounds:{x:result.x,y:result.y,width:result.width,height:result.height}});current();
      if(!asset?.image?.guid)throw Error('Fusion image could not be imported. Your layers are retained.');
      draft.layers.find(layer=>layer.id===layerId).image=asset.image;validateDocument(draft);
      const output=await imageFusionState(draft,layerId);current();
      report('Updating Fusion cache…');
      await this.api('ui-fusion-cache',{...request,resultSignature:output.signature,imageGuid:asset.image.guid});current();
      this.doc=draft;this.selected=new Set([layerId]);this.remember(before,false,true);
      this.message((cached.hit?'Loaded cached Fusion image for ':'Fused images into ')+state.root.name+'. Text stays editable. Undo restores the original layers.');
    }catch(error){this.message(error,true);}finally{progressDialog.close();progressDialog.remove();this.imageFusing=false;this.paintInspector();}
  }
  // The package is written by Unity beside the saved document; download that file.
  async exportSvgPro(){
    if(this.busy||this.psdExporting||this.pngExporting||this.imageFusing)return false;
    this.busy=true;this.message('Preparing portable SVGPRO…');
    try{const version=this.version,blob=await workspace.package(copy(this.doc));
      if(version!==this.version)throw Error('The document changed during export. Export again.');
      this.download(blob,this.doc.name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')+'.svgpro','application/vnd.vinagen.svgpro');
      this.message('Downloaded a portable copy. Save separately to update your workspace file.');return true;
    }catch(error){this.message(error,true);return false;}finally{this.busy=false;this.paintShell();}
  }
  async exportPSD({selectedIds=null}={}){
    if(this.busy||this.psdExporting||this.pngExporting||this.imageFusing)return false;this.psdExporting=true;this.paintInspector();this.message('Preparing layered PSD…');
    try{
      const {exportPSD}=await import('./ui-psd-export.mjs');
      const result=await exportPSD(this,{selectedIds,onProgress:(done,total,stage)=>this.message(stage==='composite'?'Preparing PSD composite…':`Exporting PSD: ${done} / ${total} layers…`)});
      const name=(selectedIds?.length===1?this.doc.layers.find(layer=>layer.id===selectedIds[0])?.name:this.doc.name)||'UI';
      this.download(result.blob,name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')+'.psd','image/vnd.adobe.photoshop');
      this.message(`Exported layered PSD (${result.width} × ${result.height}).`);return true;
    }catch(error){this.message(error,true);return false;}finally{this.psdExporting=false;this.paintInspector();}
  }
  download(data,name,type){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type})),a=el('a',{href:url,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  async renderSliceImages(document) {
    const rendered={};let encodedSize=JSON.stringify(document).length;
    for(const layer of sliceExportLayers(document)){
      const width=Math.round(layer.width),height=Math.round(layer.height);
      if(width*height>16777216)throw Error('9-slice export supports up to 16 megapixels per image. Reduce '+layer.name+'.');
      const source=new Image();source.src=imageMode(layer)==='nine_slice'?sliceMedia(layer.image):media(layer.image);await source.decode();
      const canvas=el('canvas');canvas.width=width;canvas.height=height;
      const context=canvas.getContext('2d');if(!context)throw Error('Image rendering is unavailable.');
      context.scale(width/layer.width,height/layer.height);
      if(imageMode(layer)==='nine_slice')for(const rect of sliceImageRects(source.naturalWidth,source.naturalHeight,layer.width,layer.height,layer.image.slice||this.sliceBorders(source)))context.drawImage(source,...rect);
      else if(imageMode(layer)==='preserve_aspect'){
        const scale=Math.min(layer.width/source.naturalWidth,layer.height/source.naturalHeight),w=source.naturalWidth*scale,h=source.naturalHeight*scale;
        context.drawImage(source,(layer.width-w)/2,(layer.height-h)/2,w,h);
      }else context.drawImage(source,0,0,layer.width,layer.height);
      const dataBase64=canvas.toDataURL('image/png').split(',')[1];canvas.width=canvas.height=1;
      encodedSize+=dataBase64.length;
      if(dataBase64.length>7*1024*1024||encodedSize>7*1024*1024)throw Error('Rendered images exceed the Canvas export size limit. Reduce image sizes.');
      rendered[layer.id]={dataBase64};
    }
    return rendered;
  }
  settings(){window.dispatchEvent(new Event('vinagen-open-settings'));}
  async assets(targetId) {
    const browser=this.assetBrowser({targetId});
    const {body,actions}=dialogShell(this.dialog,{title:'Project Assets',description:'Browse artwork in your selected workspace.',wide:true,kind:'assets'});body.append(browser.root);actions.append(this.button('Close',()=>this.dialog.close()));
    this.dialog.addEventListener('close',()=>browser.dispose(),{once:true});this.dialog.showModal();await browser.load();
  }
  attach(asset,targetId,point,parentId) {
    let layer=this.doc.layers.find(l=>l.id===targetId);
    if(!layer){if(this.doc.layers.length>=1000)throw Error('Layer limit reached.');const selectedParent=parentId===undefined?this.creationParent():this.indexes().get(parentId);let center=point?this.creationPoint(point,selectedParent):undefined;
      if(!center&&!selectedParent){const rect=this.viewport.getBoundingClientRect(),visible=this.point(rect.left+rect.width/2,rect.top+(rect.height-48)/2);center={x:Math.min(this.doc.width-asset.width/2,Math.max(asset.width/2,visible.x)),y:Math.min(this.doc.height-asset.height/2,Math.max(asset.height/2,visible.y))};if(asset.width>this.doc.width)center.x=this.doc.width/2;if(asset.height>this.doc.height)center.y=this.doc.height/2;}
      layer={...newLayer('image'),...imagePlacement(this.doc,asset.width,asset.height,center,selectedParent?.id)};layer.name=asset.image.name||'Image';this.doc.layers.push(layer);}
    delete layer.shape;layer.image=asset.image;layer.fill='#ffffff';this.selected=new Set([layer.id]);
  }
  async addAssetPath(path,point){const asset=await this.api('ui-resolve-image',{path});this.edit(()=>this.attach(asset,null,point));}
  async drop(e){e.preventDefault();this.viewport.classList.remove('ui-drop-active');if(this.busy)return;const point=this.point(e.clientX,e.clientY),asset=e.dataTransfer.getData('application/x-vinagen-image'),text=e.dataTransfer.getData('text/plain');try{if(asset){this.edit(()=>this.attach(JSON.parse(asset),null,point));return;}await this.importFiles([...e.dataTransfer.files],point);}catch(error){this.message(error,true);}}
  async upload(file,options={}){
    // Native FileReader avoids building several large JS strings byte by byte.
    const dataURL=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||Error('Could not read image.'));reader.readAsDataURL(file);});
    return this.api('ui-image',{fileName:file.name,dataBase64:dataURL.slice(dataURL.indexOf(',')+1),path:this.path||undefined,...options});
  }
  // Unity stores the package in the project, unpacks its document and assets, then the designer opens it.
  async importSvgPro(file) {
    if(file.size>96*1024*1024)throw Error('SVGPRO packages must be smaller than 96 MB.');
    this.busy=true;this.message('Importing '+file.name+' into the workspace…');let data;
    try{
      const dataURL=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||Error('Could not read SVGPRO.'));reader.readAsDataURL(file);});
      data=await this.api('ui-svgpro-import',{fileName:file.name,dataBase64:dataURL.slice(dataURL.indexOf(',')+1)});
    }finally{this.busy=false;}
    this.config.documents=[...(this.config.documents||[]).filter(d=>d.path!==data.path),{path:data.path,name:data.path.split('/').pop().replace(/\.svgpro$/i,'')}];
    if(await this.load(data.path,{reload:true})){this.path='';this.revision='';this.dirty=true;this.persist();this.paintAll();this.message('Imported document and resources. Save to keep a portable copy.');}else this.refreshFiles();
  }
  async importFiles(files,point) {
    if(this.busy)return;
    let parentId=this.creationParent()?.id||'';
    for(const file of files) {
      try {
        if(/\.(ttf|otf|woff2?)$/i.test(file.name)){await workspace.importFont(file);this.config=await this.api('ui-config');this.paintAll();this.message('Imported font '+file.name);continue;}
        if(/\.(svgpro|json)$/i.test(file.name)){await this.importSvgPro(file);parentId='';continue;}
        if(/\.psd$/i.test(file.name)){if(!await this.importPSD(file))return;parentId='';continue;}
        if(!/\.(png|jpe?g)$/i.test(file.name))throw Error('Choose PSD, SVGPRO, PNG or JPEG.');
        if(file.size>5*1024*1024)throw Error('Images must be smaller than 5 MB.');
        this.message('Importing '+file.name+'…');this.busy=true;const asset=await this.upload(file);this.busy=false;this.edit(()=>this.attach(asset,null,point,parentId));if(this.autoFit)this.fit();this.message('Saved image to '+asset.image.path);
      } catch(error){this.message(error,true,' File: '+file.name);}finally{this.busy=false;}
    }
  }
  async importPSD(file) {
    const {validatePSDSourceSize}=await import('./psd-reader.mjs');
    const {resolvePSDFont}=await import('./psd-text.mjs');
    validatePSDSourceSize(file.size);
    this.closeTextBubble();document.activeElement?.blur();this.cancelGesture();this.persist();
    const origin={document:this.doc,path:this.path,version:this.version};
    const mode=await this.choose('Import Photoshop document','Replace the current screen, or insert the PSD beside existing layers while keeping their layout.',[['Replace','replace'],['Insert','insert']]);
    if(!mode||origin.document!==this.doc||origin.path!==this.path||origin.version!==this.version)return false;
    if(mode==='replace'&&this.dirty){const replace=await this.choose('Replace current screen?','Save the current draft or discard it when the new PSD finishes importing.',[['Save and import','save'],['Import and discard','discard'],['Cancel','cancel']]);if(!replace||replace==='cancel')return false;if(replace==='save'&&(!await this.save()||this.dirty))return false;}
    this.busy=true;this.message('Reading PSD in a background worker…');
    const worker=new Worker(new URL('./psd-worker.mjs',import.meta.url),{type:'module'}),workers=new Set([worker]);const stopWorkers=()=>{for(const w of workers)w.terminate();workers.clear();};let cancelled=false,cancellationRequested=false,layerPaintTimer;
    const progressDialog=el('dialog',{id:'ui-psd-progress-dialog',class:'ui-dialog ui-psd-progress'});this.root.append(progressDialog);
    const {body}=dialogShell(progressDialog,{title:'Import Photoshop document',kind:'progress'}),status=el('div',{class:'vg-import-status',role:'status'}),progress=el('progress',{class:'ui-psd-progress-bar','aria-label':'PSD import progress'});status.append(el('span',{class:'vg-import-indicator','aria-hidden':'true'}),el('span',{},'Preparing PSD branches…'));body.append(status,progress);this.closeTextBubble();this.closeGroupMenu();progressDialog.show();this.right.inert=true;this.docName.readOnly=true;this.toolbar.inert=true;this.viewport.focus();
    const before=this.doc,previous={path:this.path,revision:this.revision,guid:this.guid,dirty:this.dirty,undo:this.undo,redo:this.redo,selected:this.selected,pan:{...this.pan},zoom:this.zoom,autoFit:this.autoFit,preview:this.preview};const fontWarnings=new Set();
    const draft=newDocument(this.config);draft.psdFallbackFont=this.psdFallbackKey();draft.name=file.name.replace(/\.psd$/i,'');clearTimeout(this.draftTimer);
    try {
      const destination=await this.api('ui-psd-begin',{psdName:draft.name});draft.psdImportFolder=destination.psdImportFolder;
      if(!draft.psdImportFolder)throw Error('A PSD import destination could not be prepared.');
      await new Promise((resolve,reject)=>{
        let timeout,totalLayers=0,importedLayers=0,active=0,nextJob=0,finished=0,finishing=false,fontsReady=Promise.resolve();
        const jobs=[],notes=new Set(),paints=new Map();
        // Reserve the final 5% for rendering. Worker 'done' alone does not mean
        // its outstanding uploads, font requests or browser images have finished.
        const updateProgress=()=>{progress.max=100;progress.value=totalLayers?95*importedLayers/totalLayers:0;};
        const fail=error=>{if(cancelled)return;cancelled=true;stopWorkers();clearTimeout(timeout);reject(error);};
        const heartbeat=()=>{clearTimeout(timeout);timeout=setTimeout(()=>fail(Error('PSD import timed out.')),120000);};heartbeat();
        const commitTree=()=>{draft.layers=jobs.flatMap(job=>job.layers);this.version++;};
        const repaint=()=>{if(layerPaintTimer)return;layerPaintTimer=setTimeout(()=>{layerPaintTimer=null;if(!cancelled&&this.doc===draft){commitTree();this.paint();this.paintLayers();}},80);};
        const finish=()=>{if(finished!==jobs.length||cancelled||finishing)return;finishing=true;
          (async()=>{
            await fontsReady;if(cancelled)return;
            clearTimeout(layerPaintTimer);layerPaintTimer=null;commitTree();validateDocument(draft);
            status.lastElementChild.textContent='Saving PSD fonts and text styles…';
            const resources=await this.api('ui-psd-complete',{document:copy(draft)});if(cancelled)return;
            Object.assign(draft,resources.document);this.config=resources.config;
            recalculateAnchors(draft,!!this.config.autoAdjustAnchors);
            for(const layer of draft.layers)if(layer.sourceTextPaint)layer.sourceTextPaint.signature=textPaintSignature(layer);
            status.lastElementChild.textContent=`${importedLayers} / ${totalLayers} layers imported · Rendering preview…`;
            this.paintLayers();this.paintCanvas();
            const textLoads=[...(this.currentFontLoads||[]),...(this.styledPreview?.pending(this.board)||[])];
            let renderedTexts=0;
            await Promise.all(textLoads.map(async load=>{await load;if(cancelled)return;heartbeat();status.lastElementChild.textContent=`${importedLayers} / ${totalLayers} layers imported · Rendering preview… Text: ${++renderedTexts} / ${textLoads.length}`;progress.value=95+2*renderedTexts/textLoads.length;}));
            if(cancelled)return;
            if(this.board.querySelector('[data-styled-text-status="error"]'))throw Error('A PSD text preview could not render. Try importing again.');
            const images=[...this.board.querySelectorAll('img')].filter(image=>image.getAttribute('src'));
            let decodedImages=0;
            const previewStart=textLoads.length?97:95;
            const results=await Promise.allSettled(images.map(async image=>{try{await image.decode();}finally{if(!cancelled){heartbeat();progress.value=previewStart+(99-previewStart)*++decodedImages/images.length;status.lastElementChild.textContent=`${importedLayers} / ${totalLayers} layers imported · Rendering preview… Images: ${decodedImages} / ${images.length}`;}}}));
            if(cancelled)return;
            const failed=results.filter(result=>result.status==='rejected').length;
            if(failed)throw Error(`${failed} PSD preview image${failed===1?'':'s'} could not load. Try importing again.`);
            await new Promise(requestAnimationFrame);if(cancelled)return;
            clearTimeout(timeout);draft.importNotes=[...new Set([...notes,...fontWarnings])];progress.value=progress.max;resolve();
          })().catch(fail);
        };
        let sourceDocument,sourceFileKey;
        const launch=()=>{
          while(!cancelled&&active<3&&nextJob<jobs.length){
            const job=jobs[nextJob++],w=new Worker(new URL('./psd-worker.mjs',import.meta.url),{type:'module'});workers.add(w);job.worker=w;active++;
            w.onerror=e=>fail(Error(e.message));
            const settle=()=>{if(cancelled||!job.done||job.pending||job.finished)return;job.finished=true;finished++;active--;w.terminate();workers.delete(w);launch();finish();};
            const importLayer=async data=>{
              const sequence=job.received++;job.pending++;
              const layer={...newLayer(data.layer.role,data.layer.x,data.layer.y),...(data.layer.role==='text'?{textStyle:undefined,standaloneText:undefined}:{}),...data.layer,psdImportFolder:draft.psdImportFolder};
              let upload;if(data.png){upload=paints.get(data.paintKey);if(!upload){upload=this.upload(new File([data.png],layer.name+'.png',{type:'image/png'}),{psdName:draft.name,layerName:layer.name,psdImportFolder:draft.psdImportFolder,path:undefined});if(data.paintKey)paints.set(data.paintKey,upload);}}
              await Promise.all([upload,layer.role==='text'?fontsReady:undefined]);if(cancelled)return;resolvePSDFont(layer,this.config,fontWarnings,draft.psdFallbackFont);
              if(upload){const asset=await upload;layer.image=structuredClone(asset.image);
                this.psdPaints??={document:draft,images:new Map(),bytes:0};
                const cache=this.psdPaints,key=`${layer.image.guid}:${layer.image.localId||''}`;
                if(cache.document===draft&&!cache.images.has(key)){
                  // Share worker PNGs across image and text layers. Approximate
                  // matches and over-budget paints stream the canonical source
                  // file, bypassing Unity GPU readback and a second PNG encode.
                  const local=!asset.visualMatch&&cache.bytes+data.png.size<=32*1024*1024;
                  cache.images.set(key,{url:local?URL.createObjectURL(data.png):sliceMedia(layer.image),revision:layer.image.revision||''});
                  if(local)cache.bytes+=data.png.size;
                }
                if(layer.role==='text')layer.sourceTextPaint={...layer.sourceTextPaint,signature:textPaintSignature(layer)};
                if(asset.visualMatch){layer.imageMode='none';fontWarnings.add('Visually similar PSD image variants share an asset.');}
              }
              if(cancelled)return;heartbeat();job.pending--;job.ready.set(sequence,layer);
              // Commit each branch in order; other branches never wait for it.
              while(job.ready.has(job.committed)){job.layers.push(job.ready.get(job.committed));importedLayers++;job.ready.delete(job.committed++);if(!job.done)w.postMessage({type:'next'});}
              updateProgress();repaint();
              status.lastElementChild.textContent=`${importedLayers} / ${totalLayers} layers imported · ${active} branches`;
              this.message(`PSD: ${importedLayers} / ${totalLayers} layers imported…`);settle();
            };
            w.onmessage=e=>{if(cancelled)return;heartbeat();const data=e.data;if(data.error){fail(Error(data.error));return;}
              if(data.type==='progress'){if(data.total!==undefined){totalLayers+=data.total-job.total;job.total=data.total;if(totalLayers>1000){fail(Error('PSD raster tiles exceed the 1000-object import limit.'));return;}updateProgress();}}
              else if(data.type==='layer')importLayer(data).catch(fail);
              else if(data.type==='done'){job.done=true;totalLayers+=job.received-job.total;job.total=job.received;for(const note of data.warnings)notes.add(note);updateProgress();settle();}
            };
            w.postMessage({type:'branch',file,fileKey:sourceFileKey,document:{width:sourceDocument.width,height:sourceDocument.height,sourceWidth:sourceDocument.sourceWidth,sourceHeight:sourceDocument.sourceHeight,records:job.records,warnings:[]}});
            // Two bounded upload slots per branch: at most six uploads in flight.
            w.postMessage({type:'next'});w.postMessage({type:'next'});
          }
        };
        worker.onerror=e=>fail(Error(e.message));
        worker.onmessage=e=>{if(cancelled)return;heartbeat();const data=e.data;if(data.error){fail(Error(data.error));return;}
          if(data.type==='progress'){status.lastElementChild.textContent='Reading PSD layer metadata…';return;}
          if(data.type!=='plan')return;
          (async()=>{
            sourceDocument=data.document;sourceFileKey=data.fileKey;worker.terminate();workers.delete(worker);for(const note of sourceDocument.warnings)notes.add(note);
            if(mode==='insert'&&before.layers.length+sourceDocument.records.length>1000)throw Error('UI documents support up to 1000 layers.');
            const byId=new Map();for(const record of sourceDocument.records){let job=byId.get(record.parentId);if(!job){job={records:[],layers:[],received:0,committed:0,pending:0,ready:new Map(),total:0};jobs.push(job);}job.records.push(record);job.total++;byId.set(record.id,job);}
            totalLayers=sourceDocument.records.length;updateProgress();draft.width=sourceDocument.width;draft.height=sourceDocument.height;this.doc=draft;this.preview=null;this.selected=new Set();this.version++;this.paintAll();this.fit();
            // Toolkit PSDs carry explicit font IDs. Preparing unrelated starter
            // fonts is unnecessary when those IDs are already registered.
            const fonts=[...new Set(sourceDocument.records.filter(r=>r.text&&!this.config.tmpFonts?.some(f=>f.key===r.text.tmpFont)&&!(!r.text.textMeshPro&&this.config.fonts?.some(f=>f.guid===r.text.fontGuid))).map(r=>r.text?.psdFontName).filter(Boolean))];if(fonts.length)fontsReady=this.api('ui-psd-fonts',{names:fonts,psdImportFolder:draft.psdImportFolder}).then(config=>{if(!cancelled)this.config=config;});
            if(cancelled)return;launch();finish();
          })().catch(fail);
        };
        this.psdCancel=()=>{if(cancelled)return;cancellationRequested=true;fail(Error('PSD import canceled. Already imported resources remain in '+draft.psdImportFolder+'.'));};
        progressDialog.oncancel=event=>{event.preventDefault();this.psdCancel?.();};
        progressDialog.onclose=()=>this.psdCancel?.();
        try{worker.postMessage({type:'read',file,plan:true});}catch(error){clearTimeout(timeout);reject(error);}
      });
      if(cancelled)throw Error('PSD import canceled.');validateDocument(draft);this.psdCancel=null;
      if(mode==='insert'){
        const merged=copy(before),ids=insertPSDDocument(merged,draft);
        if(this.psdPaints?.document===draft)this.psdPaints.document=merged;
        this.doc=merged;Object.assign(this,previous);this.selected=new Set(ids);
        this.undo=[...previous.undo,this.snapshotOf(before)];this.redo=[];
      }else{this.doc=draft;this.path='';this.revision='';this.guid='';this.selected.clear();this.undo=[];this.redo=[];}
      this.dirty=true;this.version++;this.refreshFiles();this.paintAll();if(this.autoFit)this.fit();await this.persist();this.message(`${mode==='insert'?'Inserted':'Imported'} ${draft.layers.length} PSD layers into ${draft.psdImportFolder}. Review editable text and imported fonts. ${(draft.importNotes||[]).join(' ')}`);return true;
    }catch(error){this.cancelGesture();this.doc=before;Object.assign(this,previous);this.version++;this.paintAll();this.message(cancellationRequested?error.message:error,!cancellationRequested);return false;}finally{cancelled=true;clearTimeout(layerPaintTimer);stopWorkers();this.psdCancel=null;this.busy=false;progressDialog.close();progressDialog.remove();this.right.inert=false;this.docName.readOnly=false;this.toolbar.inert=false;this.refreshFiles();this.persist();}
  }
}

export function getUIStudio(){return app;}
