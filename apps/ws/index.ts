import { WebSocketServer } from "ws";
import {prisma} from "db/client"




const wss = new WebSocketServer({port:3002})


const ROOMS:Record<string,Array<{id:number,socket:WebSocket}>> = {}

/*


{
    "1":[{"id":1,"socket":ws1},{"id":2,"socket":ws2}]
    string: array<{id:number,socket:WebSocket}>
}

*/
wss.on("connection",(socket,request)=>{
    console.log(request.headers.cookie)
    socket.on("message",(data)=>{


        const parsedData = JSON.parse(data.toString())

        if(parsedData.type == "join"){

            const boardId = parsedData.boardId


            if(!ROOMS[boardId]){
                ROOMS[boardId] = [];
            }

            const newUserId = Math.random();

           

            //now broadcast to everyone

            for(let i =0;i<ROOMS[boardId].length;i++){


                const user = ROOMS[boardId][i];
                user.socket.send(JSON.stringify({
                    type:"join",
                    id: newUserId
                }))
            }


            // push user in IN MEMORY database 
            ROOMS[boardId].push({
                id:newUserId,
                socket:socket
            })

            // USER[boardId].forEach(({socket})=>{
            //     socket.send(JSON.stringify({
            //         type:"join",
            //         userId:
            //     }))
            // })



            // send the messgage to the user
            socket.send(JSON.stringify({
                type:"initial_state",
                users: ROOMS[boardId].filter(x=> x.id != newUserId).map(u=> ({"id":u.id}))
            }))
            // ROOMS.filter(x=> x.id != newUserId).map(u=> u.id)
        }
    })

    socket.on("close",()=>{
        /*
 
        close connection 
        rooms = {
        1:[
                {userId:"u1",socket:ws1},
                {userId:"u2",socket:ws2}
        ],
        2:[
                {userId:"u4",socket:ws4},
                {userId:"u1",socket:ws1}
        ]
        }
        */
        Object.entries(ROOMS).map(([roomID,users])=>{

            //find the user, means khudko hatana hai 

            const userExists = users.find(u=>u.socket != socket);

            if(userExists){

                users = users.filter(u=>u.socket !== socket);

                //ab sabko broadcast krde. chilla ke bata de

                users.forEach(({socket})=>{
                    socket.send(JSON.stringify({
                        type:"leave",
                        id:userExists.id
                    }))
                })

            }
            


        })


    })
})