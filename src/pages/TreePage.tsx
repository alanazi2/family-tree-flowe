import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

import PageTransition from "../components/ui/PageTransition";
import FamilyMemberNode from "../components/Tree/FamilyMemberNode";
import { buildFamilyTreeFromSeed } from "../components/Tree/useFamilyTree";
import seed from "../data/almohsen-seed.json";

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

export default function TreePage() {
  const { nodes, edges } = useMemo(() => buildFamilyTreeFromSeed(seed as any), []);

  return (
    <PageTransition>
      <div>
        <h1 className="pageTitle">شجرة آل محسن</h1>
        <p className="muted">عرض رسمي لسلسلة الآباء والأبناء حسب بيانات السجل.</p>

        <div className="rfWrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap />
            <Controls />
            <Background gap={22} size={1} />
          </ReactFlow>
        </div>
      </div>
    </PageTransition>
  );
}