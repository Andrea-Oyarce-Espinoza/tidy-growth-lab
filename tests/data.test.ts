import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dateAt,
  emptyPlan,
  initialData,
  parseBackup,
  START,
} from "../src/lib/data";
test("cada nuevo usuario empieza sin datos de Tidy Studio y acepta su propia base", () => {
  const first = emptyPlan("2026-11-05");
  const second = emptyPlan("2026-11-06");
  assert.deepEqual(first.posts, []);
  assert.equal(first.baseline.count, null);
  assert.equal(first.currentFollowers, null);
  first.baseline.count = 99;
  assert.equal(second.baseline.count, null);
  assert.equal(parseBackup(JSON.stringify(first)).baseline.count, 99);
  assert.throws(() => emptyPlan("2026-02-30"));
});
test("26 propuestas, dos por semana, dentro de los 90 días y sin resultados ficticios", () => {
  const data = initialData();
  assert.equal(data.posts.length, 26);
  assert.equal(new Set(data.posts.map((p) => p.id)).size, 26);
  assert.equal(data.currentFollowers, null);
  assert.equal(data.baseline.count, 532);
  assert.equal(dateAt(89), "2027-02-01");
  const weeks = new Map<number, number>();
  for (const post of data.posts) {
    assert.ok(post.date >= START && post.date <= dateAt(89));
    assert.equal(post.status, "idea");
    assert.ok(Object.values(post.metrics).every((v) => v === null));
    const week = Math.floor(
      (Date.parse(post.date) - Date.parse(START)) / 86400000 / 7,
    );
    weeks.set(week, (weeks.get(week) ?? 0) + 1);
  }
  assert.equal(weeks.size, 13);
  assert.ok([...weeks.values()].every((n) => n === 2));
});
test("respaldo conserva edición, métricas cero y registro manual", () => {
  const data = initialData();
  data.posts[0].title = "Mi título";
  data.posts[0].status = "publicado";
  data.posts[0].metrics.consultas = 0;
  data.posts[0].metrics.alcance = 120;
  data.currentFollowers = 540;
  data.currentFollowersDate = "2026-11-10";
  assert.deepEqual(parseBackup(JSON.stringify(data)), data);
});
test("rechaza JSON inválido, versión incompatible, duplicados, fechas imposibles y métricas negativas", () => {
  assert.throws(() => parseBackup("{"));
  for (const mutate of [
    (d: any) => (d.version = 2),
    (d: any) => d.posts.push(d.posts[0]),
    (d: any) => (d.posts[0].date = "2026-02-30"),
    (d: any) => (d.posts[0].metrics.alcance = -1),
    (d: any) => (d.currentFollowers = 533),
    (d: any) => (d.baseline.count = -1),
    (d: any) => (d.posts[0].metrics.consultas = 1.5),
  ]) {
    const data = initialData();
    mutate(data);
    assert.throws(() => parseBackup(JSON.stringify(data)));
  }
});
