import { color } from "bun";
import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import {Routes,Route,BrowserRouter,useParams} from "react-router";
import { useEffect, useState } from "react";

import {WebSocketServer} from "ws";
import axios from "axios";

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

  const[cnt,setcnt] = useState(0);
  const[message,setmessage] = useState<string|null>(null);
  const[error,seterror] = useState<string|null>(null)



  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:3002");


    ///backend call
    


    


    ws.onopen=()=>{

      ws.send(JSON.stringify({
        type:"join",
        boardId:boardId
      }))

    }

    
    ws.onmessage=(ev)=>{
      const data = JSON.parse(ev.data);

      //@ts-ignore
      if(data.type=="initial_state"){
        setusers(data.users);
      }
      //@ts-ignore
      if(data.type == "join"){
        //@ts-ignore
        setusers(u=>[...u,{id:data.id}]);
      }
      //@ts-ignore
      if(data.type == "leave"){
        //@ts-ignore
        setusers(u=>u.filter(x=> x.id !== data.id))
      }


     
    }
    
  },[cnt])


  function sendOtp(){
    axios.post(`http://localhost:3001/auth/login`,
      {
        username:"akhandps041@gmail.com"
      }
    ).then((res)=>{
      setmessage(res.data.message);
    }).catch((error)=>{
      setmessage(error.response.data.message);
    })
  }

  function verifyotp(otp:string){


    axios.post(`http://localhost:3001/auth/verify`,
      {
        username:"akhandps041@gmail.com",
        otp:otp,
        rememberMe:true
      },
      { withCredentials: true }   // ← required for cross-origin cookies
    ).then((res)=>{
      console.log(res.data);
    }).catch((error)=>{
      seterror(error.response.data.message);
    })


  }

  return <><div>



    You are on board {boardId}
    <br />
    <br />
    <br />
    Currently active users: {JSON.stringify(users)}

    <br /><br />


    <button onClick={sendOtp}>Send Otp</button>

    <br />

    error: {error}
    <br />
    message: {message}
    
    <br />
    <input type="text" id="otp" />
    <br />
    <button onClick={() => verifyotp((document.getElementById("otp") as HTMLInputElement).value)}>verify </button>
    <br />
    <button onClick={() => setcnt(cnt + 1)}>Refresh </button>


    {/* <img src="https://vecta-s3.s3.ap-south-1.amazonaws.com/users/4a48eebd-0bf8-4b0e-a2a5-44f5d3956e5a/avatar/69760d43-48a3-4703-9f7f-09a098601470-WhatsApp%20Image%202026-08-28%20at%207.19.19%20PM.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA236IVVNP7DBXMN5D%2F20260916%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260916T201602Z&X-Amz-Expires=900&X-Amz-Signature=69ddd4aed57e73f156a3feade727cfe51264888de896f0c5a8d4373c919d2145&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject" alt="" /> */}



    {/* <br /> */}
  </div></>
}

export default App;