import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

export const getLayoutedElements = (userData, language, direction = "TB") => {
  const nodes = [];
  const edges = [];

  userData.forEach((x) => {
    if (language === "english") {
      nodes.push({
        id: x.id + "",
        data: { label: x.name },
        position: {
          x: 0,
          y: 0,
        },
        type: x.type,
      });
    } else {
      nodes.push({
        id: x.id + "",
        data: { label: x.guj_name },
        position: { x: x.id, y: x.id },
        type: x.type,
      });
    }
    x.successors.forEach((a) => {
      edges.push({ source: x.id + "", target: a });
    });
  });

  const findRelationalNodes = (connectors, activeNodeId, relational = []) => {
    const getNode = connectors.find((conn) => +conn.target === +activeNodeId);
    if (getNode) {
      relational.push(activeNodeId);
      return findRelationalNodes(connectors, +getNode.source, relational);
    }
    relational.push(activeNodeId);
    return relational;
  };

  const creatorNodeRelation = findRelationalNodes(
    edges,
    +process.env.REACT_APP_CREATOR_ID
  );

  edges.forEach((a, index) => {
    if (
      creatorNodeRelation.includes(+a.source) &&
      creatorNodeRelation.includes(+a.target)
    ) {
      // Add label props to display label name
      // edges[index].label = "true";
      edges[index].animated = true;
    }
  });

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};
