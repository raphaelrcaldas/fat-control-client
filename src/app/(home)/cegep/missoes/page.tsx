"use client";

import { TabItem, Tabs } from "flowbite-react";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoMdPaper } from "react-icons/io";
import { RegisPage } from "./registros/register";
import { FilterPage } from "./pagamentos/filterPage";
import { useState } from "react";
import { FilterProvider } from "../context/filterContext";
import { RegisterProvider } from "../context/registerContext";

export default function MissPage() {
   const [activeTab, setActiveTab] = useState(0);

   return (
      <Tabs
         aria-label='Default tabs'
         variant='default'
         onActiveTabChange={setActiveTab}
      >
         <TabItem active={activeTab === 0} title='Registros' icon={IoMdPaper}>
            <RegisterProvider>
               <RegisPage />
            </RegisterProvider>
         </TabItem>

         <TabItem
            active={activeTab === 1}
            title='Pagamentos'
            icon={MdOutlineAttachMoney}
         >
            <FilterProvider>
               <FilterPage active={activeTab === 1} />
            </FilterProvider>
         </TabItem>
      </Tabs>
   );
}
