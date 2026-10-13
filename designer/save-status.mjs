// Shared toolbar state for Flow, Design and UI documents.
export function paintDocumentSaveState({ save, status, unsaved, target, text = "" }) {
  unsaved = !!unsaved;
  const kind = /retained|stopped|unavailable|Preview:/.test(text)
    ? "error"
    : /Connecting|Syncing/.test(text)
      ? "syncing"
      : unsaved ? "dirty" : "saved";
  const description = kind === "error" || kind === "syncing"
    ? text
    : unsaved ? "Unsaved changes" : "All changes saved";
  save.dataset.unsaved = String(unsaved);
  save.title = (unsaved ? "Unsaved changes · " : "") + "Save " + target + " · Ctrl/Cmd+S";
  save.setAttribute("aria-description", description);
  // Keep the toolbar stable during edit sync: the save dot already marks this work.
  status.hidden = kind === "dirty" || kind === "saved" || kind === "syncing" && unsaved;
  if (status.dataset.state === kind && status.title === description) return;
  status.dataset.state = kind;
  status.title = description;
  status.setAttribute("aria-label", description);
  const label = status.ownerDocument.createElement("span");
  label.className = "sr-only";
  label.textContent = description;
  status.replaceChildren(label);
}

// Keep revision checks for existing documents; a deleted asset needs a new save target.
export async function saveUIDocumentDraft(api,choosePath,payload,recoverStyles) {
  let request=payload,pathRecovered=false,stylesRecovered=false;
  for(;;){
    try{return await api('ui-save',request);}
    catch(error){
      if(!stylesRecovered&&recoverStyles&&error.message?.includes('Text style preset is missing or is not a VinaGenTextStyle.')){
        const document=await recoverStyles(request.document);
        if(!document)return null;
        request={...request,document};stylesRecovered=true;continue;
      }
      if(pathRecovered||!request.revision||!error.message?.includes('UI document was deleted.'))throw error;
      const path=await choosePath('UI document was deleted · Save draft','Assets path',request.path);
      if(!path?.trim())return null;
      // An empty revision only creates an asset. The server still rejects existing targets.
      request={...request,path:path.trim(),revision:''};delete request.guid;pathRecovered=true;
    }
  }
}
