'use client';

import {
    AirplanemodeInactiveSharp,
    AirplaneTicketSharp,
    CloseSharp,
    PeopleOutlineSharp,
    SortSharp
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
    {
        title: 'Pau de Sebo',
        link: '/sebo',
        icon: SortSharp,
    },
    {
        title: 'Usuários',
        link: '/users',
        icon: PeopleOutlineSharp,
    },
]


function AppSideBar() {
    const [activeIndex, setActiveIndex] = useState(0);

    function ItemSideBar({ Icon, title, index, linkTo }) {
        const [show, setShow] = useState(activeIndex === index);

        return (
            <Link href={linkTo} className={(show ? "active" : "")} onClick={() => setActiveIndex(index)}>
                <Icon />
                <h3>{title}</h3>
            </Link>
        )
    }

    return (
        <aside>
            <div className='top'>
                <div className='logo'>
                    <Image src={profilePic} width={50} height={80}  alt="bolacha OM"/>
                    <h2>
                        FAT<span className='text-red-500'>CONTROL</span>
                    </h2>
                </div>
                <div>
                    <CloseSharp className='close' />
                </div>
            </div>
            <div className='sidebar' id='sidebar' data-index={0} >
                {linksSide.map((link, index) =>
                    <ItemSideBar Icon={link.icon} title={link.title} index={index} key={index} linkTo={link.link} />
                )}
            </div>
        </aside>
    )
}


export default AppSideBar;