import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {openStore} from '../store.js';

test('historical order imports survive restart and can be repeated', t => {
  const dir = mkdtempSync(join(tmpdir(),'canteenx-import-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const path=join(dir,'test.sqlite'), file=join(dir,'orders.json');
  const email='verified@example.test';
  const seed=openStore(path);
  seed.prepare('INSERT INTO users (email,name,password) VALUES (?,?,?)').run(email,'Verified','unused');
  seed.close();
  const row={_id:{$oid:'order-one'},user:{$oid:'user-one'},status:'COMPLETED',date:{$date:'2025-01-01T00:00:00Z'},totalAmount:45,items:[{name:'Former dish',price:45,quantity:1}]};
  writeFileSync(file,JSON.stringify([row,{...row,_id:{$oid:'order-two'},user:{$oid:'another-user'}}]));
  const script=fileURLToPath(new URL('../import-orders.js',import.meta.url));
  for(let run=0;run<2;run++) execFileSync(process.execPath,[script,file,'user-one',email],{env:{...process.env,DATABASE_PATH:path},stdio:'pipe'});
  const db=openStore(path);
  try {
    const orders=db.prepare('SELECT * FROM orders').all();
    assert.equal(orders.length,1);assert.equal(orders[0].total,45);
    assert.equal(orders[0].status,'COMPLETED');assert.equal(JSON.parse(orders[0].items)[0].name,'Former dish');
  } finally {db.close();}
});
