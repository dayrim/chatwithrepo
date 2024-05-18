import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import useAnalytics from "@/hooks/useAnalytics";
import useBackendClient from "@/hooks/useBackendClient";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import Message from "./Message";
import AddRepo from "./AddRepo";
import NoSSR from "@/shared/NoSSR";
import { Button } from "flowbite-react";
import useAppState from "@/hooks/useAppStore";
import RepositoryDropdown from "./RepositoryDropdown";
import { CiCirclePlus } from "react-icons/ci";
import MessageBar from "./MessageBar";

interface ChatProps {
  toggleComponentVisibility: () => void;
}
const Chat: React.FC<ChatProps> = ({ toggleComponentVisibility }) => {
  const { messagesService } = useBackendClient();
  const { setMessages,
    setShowAddRepo,
    repositories,
    userId,
    selectedChatSessionId,
    messages,
    pushMessage,
    updateMessageById } = useAppState();

  const selectedChatSession = useAppState(state => state.getSelectedChatSession());

  const fetchMessages = useCallback(async () => {
    if (!userId || !messagesService || !selectedChatSessionId) {
      return;
    }
    try {
      const { data: messages } = await messagesService.find({
        query: {
          chatSessionId: selectedChatSessionId
        },
      });
      setMessages(messages);

    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }

  }, [messagesService, selectedChatSessionId, setMessages, userId]);

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])


  useEffect(() => {
    if (!!messagesService) {
      messagesService.on('created', (message) => pushMessage(message))
      messagesService.on('patched', (message) => updateMessageById(message.id, message))
    }
  }, [messagesService, pushMessage, updateMessageById])


  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const showWelcomeMessage = useMemo(() => !Object.keys(repositories || []).length, [repositories])

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>


      <div className="flex max-w-full flex-1 flex-col">
        <div className="sticky bg-gray-800 top-0 z-10 flex items-center border-b border-white/20 bg-white-800 pl-1 pt-1 text-gray-200 sm:pl-3 md:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-gray"
            onClick={toggleComponentVisibility}
          >
            <span className="sr-only">Open sidebar</span>
            <RxHamburgerMenu className="h-6 w-6 text-gray" />
          </button>
          <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
          <button type="button" className="px-3" onClick={() => setShowAddRepo(true)}>
            <BsPlusLg className="h-6 w-6" />
          </button>
        </div>
        <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
          <div className="flex-1 overflow-hidden">
            <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full dark:bg-white-800">
              <div className="react-scroll-to-bottom--css-ikyem-1n7m0yu">
                {messages.length > 0 ? (
                  <div className="flex flex-col items-center text-sm bg-white-800">
                    <div className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
                      <NoSSR>
                        <>Repository: {selectedChatSession?.repository?.repoName ?? ""}</>
                      </NoSSR>
                    </div>
                    {messages.map((message, index) => (
                      <Message key={index} message={message} />
                    ))}
                    <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                    <div ref={bottomOfChatRef}></div>
                  </div>
                ) : null}
                {messages.length === 0 ? (
                  <div className="py-10 relative w-full flex flex-col h-full">
                    <div className="flex items-center justify-center gap-2">
                      <div className="relative w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                        <NoSSR>
                          <RepositoryDropdown />
                        </NoSSR>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 items-center justify-center h-screen">
                      {showWelcomeMessage ? (
                        <>
                          <div className="text-center">
                            <h1 className="text-2xl sm:text-4xl font-semibold text-gray-200 dark:text-gray-600 mb-4">
                              Ready to Chat with Your Repositories?
                            </h1>
                            <p className="text-md sm:text-lg text-gray-400 dark:text-gray-500 mb-6">
                              Start by adding a GitHub repository to explore its contents and chat with it. Let&apos;s get started!
                            </p>
                          </div>
                          <Button
                            size="xl"
                            color="dark"
                            outline
                            onClick={() => setShowAddRepo(true)}
                            className="flex items-center justify-center gap-4"
                          >
                            <CiCirclePlus className="h-6 w-6" />
                            Add new repository
                          </Button>
                        </>
                      ) : (
                        <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600">
                          Chat with Repositories!
                        </h1>
                      )}
                    </div>


                  </div>
                ) : null}
                <div className="flex flex-col items-center text-sm dark:bg-white-800"></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-white-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
            <MessageBar />
          </div>
        </div>
      </div>
    </>);
};

export default Chat;
