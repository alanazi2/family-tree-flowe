import dagre from "dagre";
import type { Edge, Node } from "reactflow";
import type { SeedRow } from "./treeTypes";

const nodeWidth = 240;
const nodeHeight = 88;

export function buildFamilyTreeFromSeed(rows: SeedRow[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    nodesep: 40,
    ranksep: 90,
    marginx: 20,
    marginy: 20,
  });

  rows.forEach((row) => {
    graph.setNode(row.uid, { width: nodeWidth, height: nodeHeight });

    nodes.push({
      id: row.uid,
      type: "familyMember",
      data: {
        label: row.name,
        fatherName: row.fatherName,
        grandfatherName: row.grandfatherName,
        generation: row.generation,
      },
      position: { x: 0, y: 0 },
    });
  });

  const nameMap = new Map<string, SeedRow[]>();
  rows.forEach((row) => {
    const key = row.name.trim();
    const list = nameMap.get(key) ?? [];
    list.push(row);
    nameMap.set(key, list);
  });

  rows.forEach((row) => {
    if (!row.fatherName) return;

    const possibleParents = nameMap.get(row.fatherName.trim()) ?? [];
    let parent = possibleParents[0];

    if (row.grandfatherName) {
      const exact = possibleParents.find(
        (p) => p.name === row.fatherName && p.fatherName === row.grandfatherName
      );
      if (exact) parent = exact;
    }

    if (!parent) return;

    graph.setEdge(parent.uid, row.uid);

    edges.push({
      id: `${parent.uid}-${row.uid}`,
      source: parent.uid,
      target: row.uid,
      animated: false,
      type: "smoothstep",
    });
  });

  dagre.layout(graph);

  const laidOutNodes = nodes.map((node) => {
    const p = graph.node(node.id);
    return {
      ...node,
      position: {
        x: p.x - nodeWidth / 2,
        y: p.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: laidOutNodes, edges };
}