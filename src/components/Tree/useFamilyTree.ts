import dagre from "dagre";
import type { Edge, Node } from "reactflow";
import type { Person, Relationship } from "./treeTypes";

export function buildChildrenMap(rels: Relationship[]) {
  const map = new Map<string, string[]>();
  for (const r of rels) {
    const arr = map.get(r.parent_id) ?? [];
    arr.push(r.child_id);
    map.set(r.parent_id, arr);
  }
  return map;
}

export function findRoots(persons: Person[], rels: Relationship[]) {
  const children = new Set(rels.map((r) => r.child_id));
  return persons.filter((p) => !children.has(p.id));
}

export function toNodesEdges(persons: Person[], rels: Relationship[]) {
  const nodes: Node[] = persons.map((p) => ({
    id: p.id,
    type: "member",
    position: { x: 0, y: 0 },
    data: p,
  }));

  const edges: Edge[] = rels.map((r) => ({
    id: r.id,
    source: r.parent_id,
    target: r.child_id,
    animated: true,
  }));

  return { nodes, edges };
}

export function layoutDagre(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 70 });

  nodes.forEach((n) => g.setNode(n.id, { width: 190, height: 84 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    n.position = { x: pos.x - 95, y: pos.y - 42 };
    return n;
  });
}