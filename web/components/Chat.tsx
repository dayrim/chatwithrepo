import { useEffect, useMemo, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { BsChevronDown, BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import useAnalytics from "@/hooks/useAnalytics";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import Message from "./Message";
import { DEFAULT_OPENAI_MODEL } from "@/shared/Constants";
import AddRepo from "./AddRepo";
import NoSSR from "@/shared/NoSSR";
import { Button, Dropdown } from "flowbite-react";
import useAppState from "@/hooks/useAppStore";
import RepositoryDropdown from "./RepositoryDropdown";
import { CiCirclePlus } from "react-icons/ci";


const Chat = (props: any) => {
  const { toggleComponentVisibility } = props;
  const { selectedRepository, setShowAddRepo, showAddRepo, repositories } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmptyChat, setShowEmptyChat] = useState(true);
  const [conversation, setConversation] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const { trackEvent } = useAnalytics();
  const textAreaRef = useAutoResizeTextArea();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const showWelcomeMessage = useMemo(() => !Object.keys(repositories || []).length, [repositories])

  const selectedModel = DEFAULT_OPENAI_MODEL;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, textAreaRef]);

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const sendMessage = async (e: any) => {
    e.preventDefault();

    // Don't send empty messages
    if (message.length < 1) {
      setErrorMessage("Please enter a message.");
      return;
    } else {
      setErrorMessage("");
    }

    trackEvent("send.message", { message: message });
    setIsLoading(true);

    // Add the message to the conversation
    setConversation([
      ...conversation,
      { content: message, role: "user" },
      { content: null, role: "system" },
    ]);

    // Clear the message & remove empty chat
    setMessage("");
    setShowEmptyChat(false);

    try {
      const response = await fetch(`/api/openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...conversation, { content: message, role: "user" }],
          model: selectedModel,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add the message to the conversation
        setConversation([
          ...conversation,
          { content: message, role: "user" },
          { content: data.message, role: "system" },
        ]);
      } else {
        console.error(response);
        setErrorMessage(response.statusText);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);

      setIsLoading(false);
    }
  };

  const handleKeypress = (e: any) => {
    // It's triggers by pressing the enter key
    if (e.keyCode == 13 && !e.shiftKey) {
      sendMessage(e);
      e.preventDefault();
    }
  };

  return (
    <>
      <NoSSR><AddRepo setOpenModal={setShowAddRepo} openModal={showAddRepo}></AddRepo></NoSSR>

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
                {!showEmptyChat && conversation.length > 0 ? (
                  <div className="flex flex-col items-center text-sm bg-white-800">
                    <div className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
                      <NoSSR>
                        <>Repository: {selectedRepository ?? ""}</>
                      </NoSSR>
                    </div>
                    {conversation.map((message, index) => (
                      <Message key={index} message={message} />
                    ))}
                    <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                    <div ref={bottomOfChatRef}></div>
                  </div>
                ) : null}
                {showEmptyChat ? (
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
                              Start by adding a GitHub repository to explore its contents and chat with it. Let's get started!
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
            <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
              <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
                {errorMessage ? (
                  <div className="mb-2 md:mb-0">
                    <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                      <span className="text-red-500 text-sm">{errorMessage}</span>
                    </div>
                  </div>
                ) : null}
                {!showWelcomeMessage && (
                  <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-gray dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                    <textarea
                      ref={textAreaRef}
                      value={message}
                      tabIndex={0}
                      data-id="root"
                      style={{
                        height: "24px",
                        maxHeight: "200px",
                        overflowY: "hidden",
                      }}
                      // rows={1}
                      placeholder="Send a message..."
                      className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeypress}
                    ></textarea>
                    <button
                      disabled={isLoading || message?.length === 0 || !selectedRepository}
                      onClick={sendMessage}
                      className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                    >
                      <FiSend className="h-4 w-4 mr-1 text-gray " />
                    </button>
                  </div>
                )}

              </div>
            </form>
          </div>
        </div>
      </div>
    </>);
};

export default Chat;
