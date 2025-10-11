import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProjectsTab from '@/components/projectsTab'
import DeploymentTab from '@/components/DeploymentTab'
const page = () => {

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
          <ProjectsTab />
        </TabsContent>
        <TabsContent value="Deployments">
          <DeploymentTab />
        </TabsContent>
        <TabsContent value="Subdomain">Change your password here.</TabsContent>
        <TabsContent value="Settings">Change your password here.</TabsContent>
      </Tabs>
    </div>
  )
}

export default page