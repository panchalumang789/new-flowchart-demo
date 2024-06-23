import React, { useEffect, useState } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import "./styles.css";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./utils.jsx";
import AddUserDialog from "./components/AddUserDialog/index.jsx";
import {
  logoutUser,
  selectActiveUser,
} from "../_features/account/accountSlice.js";
import { useDispatch, useSelector } from "react-redux";
import LoginDialog from "./components/LoginDialog/index.jsx";
import {
  activateLoading,
  createUser,
  deActivateLoading,
  getAllUserData,
  getAllUsers,
  getUsersStatus,
  updateUser,
} from "../_features/users/usersSlice.js";
import { LoadingStatus } from "../_features/AsyncStatus.js";

const NewFlowChart = () => {
  const dispatch = useDispatch();
  const [nodes, setNodes] = useNodesState();
  const [edges, setEdges] = useEdgesState();

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openAddNewModal, setOpenAddNewModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [userModalData, setUserModalData] = useState({ predecessorId: null });

  const usersStatus = useSelector(getUsersStatus);
  const usersData = useSelector(getAllUserData);
  const activeUser = useSelector(selectActiveUser);

  useEffect(() => {
    if (usersStatus === LoadingStatus.Idle) {
      dispatch(activateLoading());
      dispatch(getAllUsers());
      dispatch(deActivateLoading());
    }
  }, [dispatch, usersStatus]);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      usersData,
      selectedLanguage
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData, selectedLanguage]);

  const closeAddNewModal = () => {
    setOpenAddNewModal(false);
  };

  const closeLoginModal = () => {
    setOpenLoginModal(false);
  };

  const addData = async (newNodeData) => {
    await dispatch(activateLoading());
    if (userModalData.predecessorId) {
      // Create Mode
      await dispatch(
        createUser({
          predecessor: userModalData.predecessorId,
          successors: [],
          ...newNodeData,
        })
      );
    } else {
      // Edit Mode
      await dispatch(
        updateUser({
          predecessor: userModalData.predecessorId,
          ...userModalData,
          ...newNodeData,
        })
      );
    }
    setOpenAddNewModal(false);
  };

  // const getAllIncomers = (node, elements) => {
  //   return getIncomers(node, elements).reduce(
  //     (memo, incomer) => [...memo, incomer, ...getAllIncomers(incomer, elements)],
  //     []
  //   )
  // }

  // const getAllOutgoers = (node, elements) => {
  //   return getOutgoers(node, elements).reduce(
  //     (memo, outgoer) => [...memo, outgoer, ...getAllOutgoers(outgoer, elements)],
  //     []
  //   )
  // }

  // const highlightPath = (node, elements, selection) => {
  //   if (node && elements) {
  //     const allIncomers = getAllIncomers(node, elements)
  //     const allOutgoers = getAllOutgoers(node, elements)

  //     setElements((prevElements) => {
  //       return prevElements?.map((elem) => {
  //         const incomerIds = allIncomers.map((i) => i.id)
  //         const outgoerIds = allOutgoers.map((o) => o.id)

  //         if (isNode(elem) && (allOutgoers.length > 0 || allIncomers.length > 0)) {
  //           const highlight = elem.id === node.id || incomerIds.includes(elem.id) || outgoerIds.includes(elem.id)

  //           elem.style = {
  //             ...elem.style,
  //             opacity: highlight ? 1 : 0.25,
  //           }
  //         }

  //         if (isEdge(elem)) {
  //           if (selection) {
  //             const animated =
  //               incomerIds.includes(elem.source) && (incomerIds.includes(elem.target) || node.id === elem.target)
  //             elem.animated = animated

  //             elem.style = {
  //               ...elem.style,
  //               stroke: animated ? colors.blue600 : '#b1b1b7',
  //               opacity: animated ? 1 : 0.25,
  //             }
  //           } else {
  //             elem.animated = false
  //             elem.style = {
  //               ...elem.style,
  //               stroke: '#b1b1b7',
  //               opacity: 1,
  //             }
  //           }
  //         }

  //         return elem
  //       })
  //     })
  //   }
  // }

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <Box
        position="absolute"
        width="fit-content"
        right="0"
        padding="10px"
        display="flex"
        gap="10px"
        justifyContent="end"
        zIndex="2"
        backgroundColor="#ffffff"
      >
        <FormControl style={{ zIndex: 999, width: "125px" }}>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedLanguage}
            style={{ height: "45px" }}
            label="Language"
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
            }}
          >
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="gujarati">Gujarati</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          style={{ zIndex: 999 }}
          color="info"
          onClick={() => {
            activeUser?.role ? dispatch(logoutUser()) : setOpenLoginModal(true);
          }}
        >
          {activeUser?.role ? "Logout" : "Login"}
        </Button>
      </Box>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          // onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}
          // onConnect={onConnect}
          // onConnectStart={onConnectStart}
          // onConnectEnd={onConnectEnd}
          nodesConnectable={false}
          zoom={true}
          fitView
          fitViewOptions={{ padding: 2 }}
          minZoom={0.1}
          maxZoom={2}
          // nodeOrigin={[0.5, 0]}
          onNodeClick={(event, element) => {
            if (activeUser?.role) {
              setUserModalData({ predecessorId: +element.id });
              setOpenAddNewModal(true);
            }
          }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          height: "1rem",
          width: "3.5rem",
          backgroundColor: "#fff",
        }}
      ></div>
      <AddUserDialog
        userData={userModalData}
        isModalOpen={openAddNewModal}
        closeModal={closeAddNewModal}
        submitData={addData}
      />
      <LoginDialog
        isModalOpen={openLoginModal}
        closeModal={closeLoginModal}
        submitData={addData}
      />
    </div>
  );
};

export { NewFlowChart };
