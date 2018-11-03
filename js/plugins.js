'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"])_i["return"]();}finally{if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else{throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var REPOSITORY_URL='https://plugins.dita-ot.org/_all.json';var plugins=null;document.addEventListener('DOMContentLoaded',function(event){fetch(REPOSITORY_URL).then(function(response){return response.json();}).then(init).catch(function(err){console.error('Failed to fetch plugins: '+err);});});function init(json){plugins=json;Object.values(plugins).filter(function(plugin){return!!plugin;}).forEach(function(plugin){if(plugin.alias){}else{plugin.forEach(function(version){var buf=version.name+' '+(version.description&&version.description)+' '+(version.keywords&&version.keywords.join(' '));version.search=buf.toLocaleLowerCase().replace(/\W/g,' ').replace(/\s+/g,' ');});}});window.onpopstate=function(event){show(location.hash);};show(location.hash);}function show(hash){var content=null;if(!!hash){var _hash$substr$split=hash.substr(1).split('/'),_hash$substr$split2=_slicedToArray(_hash$substr$split,2),name=_hash$substr$split2[0],version=_hash$substr$split2[1];var pluginVersions=plugins[name].slice();pluginVersions.sort(compareVersion);content=details(pluginVersions,version)||notFound(name,version);}else{content=list(plugins);}var wrapper=document.getElementById('plugins');clear(wrapper);append(wrapper,content);}function notFound(name,version){return elem('p',!!version?'Plugin '+name+' version '+version+' not found.':'Plugin '+name+' not found.');}function filterListHandler(event){var query=event.target.value.toLocaleLowerCase().replace(/\W/g,' ').replace(/\s+/g,' ').trim();if(!!query){var found=false;document.querySelectorAll('#list > li').forEach(function(li){var plugin=plugins[li.id];if(!!plugin[0].search.match(query)){found=true;li.style.display='list-item';}else{li.style.display='none';}});document.querySelector('#empty').style.display=!found?'block':'none';}else{clearFilter();}}function clearFilter(){document.querySelectorAll('#list > li').forEach(function(li){li.style.display='list-item';});}function clearFilterHandler(event){if(event.keyCode===27){clearFilter();document.querySelector('#query').value='';document.querySelector('#empty').style.display='none';}}function filterForm(){var input=elem('input',{id:'query',type:'text',class:'form-control',placeholder:'Filter plugins',size:100},undefined);input.oninput=filterListHandler;input.onkeypress=clearFilterHandler;return input;}function list(json){return[filterForm(),elem('p',{id:'empty',style:'display: none; margin-top: 1em',class:'alert alert-info'},'No matches found.'),elem('ul',{class:'list-unstyled',id:'list'},Object.values(json).filter(function(plugin){return!!plugin&&!plugin.alias;}).sort(function(a,b){return a[0].name.localeCompare(b[0].name);}).map(function(plugin){return plugin[0];}).map(function(first){return elem('li',{id:first.name},[elem('h3',elem('a',{href:'#'+first.name},first.name)),elem('p',first.description),elem('p',(first.keywords||[]).flatMap(function(keyword){return[elem('code',{class:'small'},keyword),' \xA0'];}))]);}))];}function details(versions,version){var first=!!version?versions.find(function(plugin){return plugin.vers===version;}):versions[0];if(!first){return null;}var div=document.createElement('div');div.appendChild(elem('h2',[''+first.name,elem('small',' '+first.vers)]));if(!!first.description){append(div,elem('p',{class:'shortdesc'},first.description));}if(!!first.keywords&&first.keywords.length!==0){append(div,[elem('h3','Keywords'),elem('p',first.keywords.flatMap(function(keyword){return[elem('code',keyword),' \xA0'];}))]);}if(!!first.license){append(div,[elem('h3','License'),elem('p',license(first.license))]);}if(!!first.homepage){append(div,[elem('h3','Homepage'),elem('p',elem('a',{href:first.homepage},getDomain(first.homepage)))]);}append(div,[elem('h3','Install'),elem('p',{class:'small'},'DITA-OT 3.2 and newer'),elem('pre','dita --install '+first.name),elem('p',{class:'small'},'DITA-OT 3.1 and older'),elem('pre','dita --install '+first.url)]);var deps=first.deps;deps.sort(function(a,b){return a.name.localeCompare(b.name);});append(div,[elem('h3','Dependencies'),elem('ul',deps.filter(function(dep){return dep.name==='org.dita.base';}).map(function(dep){return elem('li','DITA-OT '+(humanReadableVersion(dep.req)||''));})),elem('ul',deps.filter(function(dep){return dep.name!=='org.dita.base';}).map(function(dep){return elem('li',dep.name+' '+(humanReadableVersion(dep.req)||''));}))]);append(div,[elem('h3','Versions'),elem('ul',versions.map(function(version){return elem('li',elem('a',{href:'#'+first.name+'/'+version.vers},version.vers));}))]);return div;}function license(spdx){switch(spdx){case'Apache-2.0':return elem('a',{href:'https://www.apache.org/licenses/LICENSE-2.0'},'Apache License 2.0');case'MIT':return elem('a',{href:'https://opensource.org/licenses/MIT'},'MIT License');case'UNLICENSED':return'Unlicensed';default:return spdx;}}function humanReadableVersion(version){if(version.startsWith('=')){return''+version.substr(1);}else if(version.startsWith('>=')){return version.substr(2)+' or newer';}else if(version.startsWith('<=')){return version.substr(2)+' or older';}return version;}function elem(){var name=arguments[0];var attrs=arguments.length===3?arguments[1]:{};var content=arguments.length===3?arguments[2]:arguments[1];var installBlock=document.createElement(name);Object.keys(attrs).forEach(function(key){installBlock.setAttribute(key,attrs[key]);});append(installBlock,content);return installBlock;}function append(parent,content){if(content===undefined||content===null){return;}switch(typeof content==='undefined'?'undefined':_typeof(content)){case'string':parent.appendChild(document.createTextNode(content));break;case'object':if(Array.isArray(content)){content.forEach(function(c){append(parent,c);});break;}default:parent.appendChild(content);}}function getDomain(homepage){return homepage.replace(/^\w+:\/\/([^\/]+?)(\/.*)?$/,'$1');}function clear(myNode){while(myNode.firstChild){myNode.removeChild(myNode.firstChild);}}function compareVersion(a,b){function parse(v){return v.split('.').map(function(v){return Number.parseInt(v);});}function compare(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:0;var b=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;if(a===b){return 0;}else if(a<b){return 1;}else{return-1;}}function zip(as,bs){return as.map(function(e,i){return[e,bs[i]];});}try{var as=parse(a);var bs=parse(b);return zip(as,bs).map(function(pair){return compare(pair[0],pair[1]);}).reduce(function(acc,curr){return acc!==0?acc:curr;},0);}catch(e){return 0;}}