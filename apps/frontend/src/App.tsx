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

  </div>
}

export default App;
