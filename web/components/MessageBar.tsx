import useAnalytics from '@/hooks/useAnalytics';
import { useAppState } from '@/hooks/useAppStore';
import useAutoResizeTextArea from '@/hooks/useAutoResizeTextArea';
import useRepository from '@/hooks/useRepository';
import useServices from '@/hooks/useServices';
import { generateContent } from '@/pages/api/gemini';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi';


const MessageBar = () => {

    const { getRepositoryData } = useRepository();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");
    const { trackEvent } = useAnalytics();
    const bottomOfChatRef = useRef<HTMLDivElement>(null);
    const { messagesService, chatSessionsService } = useServices();
    const {
        selectedRepository,
        userId,
        repositories,
        setShowSubscription,
        selectedChatSessionId,
        messages, } = useAppState();

    const selectedChatSession = useAppState(state => state.getSelectedChatSession());

    const showWelcomeMessage = useMemo(() => !Object.keys(repositories || []).length, [repositories])

    const textAreaRef = useAutoResizeTextArea();
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
    }, [messages]);

    const sendMessage = useCallback(async (e: any) => {
        e.preventDefault();
        if (!userId || !messagesService || !selectedChatSessionId || !chatSessionsService) {
            return;
        }
        if (!selectedChatSession?.repositoryPath) {
            chatSessionsService.patch(selectedChatSessionId, { repositoryPath: selectedRepository })
        }
        // Don't send empty messages
        if (message.length < 1) {
            setErrorMessage("Please enter a message.");
            return;
        } else {
            setErrorMessage("");
        }

        trackEvent("send.message", { message: message });
        setIsLoading(true);

        try {
            const repositoryData = await getRepositoryData();

            await messagesService.create({ text: message, userId, role: "user", chatSessionId: selectedChatSessionId });
            setMessage("");

            await generateContent({
                history: messages,
                repositoryData,
                chatSessionId: selectedChatSessionId,
                message,
                userId
            });

            setIsLoading(false);
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message);
            setIsLoading(false);
            if (error.message.includes('No attempts left')) {
                setShowSubscription(true)
            }
        }
    }, [chatSessionsService, getRepositoryData, message, messages, messagesService, selectedChatSession?.repositoryPath, selectedChatSessionId, selectedRepository, setShowSubscription, trackEvent, userId])


    const handleKeypress = (e: any) => {
        // It's triggers by pressing the enter key
        if (e.keyCode == 13 && !e.shiftKey) {
            sendMessage(e);
            e.preventDefault();
        }
    };
    return (
        <>
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
        </>
    )
}

export default MessageBar