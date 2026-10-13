"""Standalone image selection and shared-source hooks for the author sync tool."""
def web_images(text):
    text="import {imageInstances,syncImageComponents} from './image-components.mjs';\nimport {pickImageFiles} from './image-picker.mjs';\n"+text
    text=text.replace('try{validateDocument(this.doc);if(!preserveGeometry)','try{syncImageComponents(this.restoreSnapshot(before),this.doc);validateDocument(this.doc);if(!preserveGeometry)')
    text=text.replace('change(value);validateDocument(this.doc);','change(value);syncImageComponents(this.restoreSnapshot(before),this.doc);validateDocument(this.doc);')
    text=text.replace("this.button(layer.image?'Replace image':'Choose project image',()=>this.assets(layer.id))","this.button(layer.image?'Replace image from files':'Choose image from files',()=>this.chooseImage(layer.id)),this.button('Browse imported images',()=>this.assets(layer.id))")
    text=text.replace("if(layer.image){image.append(el('img'","if(layer.image){image.append(el('p',{class:'ui-hint ui-image-component'},`Shared image component: ${imageInstances(this.doc,layer).length} instances. Source, tint and image mode update together; position and size stay independent.`));image.append(el('img'")
    text=text.replace('  async assets(targetId) {',"  async chooseImage(targetId) {\n    if(this.busy)return;\n    const files=await pickImageFiles();if(!files.length)return;\n    const doc=this.doc,version=this.version;this.busy=true;this.paintShell();\n    try{const asset=await this.upload(files[0]);if(doc!==this.doc||version!==this.version)throw Error('The document changed while choosing an image. Choose it again.');\n      this.busy=false;this.edit(()=>this.attach(asset,targetId));this.refreshAssetBrowsers();this.message('Updated shared image component. Undo restores all instances.');\n    }finally{this.busy=false;this.paintShell();}\n  }\n"+'  async assets(targetId) {')
    text=text.replace("'PROJECT ASSETS'","'IMAGES'")
    text=text.replace('Browse artwork in your selected workspace.','Choose existing artwork, or add image files from any folder on this device.')
    return text
