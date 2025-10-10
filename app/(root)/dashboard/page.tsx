import ProjectCard from '@/components/project-card';
import { cookies } from 'next/headers'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface ProjectType {
  _id: string,
  projectName: string,
  userId: string,
  gitUrl: string,
  subDomain: string,
  createdAt: string,
  updatedAt?: string,
}
const page = async () => {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token) return <p>unauthorized</p>

  let projects: ProjectType[] = [];

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/project/get-all-projects", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) return <p>something went wrong</p>

    const json = await res.json();

    projects = json?.data?.projects;
  } catch (error) {

  }

  return (
    <div className='w-full px-5 py-5 md:px-20 bg-background'>
      <Tabs defaultValue="Overview" className="w-full">
        <TabsList>
          <TabsTrigger value="Overview">Overview</TabsTrigger>
          <TabsTrigger value="Deployments">Deployments</TabsTrigger>
          <TabsTrigger value="Subdomain">Subdomain</TabsTrigger>
          <TabsTrigger value="Settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="Overview" >
          <div >
            {
              projects.length <= 0
                ?
                <div className='w-full flex items-center justify-center'>
                  <h1>No Projects</h1>
                </div>
                :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {
                    projects.map((project: ProjectType) => <ProjectCard project={project} key={project._id} />)
                  }
                </div>
            }
          </div>
        </TabsContent>
        <TabsContent value="Deployments">Change your password here.</TabsContent>
        <TabsContent value="Subdomain">Change your password here.</TabsContent>
        <TabsContent value="Settings">Change your password here.</TabsContent>
      </Tabs>
    </div>
  )
}

export default page