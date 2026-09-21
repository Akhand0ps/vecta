import { WebSocketServer } from "ws";

interface Issue{

    id:string;
    title:string;
    section:string
}


let ISSUES:Issue[] = [
    {
        id:"1",
        title:"fix login OTP Issue",
        section:"todo"
    },
    {
        id:"2",
        title:"fix login API",
        section:"in_progress"
    },
    {
        id:"3",
        title:"deploy production",
        section:"done"
    }
];


const wss = new WebSocketServer({port:3005});
const connections:any = [];


wss.on("connection",(socket)=>{
    connections.push(socket);

    console.log("HIIIIIII");

    socket.send(JSON.stringify({
        type:"initial_issues",
        issues:ISSUES
    }))
    socket.on("message",(data)=>{
        const parsedData = JSON.parse(data.toString());

        console.log(parsedData);
        
        if(parsedData.type =="issue_added"){

            const newIssue =  {
                title:parsedData.title,
                section:parsedData.section,
                id:Math.random().toString()         
            };

            ISSUES.push(newIssue);

            connections.forEach((s:any)=>s.send(JSON.stringify({
                type:"issue_added",
                issue:newIssue
            })))
        }



        if(parsedData.type =="delete_issue"){

            

            ISSUES = ISSUES.filter(i=>i.id != parsedData.issueId);

            connections.forEach((s:any)=>s.send(JSON.stringify({
                type:"issue_deleted",
                issueId:parsedData.issueId
            })))
        }
    })
})