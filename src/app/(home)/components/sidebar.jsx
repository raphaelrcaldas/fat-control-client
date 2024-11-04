'use client';

import {
    AirplanemodeInactiveSharp,
    AirplaneTicketSharp,
    CloseSharp,
    PeopleOutlineSharp,
    SortSharp,
    HailSharp
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image'

import { useState } from "react";
import profilePic from '../../../../public/assets/1_1_gt.jpg'


const linksSide = [
    {
        title: 'Quadrinhos',
        link: '/quads',
        icon: AirplaneTicketSharp,
    },
    {
        title: 'Indisp',
        link: '/indisp',
        icon: AirplanemodeInactiveSharp,
    },
    // {
    //     title: 'Pau de Sebo',
    //     link: '/sebo',
    //     icon: SortSharp,
    // },
    {
        title: 'Tripulantes',
        link: '/trip',
        icon: HailSharp,
    },
    {
        title: 'Usuários',
        link: '/users',
        icon: PeopleOutlineSharp,
    },
]


export default function AppSideBar() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <aside className='shadow-md'>
            <div className='top'>
                <div className='logo'>
                    <Image src={profilePic} width={50} height={80} alt="bolacha OM" />
                    <h2>
                        FAT<span className='text-red-500'>CONTROL</span>
                    </h2>
                </div>
                <div>
                    <CloseSharp className='close' />
                </div>
            </div>
            <div className='sidebar'>
                {
                    linksSide.map((item, index) => {
                        return (
                            <Link
                                key={index}
                                href={item.link}
                                className={index === activeIndex ? "active" : ""}
                                onClick={() => setActiveIndex(index)}
                            >
                                <item.icon />
                                <h3>{item.title}</h3>
                            </Link>
                        )
                    })
                }
            </div>
        </aside>
    )
}
