import {isStreamedPSDRaster} from './psd-reader.mjs';

// Split long ordinary branches so one screen cannot monopolize a worker while
// its peers are idle. Jobs remain in source order; the UI commits in that order.
// A streamed branch retains exclusive access to the pool for its memory budget.
export function psdImportJobs(records){
  const branches=[],owners=new Map(),parents=new Map(records.map(r=>[r.id,r]));
  for(const record of records){let branch=owners.get(record.parentId);if(!branch){branch=[];branches.push(branch);}branch.push(record);owners.set(record.id,branch);}
  const jobs=[];
  for(const branch of branches){
    if(branch.some(isStreamedPSDRaster)){jobs.push({records:branch,streamed:true});continue;}
    let chunk=[],pixels=0;
    for(const record of branch){
      const cost=record.section||record.fill?0:(record.rasterSource?.width||record.width)*(record.rasterSource?.height||record.height);
      if(chunk.length&&(chunk.length>=32||pixels+cost>8*1024*1024)){jobs.push({records:chunk,streamed:false});chunk=[];pixels=0;}
      chunk.push(record);pixels+=cost;
    }
    if(chunk.length)jobs.push({records:chunk,streamed:false});
  }
  return jobs.map(job=>{
    const local=new Set(job.records.map(r=>r.id)),ids=new Set(job.records.map(r=>r.parentId).filter(id=>id&&!local.has(id)));
    return {...job,parents:[...ids].map(id=>parents.get(id)).filter(Boolean).map(({id,x,y})=>({id,x,y}))};
  });
}
