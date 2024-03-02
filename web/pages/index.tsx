import { useEffect, useState } from "react";
import Chat from "@/components/Chat";
import MobileSiderbar from "@/components/MobileSidebar";
import Sidebar from "@/components/Sidebar";
import useAnalytics from "@/hooks/useAnalytics";
import { feathers } from '@feathersjs/feathers'

import { MessagesData } from "../../backend/src/client";
import useAppState from "@/hooks/useAppStore";
import { createClient } from "../../backend/build/client";
import useServices from "@/hooks/useServices";







export default function Home() {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const { trackEvent } = useAnalytics();
  const { messagesService } = useServices();

  useEffect(() => {

    messagesService.on('created', (message: any) => console.log('Created a message', message))


    // const messageService = client.service('messages')

    // messageService.on('created', (message: MessagesData) => console.log('Created a message', message))
    // // Use the messages service from the server
    // messageService.create({
    //   text: 'Message from client',
    //   userId
    // })
  }, [])
  useEffect(() => {
    trackEvent("page.view", { page: "home" });
  }, [trackEvent]);

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      {isComponentVisible ? (
        <MobileSiderbar toggleComponentVisibility={toggleComponentVisibility} />
      ) : null}
      <div className="dark hidden flex-shrink-0 bg-gray-800 md:flex md:w-[260px] md:flex-col">
        <div className="flex h-full min-h-0 flex-col ">
          <Sidebar />
        </div>
      </div>
      <Chat toggleComponentVisibility={toggleComponentVisibility} />
    </main>
  );
}
