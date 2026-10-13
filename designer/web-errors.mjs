// Public support IDs: keep their meanings stable and document additions in error-codes.md.
export const webErrorCatalog = Object.freeze({
  'VG-WEB-1001': 'Workspace connection unavailable',
  'VG-WEB-1002': 'Invalid bridge response',
  'VG-WEB-1003': 'Session or access rejected',
  'VG-WEB-1004': 'Document revision conflict',
  'VG-WEB-1005': 'Resource not found',
  'VG-WEB-1006': 'Request timed out',
  'VG-WEB-1007': 'Upload too large',
  'VG-WEB-1008': 'Too many requests',
  'VG-WEB-1009': 'Workspace temporarily unavailable',
  'VG-WEB-1010': 'Workspace request failed',
  'VG-WEB-1011': 'Request rejected',
  'VG-WEB-2001': 'Document changed during export or capture',
  'VG-WEB-2002': 'Export size limit exceeded',
  'VG-WEB-2003': 'Text preview pending',
  'VG-WEB-2004': 'Text preview or font unavailable',
  'VG-WEB-2005': 'Image resource unavailable',
  'VG-WEB-9999': 'Unclassified web error',
});

const connectionMessage = 'A local resource could not load. Reconnect the folder or reimport the source file; your draft is retained.';
const networkFailure = /^(?:Failed to fetch|NetworkError when attempting to fetch resource\.?|Load failed|The network connection was lost\.?|Failed to execute 'fetch' on 'Window': Failed to fetch)$/i;
export function editorErrorMessage(error) {
  const text = String(error?.message ?? error ?? '');
  return networkFailure.test(text.trim()) ? connectionMessage : text;
}

function codeForStatus(status) {
  if (status === 401 || status === 403) return 'VG-WEB-1003';
  if (status === 409) return 'VG-WEB-1004';
  if (status === 404) return 'VG-WEB-1005';
  if (status === 408 || status === 504) return 'VG-WEB-1006';
  if (status === 413) return 'VG-WEB-1007';
  if (status === 429) return 'VG-WEB-1008';
  if (status === 503) return 'VG-WEB-1009';
  if (status >= 500) return 'VG-WEB-1010';
  if (status >= 400) return 'VG-WEB-1011';
}
function codeForMessage(text) {
  if (networkFailure.test(text.trim()) || text === connectionMessage) return 'VG-WEB-1001';
  if (/^Editor did not return graph data\./.test(text)) return 'VG-WEB-1002';
  if (/^The Editor session changed\./.test(text)) return 'VG-WEB-1003';
  if (/^(?:UI|The document) changed (?:during|while)/.test(text)) return 'VG-WEB-2001';
  if (/^(?:PNG|PSD) export supports up to/.test(text)) return 'VG-WEB-2002';
  if (/^(?:Workspace text preview is|Text previews are) still pending\./.test(text)) return 'VG-WEB-2003';
  if (/^(?:A (?:Workspace )?text preview failed|A text font is unavailable|A text font is unavailable for PSD export)/.test(text)) return 'VG-WEB-2004';
  if (/^(?:Capture image\/font resource|An image\/font|PSD resource|Image capture resource) (?:is unavailable|could not be read)/.test(text) || text === 'The source image cannot be decoded.') return 'VG-WEB-2005';
  return 'VG-WEB-9999';
}

// Only actual response statuses produce an HTTP label; browser/offline failures have none.
export function webErrorReport(error) {
  const raw = String(error?.message ?? error ?? 'Unknown web error.');
  const prefix = raw.match(/^\[(VG-WEB-\d{4})(?: · HTTP (\d{3}))?\]\s*/);
  const parsedStatus = Number(error?.status ?? prefix?.[2]);
  const status = Number.isInteger(parsedStatus) && parsedStatus >= 400 && parsedStatus <= 599 ? parsedStatus : undefined;
  const original = prefix ? raw.slice(prefix[0].length) : raw;
  const explicitCode = error?.code || prefix?.[1];
  const code = Object.hasOwn(webErrorCatalog, explicitCode) ? explicitCode : codeForStatus(status) || codeForMessage(original);
  const text = editorErrorMessage(original) || webErrorCatalog[code];
  const message = `[${code}${status ? ' · HTTP ' + status : ''}] ${text}`;
  const action = typeof error?.action === 'string' ? error.action.split('?')[0] : '';
  const resource = typeof error?.resource === 'string' ? error.resource.split(/[?#]/)[0] : '';
  const cause = String(error?.cause?.message ?? original);
  const details = [message, action && 'Action: ' + action, resource && 'Resource: ' + resource, cause !== text && 'Details: ' + cause].filter(Boolean).join('\n');
  return {code,status,title:webErrorCatalog[code],message,details};
}

export function createWebError(message, {code,status,action,resource,cause} = {}) {
  const error = new Error(message, cause ? {cause} : undefined);
  if (status) error.status = status;
  if (action) error.action = action.split('?')[0];
  if (resource) error.resource = String(resource).split(/[?#]/)[0];
  if (Object.hasOwn(webErrorCatalog, code)) error.code = code;
  error.code = webErrorReport(error).code;
  return error;
}

export async function fetchWebResource(url, {unavailable = 'An image/font resource is unavailable.', read = response => response.blob(), fetcher = globalThis.fetch} = {}) {
  try {
    const response = await fetcher(url);
    if (!response.ok) throw createWebError(unavailable, {status:response.status,resource:url});
    return await read(response);
  } catch (cause) {
    if (cause?.code && Object.hasOwn(webErrorCatalog, cause.code)) throw cause;
    throw createWebError(editorErrorMessage(cause), {resource:url,cause});
  }
}
