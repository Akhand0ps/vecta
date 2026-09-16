import { color } from "bun";
import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import {Routes,Route,BrowserRouter,useParams} from "react-router";
import { useEffect, useState } from "react";

import {WebSocketServer} from "ws";

export function App() {
  return (
    <div>
      {/* <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo" />
        <img src={reactLogo} alt="React Logo" className="logo react-logo" />
      </div> */}

      
      <BrowserRouter>
        <Routes>

        <Route path="/board/:boardId" element={<Board/>} />
        </Routes>
      
      </BrowserRouter>
    </div>
  );
}

function Board(){


    const {boardId} = useParams();

  const[users,setusers] = useState<any>([]);
  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:3002");
    

    ws.onopen=()=>{

      ws.send(JSON.stringify({
        type:"join",
        boardId:boardId
      }))

    }

    
    ws.onmessage=(ev)=>{
      const data = JSON.parse(ev.data);


      if(data.type=="initial_state"){
        setusers(data.users);
      }
      if(data.type == "join"){

        setusers(u=>[...u,{id:data.id}]);
      }

      if(data.type == "leave"){

        setusers(u=>u.filter(x=> x.id !== data.id))
      }


     
    }
    
  },[])


  return <div>

  

    You are on board {boardId}
    <br />
    <br />
    <br />
    Currently active users: {JSON.stringify(users)}

    <br /><br />
    <br />

    <img src="https://vecta-s3.s3.ap-south-1.amazonaws.com/users/4a48eebd-0bf8-4b0e-a2a5-44f5d3956e5a/avatar/69760d43-48a3-4703-9f7f-09a098601470-WhatsApp%20Image%202026-08-28%20at%207.19.19%20PM.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA236IVVNP7DBXMN5D%2F20260916%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260916T201602Z&X-Amz-Expires=900&X-Amz-Signature=69ddd4aed57e73f156a3feade727cfe51264888de896f0c5a8d4373c919d2145&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject" alt="" />

  </div>
}

export default App;
