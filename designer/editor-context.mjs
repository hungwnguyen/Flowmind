export const editorTabId=crypto.randomUUID();
export function captureIdentity(studio){return {tabId:editorTabId,path:studio.path||'',revision:studio.revision||'',draftVersion:studio.version||0};}
export function matchesCapture(studio,request){
  const current=captureIdentity(studio);
  return (!request.tabId||request.tabId===current.tabId)&&(!request.path||request.path===current.path);
}
export function validateCaptureIdentity(studio,request){
  const current=captureIdentity(studio);
  if(!matchesCapture(studio,request)||request.revision!==undefined&&(request.revision!==current.revision||studio.dirty)&&request.draftVersion===undefined
    ||request.draftVersion!==undefined&&request.draftVersion!==current.draftVersion)
    throw Error('The requested UI document/version differs from this browser draft. Read its context and capture again.');
  if(request.revision!==undefined&&request.revision!==current.revision)throw Error('The saved UI revision changed. Read its context and capture again.');
  return current;
}
