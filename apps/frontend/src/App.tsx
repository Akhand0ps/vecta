import { color } from "bun";
// import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import {Routes,Route,BrowserRouter,useParams, parsePath} from "react-router";
import { useEffect, useState } from "react";

import axios from "axios";

export function App() {


  const[issues,setIssues] = useState([]);
  const[ws,setWs] = useState();

  useEffect(()=>{

    const ws = new WebSocket("ws://localhost:3005");
    setWs(ws);

    ws.onmessage = (ev)=>{

      const data = ev.data;
      const parsedData = JSON.parse(data);


      if(parsedData.type == "initial_issues"){

        setIssues(parsedData.issues)
      }

      if(parsedData.type == "issue_added"){
        setIssues(issues=>[...issues,parsedData.issue]);
      }

      if(parsedData.type =="issue_deleted"){

        setIssues(issues=>issues.filter(i=>i.id != parsedData.issueId));
      }

    }
  },[]);

  return (

    <div style={{display:"flex"}}>
      <div style={{flex:1}}>
        Todo

        <input type="text" id='todo_input' placeholder="Issue title" />

         <button onClick={()=>{
            ws.send(JSON.stringify({
              type:"issue_added",
              title:document.getElementById("todo_input")?.value,
              section:"todo"
            }))
         }}>Add Issue</button>


        {issues.filter(i=>i.section == "todo").map(issue => <Card ws={ws} id={issue.id} title={issue.title}/>)}


      </div>
      <div style={{flex:1}}>
        IN_PROGRESS

        <input type="text" id='todo_inprogress' placeholder="Issue title" />
        <button onClick={()=>{

          ws.send(JSON.stringify({
            type:"issue_added",
            title:document.getElementById("todo_inprogress")?.value,
            section:"in_progress"
          }))

         }}>Add Issue</button>

        {issues.filter(i=>i.section == "in_progress").map(issue => <Card ws={ws} id={issue.id} title={issue.title}/>)}

      </div>
      <div style={{flex:1}}>
        DONE

        <input type="text" id='todo_done' placeholder="Issue title" />
        <button onClick={()=>{

          ws.send(JSON.stringify({
            type:"issue_added",
            title:document.getElementById("todo_done")?.value,
            section:"done"
          }))

         }}>Add Issue</button>

        {issues.filter(i=>i.section == "done").map(issue => <Card ws={ws} id={issue.id} title={issue.title}/>)}

      </div>
    </div>


  )
}


function Card({title,ws,id}){

  return (

    <div style={{border:"2px solid black",padding:20,margin:20}}>
      {title}



      <button onClick={()=>{
        ws.send(JSON.stringify({
          type:"delete_issue",
          issueId:id
        }))
      }}>Delete</button>
    </div>
  )
}




export default App;