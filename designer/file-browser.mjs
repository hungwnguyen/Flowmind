import {html as el} from './dom-controls.mjs';

// Files chrome is shared by both editors; document loading stays with its owner.
export function fileBrowser({root,mode,icon,onSwitch,onOpen,actions,filters=[],ids={},onFilter}) {
  root.classList.add('studio-files');
  root.dataset.fileMode=mode;
  const switcher=el('div',{class:'studio-switcher',role:'group','aria-label':'Editor mode'});
  for(const [value,label,glyph] of [['graph','Flow Editor','flow'],['ui','UI Designer','frame']]) {
    const button=el('button',{type:'button','aria-label':label,'aria-pressed':String(value===mode),title:`${value===mode?'Current mode:':'Switch to'} ${label}`,onclick:()=>{if(value!==mode)onSwitch(value);}});
    button.append(icon(glyph),el('span',{},label));switcher.append(button);
  }
  const controls=el('div',{class:'file-browser-controls'});
  const search=el('input',{type:'search',id:ids.search,placeholder:'Search files','aria-label':'Search files',oninput:()=>paint()});
  const searchField=el('label',{class:'search-field'});searchField.append(icon('search'),search);
  const tools=el('div',{class:'file-browser-actions'});
  for(const action of actions) {
    const button=el('button',{type:'button',id:action.id,class:'file-browser-action'+(action.primary?' primary':''),'aria-label':action.label,title:action.title||action.label,onclick:action.run});
    button.append(icon(action.icon),el('span',{},action.label));tools.append(button);
  }
  controls.append(searchField,tools);
  const filterRow=el('div',{class:'file-type-filters',role:'group','aria-label':'Graph file type'});
  let filter='all';
  for(const item of filters) {
    const button=el('button',{type:'button','data-file-type':item.value,title:item.label,onclick:()=>{filter=item.value;onFilter?.(filter);paint();}});
    button.append(icon(item.icon),el('span',{},item.label));filterRow.append(button);
  }
  const heading=el('div',{class:'file-browser-heading'}),count=el('span',{class:'file-browser-count',role:'status','aria-label':'File count'});
  heading.append(el('span',{class:'section-caption'},mode==='ui'?'UI DOCUMENTS':'PROJECT GRAPHS'),count);
  const list=el('div',{id:ids.list,class:'file-browser-list','aria-label':mode==='ui'?'UI documents':'Graph files'});
  root.replaceChildren(controls,...(filters.length?[filterRow]:[]),heading,list);
  let documents=[],current='';
  function paint() {
    const query=search.value.trim().toLocaleLowerCase();
    const matches=documents.filter(item=>(filter==='all'||item.type===filter)&&(!query||`${item.name}\n${item.path}`.toLocaleLowerCase().includes(query)));
    for(const button of filterRow.children)button.setAttribute('aria-pressed',String(button.dataset.fileType===filter));
    count.textContent=String(matches.length);
    list.replaceChildren();
    for(const item of matches) {
      const active=item.path===current;
      const row=el('button',{type:'button',class:'file-row'+(active?' active':''),title:item.path,'aria-label':'Open '+item.name,'aria-current':active?'page':undefined,onclick:()=>onOpen(item)});
      const glyph=el('span',{class:'file-glyph','data-kind':item.type});glyph.append(icon(item.type==='mock_flow_graph'?'flow':'frame'));
      const copy=el('span',{class:'file-copy'}),folder=item.path.startsWith('draft:')?'Local draft':item.path.slice(0,item.path.lastIndexOf('/'));
      const folderLabel=mode==='ui'?folder.replace(/^Assets\/VinaGen PSD Imports\//,'PSD imports / ').replace(/^Assets\/VinaGen AI Toolkit\//,''):folder;
      copy.append(el('strong',{},item.name),el('small',{},(item.isDraft?'Unsaved · ':'')+(mode==='ui'?'UI document':item.type==='mock_flow_graph'?'Flow graph':'Design graph')),el('span',{class:'file-folder',title:folder},folderLabel));
      row.append(glyph,copy);
      if(active)row.append(el('span',{class:'file-current','aria-hidden':'true'}));
      list.append(row);
    }
    if(!matches.length) {
      const empty=el('div',{class:'file-browser-empty'});
      empty.append(icon(query?'search':'folder'),el('strong',{},query?'No matching files':documents.length?'No files of this type':mode==='ui'?'No UI documents yet':'No graphs yet'),el('p',{},query?'Try another name or folder.':documents.length?'Choose another file type.':mode==='ui'?'Create a screen or import your design.':'Create a graph to get started.'));
      if(query)empty.append(el('button',{type:'button',onclick:()=>{search.value='';paint();search.focus();}},'Clear search'));
      list.append(empty);
    }
  }
  return {search,refresh(items,path,type=filter){documents=items||[];current=path;filter=type;paint();}};
}
