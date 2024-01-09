import { GetStaticProps, GetServerSideProps } from 'next'

import prisma from "../../lib/prisma";

import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

import PrimaryNavBar from '../../components/PrimaryNavBarChild'
import SecondaryNavBar from '../../components/SecondaryNavBar'
import { Container } from 'react-bootstrap';

export const getServerSideProps: GetServerSideProps = async () => {
    // export const getStaticProps: GetStaticProps = async () => {
    
        const activities = await prisma.activity.findMany({
            select: {
                username: true,
                activity_description: true,
                logs_data: true,
                date_created: true,
            },
            orderBy: {
              date_created: 'desc'
          }
        })
        
        var activitiesProp = JSON.parse(JSON.stringify(activities))
    
        return {
          props: {
            activitiesProp
          }
        }
      }
    
    export default function UseCase15({
        activitiesProp}: {
            activitiesProp: {
            username: string
            activity_description: string
            logs_data: string
            date_created: any
        }[]
        }) {
    
        return (
          <>
            <PrimaryNavBar/>
            <SecondaryNavBar />
            <Container>

            <h1 className="text-center">
            Activity log
            {/* Activity log<Badge bg="secondary">New</Badge> */}
            </h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Admin UserName</th>
                        <th>Activity Description</th>
                        <th>Logs Data</th>
                        <th>Date and Time</th>
                    </tr>
                </thead>
                <tbody>          
                    {activitiesProp.map((acti) => (
                    <tr key={acti.username}>
                        <td >{acti.username}</td>
                        <td>{acti.activity_description}</td>
                        <td>{acti.logs_data}</td>
                        <td>
                        {
                          // acti.date_created
                            acti.date_created.split("T")[0] + " " +
                            acti.date_created.split("T")[1].split(".")[0]
                        }
                        </td>
                    </tr>
                    ))}
                </tbody>
            </Table>
            </Container>
          </>
        );
      }

//@@@@@@@@@@@OLD DB WITH ADMIN_ID@@@@@@@@@@@@
// export const getServerSideProps: GetServerSideProps = async () => {
// // export const getStaticProps: GetStaticProps = async () => {
  
  //     const activityyy = await prisma.activity.findMany({
    //         select: {
//             admin_id: true,
//             activity_description: true,
//             logs_data: true,
//             date_created: true,

//             Admin: {
//                 select: {
//                     user_id: true,

//                     User: {
//                         select: {
//                             name: true,
//                         }
//                     },

//                 }
//             },

//         }
//     })
    
//     // const lala = await activityyy.text()
//     var lala = JSON.parse(JSON.stringify(activityyy))

//     return {
//       props: {
//         lala
//       }
//     }
//   }

// export default function UseCase15({
//     // activityyy}: {
//     //     activityyy: {
//     //         admin_id: string
//     //         activity_description: string
//     //         logs_data: string
//     //         // date_created: string
//     //     }[]
//     lala}: {
//         lala: {
//         admin_id: string
//         activity_description: string
//         logs_data: string
//         date_created: any
//         user_id: string
//         Admin: any
//         name: string
//     }[]
//     }) {

//     return (
//       <>
//         <h1 className="text-center">
//         Activity log
//         {/* Activity log<Badge bg="secondary">New</Badge> */}
//         </h1>
//         <Table striped bordered hover>
//             <thead>
//                 <tr>
//                     <th>#</th>
//                     <th>First Name</th>
//                     <th>Last Name</th>
//                     <th>Username</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {lala.map((acti) => (
//                 <tr key={acti.admin_id}>
//                     <td >{acti.Admin.User.name}</td>
//                     <td>{acti.activity_description}</td>
//                     <td>{acti.logs_data}</td>
//                     <td>{acti.date_created}</td>
//                 </tr>
//                 ))}
//             </tbody>
//         </Table>
//       </>
//     );
//   }