// Large PSD rasters: bounded file reads, one scanline per channel, one tile band.
// Every output texture is <=1024 px. No whole-layer bitmap is allocated.
export const PSD_TILE_SIZE=1024;
class ChannelFile{
  constructor(blob){this.blob=blob;this.at=0;this.start=0;this.cache=new Uint8Array();}
  async read(length){
    if(!Number.isSafeInteger(length)||length<0||this.at+length>this.blob.size)throw Error('Truncated PSD channel.');
    if(this.at<this.start||this.at+length>this.start+this.cache.length){this.start=this.at;this.cache=new Uint8Array(await this.blob.slice(this.at,Math.min(this.blob.size,this.at+Math.max(65536,length))).arrayBuffer());}
    const result=this.cache.slice(this.at-this.start,this.at-this.start+length);this.at+=length;return result;
  }
}
function unpackRow(bytes,width){
  const output=new Uint8Array(width);let at=0,x=0;
  while(at<bytes.length){const n=bytes[at++];if(n===128)continue;const length=n<=127?n+1:257-n;
    if(x+length>width)throw Error('Invalid PSD RLE row.');
    if(n<=127){if(at+length>bytes.length)throw Error('Truncated PSD RLE literal.');output.set(bytes.subarray(at,at+length),x);at+=length;}
    else{if(at>=bytes.length)throw Error('Truncated PSD RLE run.');output.fill(bytes[at++],x,x+length);}x+=length;
  }
  if(x!==width)throw Error('Incomplete PSD RLE row.');return output;
}
export async function openPSDChannelRows(file,channel,width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>30000||height>30000)throw Error('Invalid PSD channel dimensions.');
  const blob=channel.bytes?new Blob([channel.bytes]):file.slice(channel.offset,channel.offset+channel.length),input=new ChannelFile(blob),header=await input.read(2),compression=(header[0]<<8)|header[1],size=width*height;
  let counts,reader,chunk=new Uint8Array(),chunkAt=0,produced=0,row=0;
  if(compression===0){if(blob.size!==size+2)throw Error('Invalid raw PSD channel.');}
  else if(compression===1){const bytes=await input.read(height*2),view=new DataView(bytes.buffer);counts=Array.from({length:height},(_,i)=>view.getUint16(i*2));if(2+height*2+counts.reduce((a,b)=>a+b,0)!==blob.size)throw Error('Invalid PSD RLE channel length.');}
  else if(compression===2||compression===3){if(typeof DecompressionStream==='undefined')throw Error('This browser cannot read ZIP-compressed PSDs. Save an RLE PSD from Photoshop.');reader=blob.slice(2).stream().pipeThrough(new DecompressionStream('deflate')).getReader();}
  else throw Error('Unsupported PSD compression.');
  return {
    async readRow(){
      if(row>=height)throw Error('PSD channel read beyond its dimensions.');let output;
      if(compression===0)output=await input.read(width);
      else if(compression===1)output=unpackRow(await input.read(counts[row]),width);
      else{
        output=new Uint8Array(width);let at=0;
        while(at<width){if(chunkAt===chunk.length){const next=await reader.read();if(next.done)throw Error('Incomplete ZIP PSD channel.');chunk=next.value;chunkAt=0;produced+=chunk.length;if(produced>size){await reader.cancel();throw Error('PSD ZIP channel exceeds its dimensions.');}}
          const n=Math.min(width-at,chunk.length-chunkAt);output.set(chunk.subarray(chunkAt,chunkAt+n),at);chunkAt+=n;at+=n;
        }
        if(compression===3)for(let x=1;x<width;x++)output[x]=(output[x]+output[x-1])&255;
      }
      row++;
      if(reader&&row===height){if(chunkAt!==chunk.length){await reader.cancel();throw Error('PSD ZIP channel exceeds its dimensions.');}for(;;){const next=await reader.read();if(next.done)break;if(next.value.length){await reader.cancel();throw Error('PSD ZIP channel exceeds its dimensions.');}}}
      return output;
    },
    async close(){if(reader)await reader.cancel().catch(()=>{});},
  };
}
export async function* streamPSDTiles(file,record,onProgress=()=>{}){
  const channels=new Map(),mask=record.mask,maskChannel=record.channels.find(c=>c.id===-2);let maskReader,maskRow=-1,maskPixels;
  try{
    for(const channel of record.channels.filter(c=>[-1,0,1,2].includes(c.id)))channels.set(channel.id,await openPSDChannelRows(file,channel,record.width,record.height));
    if(mask&&!(mask.flags&2)&&maskChannel&&mask.width&&mask.height)maskReader=await openPSDChannelRows(file,maskChannel,mask.width,mask.height);
    for(let top=0;top<record.height;top+=PSD_TILE_SIZE){
      const height=Math.min(PSD_TILE_SIZE,record.height-top),tiles=[];
      try{
        for(let x=0;x<record.width;x+=PSD_TILE_SIZE){const width=Math.min(PSD_TILE_SIZE,record.width-x),canvas=new OffscreenCanvas(width,height);tiles.push({x,width,canvas,context:canvas.getContext('2d')});}
        for(let y=0;y<height;y++){
          const rows=new Map();for(const [id,channel]of channels)rows.set(id,await channel.readRow());
          const target=top+y+record.y-(mask?.y||0)-(mask?.flags&1?record.y:0);
          if(maskReader&&target>=0&&target<mask.height)while(maskRow<target){maskPixels=await maskReader.readRow();maskRow++;}
          const red=rows.get(0),green=rows.get(1),blue=rows.get(2),alphaRow=rows.get(-1);
          for(const tile of tiles){const pixels=new Uint8ClampedArray(tile.width*4);
            for(let x=0;x<tile.width;x++){const sourceX=tile.x+x,p=x*4;pixels[p]=red?.[sourceX]||0;pixels[p+1]=green?.[sourceX]||0;pixels[p+2]=blue?.[sourceX]||0;
              let alpha=alphaRow?alphaRow[sourceX]:255;
              if(maskReader){const sx=sourceX+record.x-mask.x-(mask.flags&1?record.x:0);let a=target>=0&&target<mask.height&&sx>=0&&sx<mask.width?maskPixels[sx]:mask.defaultColor;if(mask.flags&4)a=255-a;alpha=Math.round(alpha*a/255);}pixels[p+3]=alpha;
            }
            tile.context.putImageData(new ImageData(pixels,tile.width,1),0,y);
          }
          if(y%64===0)onProgress({row:top+y+1,rows:record.height});
        }
        for(const tile of tiles){const png=await tile.canvas.convertToBlob({type:'image/png'});tile.canvas.width=tile.canvas.height=1;yield {x:tile.x,y:top,width:tile.width,height,png};}
      }finally{for(const tile of tiles)tile.canvas.width=tile.canvas.height=1;}
    }
  }finally{for(const channel of channels.values())await channel.close();if(maskReader)await maskReader.close();}
}
