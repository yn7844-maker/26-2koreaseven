import http from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from './api/archive.js';
const allowed = {'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{
 const url = new URL(req.url,'http://localhost');
 if(url.pathname === '/api/archive') {
  req.query=Object.fromEntries(url.searchParams);let raw='';for await(const c of req){raw+=c;if(raw.length>300000){res.writeHead(413);return res.end();}}
  try{req.body=raw?JSON.parse(raw):undefined;}catch{res.writeHead(400);return res.end();}
  res.status=n=>{res.statusCode=n;return res;};res.json=v=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(v));};return handler(req,res);
 }
 try {const file=allowed[url.pathname];if(!file)throw Error();res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.end(await readFile(new URL(file,import.meta.url)));}catch{res.writeHead(404);res.end('Not found');}
}).listen(3000,()=>console.log('http://localhost:3000'));
