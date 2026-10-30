import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/archive.js';
const originalFetch=globalThis.fetch;
const originalEnv={...process.env};
const memory=new Map();
function request(method,body,password='a-long-admin-password'){
 const req={method,body,headers:{authorization:`Bearer ${password}`},query:{}};
 const res={headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}};
 return handler(req,res).then(()=>res);
}
beforeEach(()=>{
 process.env.UPSTASH_REDIS_REST_URL='https://test.invalid';process.env.UPSTASH_REDIS_REST_TOKEN='test-token';process.env.ADMIN_PASSWORD='a-long-admin-password';memory.clear();
 globalThis.fetch=async(url,opts)=>{const [cmd,,key,value]=JSON.parse(opts.body);let result;if(cmd==='HVALS')result=[...memory.values()];if(cmd==='HGET')result=memory.get(key)||null;if(cmd==='HSET'){memory.set(key,value);result=1;}if(cmd==='HDEL'){memory.delete(key);result=1;}return {ok:true,json:async()=>({result})};};
});
afterEach(()=>{globalThis.fetch=originalFetch;process.env= {...originalEnv};});
const entry=()=>({title:'테스트 기록',category:'학습·실험',content:'실험 결과',tags:['LLM'],status:'진행 중',pinned:true,link:'https://example.com'});
test('public read; authenticated create, update and delete preserve createdAt',async()=>{
 assert.deepEqual((await request('GET',null,'')).data.entries,[]);
 const saved=await request('POST',entry());assert.equal(saved.statusCode,200);assert.ok(saved.data.entry.id);
 const {id,createdAt}=saved.data.entry;
 assert.equal((await request('GET',null,'')).data.entries[0].content,'실험 결과');
 const updated=await request('POST',{...entry(),id,title:'수정한 기록'});assert.equal(updated.data.entry.createdAt,createdAt);assert.equal(updated.data.entry.title,'수정한 기록');assert.equal(memory.size,1);
 assert.equal((await request('DELETE',{id})).statusCode,200);assert.equal(memory.size,0);
});
test('unauthorized writes and deletes never touch storage',async()=>{
 for(const method of ['POST','DELETE']){const res=await request(method,entry(),'wrong');assert.equal(res.statusCode,401);}assert.equal(memory.size,0);
});
test('password verification does not create a record',async()=>{assert.equal((await request('POST',{action:'verify'})).statusCode,200);assert.equal(memory.size,0);});
test('reject unsafe URLs and invalid fields',async()=>{
 for(const fields of [{link:'javascript:alert(1)'},{title:''},{tags:['a'.repeat(31)]},{category:'unknown'},{content:12}])assert.equal((await request('POST',{...entry(),...fields})).statusCode,400);
 assert.equal(memory.size,0);
});
test('missing configuration fails clearly instead of pretending to save',async()=>{delete process.env.ADMIN_PASSWORD;assert.equal((await request('POST',entry())).statusCode,503);});
test('storage failures return a recoverable error',async()=>{globalThis.fetch=async()=>{throw Error('offline');};const res=await request('POST',entry());assert.equal(res.statusCode,502);assert.match(res.data.error,/연결/);});
