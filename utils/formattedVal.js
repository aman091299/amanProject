const formattedValue=(name)=>{
    if(typeof name=== 'string'){
         const formattedNameSlug = name.trim().replace(/&/g, 'and').replace(/'/g, '').replace(/\s+/g, "-").toLowerCase();
          return formattedNameSlug;
    }
   return name?.map((tag) => tag.trim().replace(/&/g, 'and').replace(/'/g, '').replace(/\s+/g, "-").toLowerCase());
       
}


module.exports={formattedValue};