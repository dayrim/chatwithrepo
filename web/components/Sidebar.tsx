import { useAppState } from "@/hooks/useAppStore";
import useBackendClient from "@/hooks/useBackendClient";
import React, { useCallback, useEffect, useRef } from "react";
import {
  AiOutlinePlus,
} from "react-icons/ai";
import { FiMessageSquare } from "react-icons/fi";
import { MdAccountCircle, MdLogout, MdLogin } from "react-icons/md";

const Sidebar = () => {
  const isChatCreated = useRef<boolean>(false);

  const { chatSessionsService, authService } = useBackendClient();
  const {
    setChatSessions,
    chatSessions,
    setShowSignUp,
    pushChatSession,
    setSelectedChatSessionId,
    selectedChatSessionId,
    selectedRepositoryId,
    updateChatSessionById,
    setShowSignIn,
    isLoggedIn,
    setIsLoggedIn,
    userId } = useAppState();


  const handleSelectChatSession = useCallback((id: string) => {
    setSelectedChatSessionId(id);
  }, [setSelectedChatSessionId]);

  const handleCreateNewChat = useCallback(async () => {
    if (chatSessionsService && userId && selectedRepositoryId) {
      console.log(selectedRepositoryId, 'selectedRepositoryId')
      chatSessionsService.create({ title: "New Conversation", userId, repositoryId: selectedRepositoryId });

    }
  }, [chatSessionsService, selectedRepositoryId, userId]);

  const fetchChatSessions = useCallback(async () => {
    if (chatSessionsService) {
      try {
        const { data: fetchedChatSessions } = await chatSessionsService.find({
          query: {
            userId,
            $sort: {
              createdAt: -1
            },
            $limit: 10000
          }
        });
        setChatSessions(fetchedChatSessions);

        // Automatically select the first chat session if none is selected
        if (fetchedChatSessions.length > 0) {
          if (!selectedChatSessionId)
            setSelectedChatSessionId(fetchedChatSessions[0].id);
        } else {
          if (!isChatCreated.current) {
            isChatCreated.current = true;
            handleCreateNewChat();
          }

        }

      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

  }, [chatSessionsService, handleCreateNewChat, selectedChatSessionId, setChatSessions, setSelectedChatSessionId, userId]);


  useEffect(() => {
    fetchChatSessions()
  }, [fetchChatSessions])

  useEffect(() => {
    if (!!chatSessionsService) {
      chatSessionsService.on('created', (chat) => {
        setSelectedChatSessionId(chat.id)
        pushChatSession(chat);
      })
      chatSessionsService.on('patched', (chat) => {
        updateChatSessionById(chat.id, chat)
      })
    }
  }, [chatSessionsService, pushChatSession, setSelectedChatSessionId, updateChatSessionById])

  const handleLogout = useCallback(() => {
    if (authService) {
      authService.logout().then(() => {
        setIsLoggedIn(false);
      }).catch(error => console.error('Logout failed:', error));
    }
  }, [authService, setIsLoggedIn]);
  return (
    <div className="flex h-full w-full flex-1 items-start border-white/20">
      <nav className="flex h-full flex-1 flex-col space-y-1 p-2 ">
        <a onClick={() => handleCreateNewChat()} className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-gray-200 cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20">
          <AiOutlinePlus className="h-4 w-4" />
          New chat
        </a>
        <div className="flex-col flex-1 overflow-y-auto border-b border-white/20 ">
          {chatSessions.map(({ title, id }) => (
            <div key={id} className="flex flex-col gap-2 pb-2 text-gray-100 text-sm">
              <a
                onClick={() => handleSelectChatSession(id)}
                className={`flex py-3 px-3 items-center gap-3 relative rounded-md   cursor-pointer break-all  group ${id === selectedChatSessionId ? "bg-gray-700" : "hover:bg-gray-500/10"}`}
              >
                <FiMessageSquare className="h-4 w-4" />
                <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                  {title || "New Conversation"}
                </div>
              </a>
            </div>
          ))}

        </div>
        {!isLoggedIn && (
          <>
            <a onClick={() => setShowSignUp(true)}
              className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-gray-200 cursor-pointer text-sm">
              <MdAccountCircle className="h-4 w-4" />
              Sign Up
            </a>
            <a onClick={() => setShowSignIn(true)} // Use a similar handler for showing the sign-in form/modal
              className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-gray-200 cursor-pointer text-sm">
              <MdLogin className="h-4 w-4" />
              Log In
            </a>
          </>
        )}

        {isLoggedIn && (
          <a onClick={handleLogout}
            className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-gray-200 cursor-pointer text-sm">
            <MdLogout className="h-4 w-4" />
            Log out
          </a>
        )}
      </nav>
    </div >
  );
};

export default Sidebar;
