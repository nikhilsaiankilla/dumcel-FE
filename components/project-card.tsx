import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { EllipsisIcon, Github } from 'lucide-react'
import Link from 'next/link'
import { ProjectType } from '@/types'

const ProjectCard = ({ project }: { project: ProjectType }) => {

    return (
        <div
            key={project._id}
            className="p-4 space-y-3 border-[0.5px] border-gray-300/20 hover:border-gray-300/55 transition-all duration-200 ease-in-out bg-background/5 rounded-md shadow-sm"
        >
            <div className='w-full flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col space-y-1'>
                        <h3 className="font-semibold text-sm">{project.projectName}</h3>
                        <Link href={project.subDomain + ".localhost:3000"} target='_blank' className="text-sm text-muted-foreground">{project.subDomain + ".localhost:3000"}</Link>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <span className='p-2 rounded-lg hover:bg-gray-300/20 transition-all duration-150 ease-in-out'>
                        <EllipsisIcon />
                    </span>
                </div>
            </div>

            <div className='w-fit pl-1.5 pr-3 py-0.5 rounded-full gap-2 flex items-center justify-center bg-gray-700/50'>
                <span className='p-1.5 bg-black/50 rounded-full'>
                    <Github size={14} />
                </span>
                <Link href={project.gitUrl} target='_blank' className='text-xs text-white'>
                    {project.gitUrl.replace(/^https:\/\/(www\.)?github\.com\//, '')}
                </Link>
            </div>

            <div className='w-full'>
                <h3 className="text-sm text-muted-foreground">
                    {
                        project.updatedAt ?
                            <>
                                Updated At: {new Date(project.updatedAt).toLocaleDateString('us-en', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}</>
                            :
                            <>
                                Created At: {project.createdAt}
                            </>
                    }
                </h3>
            </div>
        </div>
    )
}

export default ProjectCard